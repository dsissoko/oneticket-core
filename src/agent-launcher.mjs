/**
 * agent-launcher.mjs
 *
 * [FAN-OUT] Déclenche en parallèle toutes les tâches prêtes.
 * 100% déterministe — aucun LLM impliqué.
 *
 * Responsabilités :
 *   1. Identifier les tâches prêtes (pending + toutes dépendances done)
 *   2. [IDEMPOTENCE] Marquer toutes les tâches prêtes "in_progress" AVANT de déclencher
 *      → évite le double-lancement si agent-launcher est appelé deux fois sur le même état
 *   3. Commiter + pusher le manifest mis à jour
 *   4. [FAN-OUT] Construire le prompt de chaque tâche + déclencher agent-execute.yml
 *
 * Ce module est importé par :
 *   - init.mjs       → premier FAN-OUT (bootstrap)
 *   - orchestrate.mjs → FAN-OUT suivants (après chaque FAN-IN)
 *
 * L'exécution réelle (opencode) se fait dans agent-execute.yml.
 * Ce fichier ne fait que préparer et déclencher les workflows.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, opts = {}) {
  console.log(`[agent-launcher] $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

/**
 * [FAN-IN check] Détermine si toutes les dépendances d'une tâche sont satisfaites.
 * Dupliqué depuis orchestrate.mjs pour garder les modules indépendants.
 */
function areDependenciesSatisfied(task, allTasks) {
  if (!task.depends_on || task.depends_on.length === 0) return true;
  const doneIds = new Set(allTasks.filter(t => t.status === 'done').map(t => t.id));
  return task.depends_on.every(dep => doneIds.has(dep));
}

/**
 * Écrit le manifest depuis le working tree.
 * Le chemin est tasks/issue-<N>/manifest.json.
 */
function writeManifest(manifest) {
  const manifestPath = path.join(
    process.cwd(), 'tasks', `issue-${manifest.issue}`, 'manifest.json'
  );
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Construit le prompt complet pour une tâche bornée.
 * Toutes les informations nécessaires sont injectées directement —
 * l'agent n'a pas besoin de lire de fichier intermédiaire.
 *
 * NOTE : le "git checkout <branch>" en première action est intentionnel —
 * anomalyco détecte le changement de branche (switched=true) et désactive
 * son mécanisme automatique de push et de création de PR.
 * Sans ce checkout, anomalyco pousserait sur une branche opencode/dispatch-*
 * et créerait une PR non souhaitée.
 */
function buildTaskPrompt(task, manifest) {
  return [
    `FIRST ACTION - no exception: run bash command: git checkout ${task.branch}.`,
    `Create the file ${task.file} with this exact content: ${task.content}`,
    `Run this exact bash command (do not modify it):`,
    `echo "$(date -u '+%Y-%m-%d %H:%M') | ${task.id} | ${task.file}" >> tasks/issue-${manifest.issue}/workflow.md`,
    `Commit all changes with message: feat: complete task ${task.id}.`,
    `Do NOT push. Do NOT create a PR. Do nothing else.`,
  ].join(' ');
}

/**
 * [FAN-OUT] Déclenche le workflow agent-execute.yml via l'API GitHub (workflow_dispatch).
 * Chaque appel lance une instance isolée du workflow sur sa propre branche task/*.
 *
 * @param {object} task     - La tâche à lancer
 * @param {object} manifest - Le manifest complet (pour branch_base, issue)
 * @param {string} repo     - "owner/repo"
 * @param {string} token    - GitHub PAT
 * @param {string} ref      - Branche sur laquelle le workflow est défini (default: main)
 */
async function triggerAgentWorkflow(task, manifest, repo, token, ref = 'main') {
  const url = `https://api.github.com/repos/${repo}/actions/workflows/agent-execute.yml/dispatches`;

  const prompt = buildTaskPrompt(task, manifest);

  const inputs = {
    issue_number: String(manifest.issue),
    branch:       task.branch,
    branch_base:  manifest.branch_base,
    prompt,
  };

  console.log(`[agent-launcher] [FAN-OUT] Déclenchement agent-execute pour tâche ${task.id}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ ref, inputs }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Échec déclenchement workflow pour tâche ${task.id} : ${res.status} ${body}`
    );
  }

  console.log(`[agent-launcher] [FAN-OUT] Workflow déclenché pour tâche ${task.id}.`);
}

// ---------------------------------------------------------------------------
// Export principal
// ---------------------------------------------------------------------------

/**
 * [FAN-OUT] Identifie toutes les tâches prêtes, les marque in_progress,
 * met à jour manifest.json en git, et déclenche un workflow par tâche.
 *
 * L'ordre des opérations est intentionnel :
 *   1. Marquer in_progress (toutes) → commit → push   [AVANT de déclencher]
 *   2. Déclencher les workflows                        [APRÈS le commit]
 * → Garantit que si deux runners lisent le manifest simultanément,
 *   ils ne lancent pas deux fois les mêmes tâches.
 *
 * @param {object} manifest - L'objet manifest courant (sera muté)
 * @param {string} repo     - "owner/repo"
 * @param {string} token    - GitHub PAT
 */
export async function launchReadyTasks(manifest, repo, token) {
  const readyTasks = manifest.tasks.filter(
    t => t.status === 'pending' && areDependenciesSatisfied(t, manifest.tasks)
  );

  if (readyTasks.length === 0) {
    console.log('[agent-launcher] Aucune tâche prête à lancer.');
    return;
  }

  console.log(
    `[agent-launcher] [FAN-OUT] ${readyTasks.length} tâche(s) prête(s) : ${readyTasks.map(t => t.id).join(', ')}`
  );

  // [IDEMPOTENCE] Marquer toutes les tâches in_progress AVANT de déclencher les workflows
  for (const task of readyTasks) {
    task.status = 'in_progress';
  }

  // [SOURCE DE VÉRITÉ] Commiter l'état in_progress avant de déclencher
  writeManifest(manifest);
  run(`git add tasks/issue-${manifest.issue}/manifest.json`);
  run(
    `git commit --allow-empty -m "chore: mark tasks ${readyTasks.map(t => t.id).join(', ')} as in_progress"`
  );

  // [DOUBLE-LANCEMENT] Tenter le push. Si non fast-forward (un autre runner a gagné),
  // ne PAS déclencher les workflows — l'autre runner s'en charge.
  try {
    run(`git push origin ${manifest.branch_base}`);
  } catch (e) {
    console.log('[agent-launcher] Push non fast-forward — un autre runner a déjà lancé ces tâches. Abandon.');
    return;
  }

  // [FAN-OUT] Déclencher un workflow indépendant par tâche
  // En cas d'échec sur une tâche, on logue et on continue les suivantes
  for (const task of readyTasks) {
    try {
      await triggerAgentWorkflow(task, manifest, repo, token);
    } catch (err) {
      console.error(
        `[agent-launcher] Échec déclenchement workflow pour tâche ${task.id} : ${err.message}`
      );
    }
  }
}
