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
 *   4. [FAN-OUT] Déclencher un workflow agent-run.yml par tâche via l'API GitHub
 *
 * Ce module est importé par :
 *   - init.mjs       → premier FAN-OUT (bootstrap)
 *   - orchestrate.mjs → FAN-OUT suivants (après chaque FAN-IN)
 *
 * L'exécution réelle (opencode) se fait dans agent-run.yml.
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
 * Écrit le manifest.json depuis le working tree.
 */
function writeManifest(manifest) {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * [FAN-OUT] Déclenche le workflow agent-run.yml via l'API GitHub (workflow_dispatch).
 * Chaque appel lance une instance isolée du workflow sur sa propre branche task/*.
 *
 * @param {object} task     - La tâche à lancer
 * @param {object} manifest - Le manifest complet (pour branch_base, issue)
 * @param {string} repo     - "owner/repo"
 * @param {string} token    - GitHub PAT
 * @param {string} ref      - Branche sur laquelle le workflow est défini (default: main)
 */
async function triggerAgentWorkflow(task, manifest, repo, token, ref = 'main') {
  const url = `https://api.github.com/repos/${repo}/actions/workflows/agent-run.yml/dispatches`;

  const inputs = {
    issue_number: String(manifest.issue),
    task_id:      task.id,
    file:         task.file,
    content:      task.content,
    branch:       task.branch,
    branch_base:  manifest.branch_base,
  };

  console.log(`[agent-launcher] [FAN-OUT] Déclenchement agent-run pour tâche ${task.id} :`, inputs);

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
  // Si agent-launcher est appelé deux fois sur le même état (ex: retry),
  // la deuxième passe ne trouvera aucune tâche pending → pas de double-lancement
  for (const task of readyTasks) {
    task.status = 'in_progress';
  }

  // [SOURCE DE VÉRITÉ] Commiter l'état in_progress avant de déclencher
  // --allow-empty : après un rebase de orchestrate.mjs, le manifest peut déjà
  // être à jour — on commit quand même pour garantir un push signalant l'état
  writeManifest(manifest);
  run('git add manifest.json');
  run(
    `git commit --allow-empty -m "chore: mark tasks ${readyTasks.map(t => t.id).join(', ')} as in_progress"`
  );
  run(`git push origin ${manifest.branch_base}`);

  // [FAN-OUT] Déclencher un workflow indépendant par tâche
  // Chaque workflow s'exécute en parallèle sur sa propre branche task/issue-<N>-<ID>
  // Le push final de chaque workflow déclenche on-task-push.yml (signal GATHER)
  for (const task of readyTasks) {
    await triggerAgentWorkflow(task, manifest, repo, token);
  }
}
