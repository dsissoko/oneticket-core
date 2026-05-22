/**
 * orchestrate.mjs
 *
 * [GATHER] Collecte les signaux de fin de tâche et décide de la suite.
 * Déclenché par chaque push sur une branche task/*.
 * 100% déterministe — aucun LLM impliqué.
 *
 * Responsabilités :
 *   1. Identifier l'issue et la tâche depuis le nom de la branche poussée
 *   2. Checkout de feature/issue-<N> et lecture du manifest.json
 *   3. [IDEMPOTENCE] Si tâche déjà done → sortie propre
 *   4. Merger la branche task/* dans feature/issue-<N>
 *   5. Marquer la tâche comme "done" dans le manifest
 *   6. [ROUTING DÉTERMINISTE] Décider de la suite :
 *      → tâches prêtes  : [FAN-OUT] via agent-launcher
 *      → toutes done    : créer la PR finale
 *      → en attente     : rien à faire, un prochain push déclenchera ce workflow
 *
 * [QUEUE PAR ISSUE] La sérialisation est gérée par le concurrency GitHub Actions
 * dans on-task-push.yml — ce code n'a donc pas à gérer les accès concurrents.
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, PUSHED_BRANCH (ex: task/issue-42-B), REPO
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { launchReadyTasks } from './agent-launcher.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, opts = {}) {
  console.log(`[orchestrate] $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd) {
  console.log(`[orchestrate] $ ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

/**
 * Parse le nom de la branche task/issue-<N>-<ID>.
 * Retourne { issueNumber, taskId } ou throw si format invalide.
 */
function parseBranchName(branch) {
  const match = branch.match(/^task\/issue-(\d+)-([A-Za-z0-9]+)$/);
  if (!match) {
    throw new Error(
      `Nom de branche non reconnu : "${branch}". ` +
      'Format attendu : task/issue-<N>-<ID>'
    );
  }
  return { issueNumber: match[1], taskId: match[2] };
}

/**
 * Lit le manifest.json depuis le working tree courant.
 * [SOURCE DE VÉRITÉ] Le manifest en git est l'unique état partagé entre les runs.
 */
function readManifest() {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('manifest.json introuvable dans le répertoire courant.');
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

/**
 * Écrit le manifest.json mis à jour.
 */
function writeManifest(manifest) {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * [FAN-IN check] Détermine si toutes les dépendances d'une tâche sont satisfaites.
 * Une tâche n'est prête que si TOUTES ses dépendances sont "done".
 * Exemple : D depends_on [A, B] → prête seulement quand A=done ET B=done.
 */
function areDependenciesSatisfied(task, allTasks) {
  if (!task.depends_on || task.depends_on.length === 0) return true;
  const doneIds = new Set(allTasks.filter(t => t.status === 'done').map(t => t.id));
  return task.depends_on.every(dep => doneIds.has(dep));
}

/**
 * Retourne les tâches prêtes à être lancées (pending + toutes dépendances done).
 */
function getReadyTasks(manifest) {
  return manifest.tasks.filter(
    t => t.status === 'pending' && areDependenciesSatisfied(t, manifest.tasks)
  );
}

/**
 * Crée la PR finale via l'API GitHub.
 * Appelée uniquement quand toutes les tâches sont "done".
 */
async function createFinalPR(manifest, repo, token) {
  const { issue, branch_base } = manifest;
  const title = `feat: complete all tasks for issue #${issue}`;
  const body  = [
    `Closes #${issue}`,
    '',
    '## Tâches complétées',
    ...manifest.tasks.map(t => `- [x] ${t.id} — \`${t.file}\``),
  ].join('\n');

  const url = `https://api.github.com/repos/${repo}/pulls`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      title,
      body,
      head: branch_base,
      base: 'main',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Échec création PR : ${JSON.stringify(data)}`);
  }
  console.log(`[orchestrate] PR créée : ${data.html_url}`);
  return data;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pushedBranch = process.env.PUSHED_BRANCH;
  const repo         = process.env.REPO;
  const ghToken      = process.env.GITHUB_TOKEN;

  if (!pushedBranch) throw new Error('PUSHED_BRANCH manquant');
  if (!repo)         throw new Error('REPO manquant');

  // --- 1. Parser la branche poussée (signal de fin) ------------------------
  const { issueNumber, taskId } = parseBranchName(pushedBranch);
  const featureBranch = `feature/issue-${issueNumber}`;

  console.log(`[orchestrate] Signal de fin reçu : tâche ${taskId} (issue #${issueNumber})`);

  // --- Configurer git -------------------------------------------------------
  run('git config user.name "oneticket-bot"');
  run('git config user.email "oneticket-bot@users.noreply.github.com"');

  if (ghToken) {
    run(`git remote set-url origin https://x-access-token:${ghToken}@github.com/${repo}.git`);
  }

  run('git fetch origin');
  run(`git checkout -B ${featureBranch} origin/${featureBranch}`);

  // --- 2. [GATHER] Lire le manifest — reconstitution de l'état complet -----
  const manifest = readManifest();

  const task = manifest.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Tâche "${taskId}" introuvable dans le manifest.`);
  }

  // --- 3. [IDEMPOTENCE] Tâche déjà traitée ? --------------------------------
  if (task.status === 'done') {
    console.log(`[orchestrate] IDEMPOTENCE : tâche ${taskId} déjà done — sortie sans modification.`);
    return;
  }

  // --- 4. Merger la branche task/* dans feature/ ---------------------------
  console.log(`[orchestrate] Merge de ${pushedBranch} dans ${featureBranch}`);
  run(`git merge --no-ff origin/${pushedBranch} -m "chore: merge task ${taskId} into ${featureBranch}"`);

  // --- 5. Mettre à jour le manifest ----------------------------------------
  // [SOURCE DE VÉRITÉ] Mise à jour atomique : lecture → mutation → écriture → push
  task.status = 'done';
  writeManifest(manifest);

  run('git add manifest.json');
  run(`git commit -m "chore: mark task ${taskId} as done in manifest"`);
  run(`git push origin ${featureBranch}`);

  console.log(`[orchestrate] Tâche ${taskId} marquée done.`);

  // --- 6. [ROUTING DÉTERMINISTE] Décider de la suite -----------------------
  const allDone    = manifest.tasks.every(t => t.status === 'done');
  const readyTasks = getReadyTasks(manifest);

  if (allDone) {
    // Toutes les tâches done → fin du workflow complet
    console.log('[orchestrate] Toutes les tâches sont done. Création de la PR finale.');
    await createFinalPR(manifest, repo, ghToken);

  } else if (readyTasks.length > 0) {
    // [FAN-IN → FAN-OUT] Des tâches viennent d'être débloquées par cette complétion
    // Exemple : D était bloquée par A+B, B vient de finir et A était déjà done → D est prête
    console.log(
      `[orchestrate] [FAN-IN → FAN-OUT] ${readyTasks.length} tâche(s) débloquée(s) : ` +
      readyTasks.map(t => t.id).join(', ')
    );
    await launchReadyTasks(manifest, repo, ghToken);

  } else {
    // Des tâches in_progress n'ont pas encore poussé leur signal de fin
    const inProgress = manifest.tasks.filter(t => t.status === 'in_progress');
    console.log(
      `[orchestrate] En attente des signaux de fin pour : ${inProgress.map(t => t.id).join(', ')}`
    );
  }

  console.log('[orchestrate] Orchestration terminée.');
}

main().catch(err => {
  console.error('[orchestrate] ERREUR :', err.message);
  process.exit(1);
});
