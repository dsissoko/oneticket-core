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
 *      → En cas d'échec : log manifest, label "merge error", commentaire issue, exit 1
 *   5. Marquer la tâche comme "done" dans le manifest
 *   6. [ROUTING DÉTERMINISTE] Décider de la suite :
 *      → tâches prêtes  : [FAN-OUT] via agent-launcher
 *      → toutes done    : créer la PR finale
 *      → en attente     : rien, un prochain push déclenchera ce workflow
 *
 * [LOCK OPTIMISTE] Pas de concurrency GitHub Actions — les conflits d'accès au manifest
 * sont gérés ici avec retry sur push (git pull --rebase + re-push).
 * Raison : le concurrency job-level GitHub ne maintient qu'une seule place en queue —
 * deux signaux quasi-simultanés = l'un est annulé même avec cancel-in-progress: false.
 * Le retry git est plus fiable : aucun signal n'est perdu.
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, PUSHED_BRANCH (ex: task/issue-42-B), REPO
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { launchReadyTasks } from './agent-launcher.mjs';

// ---------------------------------------------------------------------------
// Helpers git
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
 * Lit le manifest.json depuis tasks/issue-<N>/manifest.json.
 * [SOURCE DE VÉRITÉ] Le manifest en git est l'unique état partagé entre les runs.
 */
function readManifest(issueNumber) {
  const manifestPath = path.join(process.cwd(), 'tasks', `issue-${issueNumber}`, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json introuvable : ${manifestPath}`);
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

/**
 * Écrit le manifest.json mis à jour dans tasks/issue-<N>/manifest.json.
 */
function writeManifest(manifest) {
  const manifestPath = path.join(process.cwd(), 'tasks', `issue-${manifest.issue}`, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * [FAN-IN check] Détermine si toutes les dépendances d'une tâche sont satisfaites.
 * Une tâche n'est prête que si TOUTES ses dépendances sont "done".
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
 * [LOCK OPTIMISTE] Marque une tâche done, met à jour le manifest et push.
 * En cas de push non fast-forward (conflit concurrent), re-lit le manifest
 * depuis origin et réapplique la mutation avant de réessayer.
 * Ainsi l'état final reflète toujours la réalité distante + la mutation locale.
 *
 * Retourne le manifest final (potentiellement re-lu depuis origin).
 */
async function markDoneAndPush(manifest, taskId, featureBranch, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Appliquer la mutation sur le manifest courant
    const task = manifest.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Tâche "${taskId}" introuvable dans le manifest.`);

    // Idempotence : si déjà done (re-lecture après conflit), sortir proprement
    if (task.status === 'done') {
      console.log(`[orchestrate] IDEMPOTENCE (retry ${attempt}) : tâche ${taskId} déjà done.`);
      return manifest;
    }

    task.status = 'done';
    writeManifest(manifest);
    run(`git add tasks/issue-${manifest.issue}/manifest.json`);
    run(`git commit -m "chore: mark task ${taskId} as done in manifest"`);

    try {
      run(`git push origin ${featureBranch}`);
      return manifest; // succès
    } catch (e) {
      if (attempt === maxAttempts) throw e;
      console.log(`[orchestrate] Push non fast-forward (tentative ${attempt}/${maxAttempts}) — re-fetch et ré-application...`);
      await new Promise(r => setTimeout(r, attempt * 1000));

      // Annuler le commit local et re-synchroniser depuis origin
      run(`git reset --hard HEAD~1`);
      run(`git fetch origin ${featureBranch}`);
      run(`git checkout -B ${featureBranch} origin/${featureBranch}`);

      // Re-lire le manifest depuis l'état origin (inclut les mutations des autres runners)
      manifest = readManifest(manifest.issue);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers GitHub API
// ---------------------------------------------------------------------------

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
  console.log(`[orchestrate] PR finale créée : ${data.html_url}`);
  return data;
}

/**
 * [MERGE FAILURE] Assure l'existence du label "merge error" sur le repo
 * et l'applique à l'issue.
 */
async function ensureAndApplyLabel(issueNumber, repo, token) {
  const [owner, repoName] = repo.split('/');
  const labelName  = 'merge error';
  const labelColor = 'b60205'; // rouge

  // Créer le label s'il n'existe pas
  const checkRes = await fetch(
    `https://api.github.com/repos/${repo}/labels/${encodeURIComponent(labelName)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (checkRes.status === 404) {
    console.log(`[orchestrate] Création du label "${labelName}"...`);
    await fetch(`https://api.github.com/repos/${repo}/labels`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ name: labelName, color: labelColor }),
    });
  }

  // Appliquer le label à l'issue
  console.log(`[orchestrate] Application du label "${labelName}" sur l'issue #${issueNumber}...`);
  await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/labels`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ labels: [labelName] }),
  });
}

/**
 * [MERGE FAILURE] Poste un commentaire de notification sur l'issue.
 */
async function postMergeFailureComment(issueNumber, taskId, branch, featureBranch, repo, token) {
  const body = [
    `## Merge failure — intervention requise`,
    '',
    `La branche \`${branch}\` (tâche **${taskId}**) n'a pas pu être mergée dans \`${featureBranch}\`.`,
    '',
    '**Action requise :** résoudre le conflit manuellement et relancer la tâche.',
    '',
    `> Statut mis à jour dans \`manifest.json\` : \`merge-failed\``,
  ].join('\n');

  await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ body }),
  });
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
  let manifest = readManifest(issueNumber);

  const task = manifest.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Tâche "${taskId}" introuvable dans le manifest.`);
  }

  // --- 3. [IDEMPOTENCE] Tâche déjà traitée ? --------------------------------
  if (task.status === 'done' || task.status === 'merge-failed') {
    console.log(`[orchestrate] IDEMPOTENCE : tâche ${taskId} déjà en état "${task.status}" — sortie sans modification.`);
    return;
  }

  // --- 4. Merger la branche task/* dans feature/ ---------------------------
  // En cas d'échec : log manifest, label "merge error", commentaire issue, exit 1
  console.log(`[orchestrate] Merge de ${pushedBranch} dans ${featureBranch}`);
  try {
    run(`git merge --no-ff origin/${pushedBranch} -m "chore: merge task ${taskId} into ${featureBranch}"`);
  } catch (mergeError) {
    console.error(`[orchestrate] MERGE FAILURE : ${mergeError.message}`);

    // Annuler le merge en cours
    try { run('git merge --abort'); } catch (_) {}

    // Mettre à jour le manifest avec merge-failed
    task.status = 'merge-failed';
    writeManifest(manifest);
    run(`git add tasks/issue-${issueNumber}/manifest.json`);
    run(`git commit -m "chore: mark task ${taskId} as merge-failed"`);
    run(`git push origin ${featureBranch}`);

    // Notifier : label + commentaire sur l'issue
    await ensureAndApplyLabel(issueNumber, repo, ghToken);
    await postMergeFailureComment(issueNumber, taskId, pushedBranch, featureBranch, repo, ghToken);

    console.error(`[orchestrate] Workflow arrêté — intervention humaine requise.`);
    process.exit(1);
  }

  // --- 5. Mettre à jour le manifest ----------------------------------------
  // [LOCK OPTIMISTE] markDoneAndPush gère les conflits concurrents :
  // en cas de push non fast-forward, il re-lit le manifest depuis origin
  // et réapplique la mutation pour garantir la cohérence de l'état final.
  manifest = await markDoneAndPush(manifest, taskId, featureBranch);

  console.log(`[orchestrate] Tâche ${taskId} marquée done et mergée dans ${featureBranch}.`);

  // --- 6. [ROUTING DÉTERMINISTE] Décider de la suite -----------------------
  const allDone    = manifest.tasks.every(t => t.status === 'done');
  const readyTasks = getReadyTasks(manifest);

  if (allDone) {
    // Toutes les tâches done → fin du workflow complet
    console.log('[orchestrate] Toutes les tâches sont done. Création de la PR finale.');
    await createFinalPR(manifest, repo, ghToken);

  } else if (readyTasks.length > 0) {
    // [FAN-IN → FAN-OUT] Des tâches viennent d'être débloquées par cette complétion
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
