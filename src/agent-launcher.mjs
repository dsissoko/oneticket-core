/**
 * agent-launcher.mjs
 *
 * [FAN-OUT] Déclenche en parallèle toutes les tâches prêtes.
 * 100% déterministe — aucun LLM impliqué.
 *
 * Responsabilités :
 *   1. Identifier les tâches prêtes (pending + toutes dépendances done)
 *   2. [IDEMPOTENCE] Marquer toutes les tâches prêtes "in_progress" AVANT de déclencher
 *   3. Commiter + pusher le manifest mis à jour
 *   4. [FAN-OUT] Construire le prompt de chaque tâche + déclencher agent-execute.yml
 */

import path from 'path';
import { run, writeManifest, areDependenciesSatisfied, dispatchWorkflow } from './utils.mjs';
import { loadConfig } from './config.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Construit le prompt complet pour une tâche bornée.
 *
 * NOTE : le "git checkout <branch>" en première action est intentionnel —
 * anomalyco détecte le changement de branche (switched=true) et désactive
 * son mécanisme automatique de push et de création de PR.
 */
function buildTaskPrompt(task, manifest) {
  const workflowLog = path.join(TASKS_DIR, `issue-${manifest.issue}`, 'workflow.md');
  return [
    `FIRST ACTION - no exception: run bash command: git checkout ${task.branch}.`,
    `Create the file ${task.file} with this exact content: ${task.content}`,
    `Run this exact bash command (do not modify it):`,
    `echo "$(date -u '+%Y-%m-%d %H:%M') | ${task.id} | ${task.file}" >> ${workflowLog}`,
    `Commit all changes with message: feat: complete task ${task.id}.`,
    `Do NOT push. Do NOT create a PR. Do nothing else.`,
  ].join(' ');
}

// ---------------------------------------------------------------------------
// Export principal
// ---------------------------------------------------------------------------

/**
 * [FAN-OUT] Identifie toutes les tâches prêtes, les marque in_progress,
 * met à jour manifest.json en git, et déclenche un workflow par tâche.
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

  for (const task of readyTasks) {
    task.status = 'in_progress';
  }

  const manifestGitPath = path.join(TASKS_DIR, `issue-${manifest.issue}`, MANIFEST_FILE);
  writeManifest(manifest);
  run('agent-launcher', `git add ${manifestGitPath}`);
  run('agent-launcher', `git commit --allow-empty -m "chore: mark tasks ${readyTasks.map(t => t.id).join(', ')} as in_progress"`);

  // [DOUBLE-LANCEMENT] Push optimiste — si non fast-forward, l'autre runner s'en charge
  try {
    run('agent-launcher', `git push origin ${manifest.branch_base}`);
  } catch (e) {
    console.log('[agent-launcher] Push non fast-forward — un autre runner a déjà lancé ces tâches. Abandon.');
    return;
  }

  const config = loadConfig();

  // [FAN-OUT] Déclencher un workflow par tâche — continuer si une tâche échoue
  for (const task of readyTasks) {
    try {
      const prompt = buildTaskPrompt(task, manifest);
      await dispatchWorkflow('agent-execute.yml', {
        issue_number: String(manifest.issue),
        branch:       task.branch,
        branch_base:  manifest.branch_base,
        prompt,
        retry_max:    String(config.retry_max),
      }, repo, token);
      console.log(`[agent-launcher] [FAN-OUT] Workflow déclenché pour tâche ${task.id}.`);
    } catch (err) {
      console.error(`[agent-launcher] Échec déclenchement workflow pour tâche ${task.id} : ${err.message}`);
    }
  }
}
