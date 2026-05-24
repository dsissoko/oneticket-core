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
 * sont gérés ici avec retry sur push (backoff exponentiel + jitter).
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, PUSHED_BRANCH (ex: task/issue-42-B), REPO
 */

import path from 'path';
import { launchReadyTasks } from './agent-launcher.mjs';
import { loadConfig } from './config.mjs';
import {
  run,
  runWithRetry,
  setupGit,
  writeManifest,
  readManifest,
  areDependenciesSatisfied,
} from './utils.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';

// ---------------------------------------------------------------------------
// Helpers locaux
// ---------------------------------------------------------------------------

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
 * Retourne les tâches prêtes à être lancées (pending + toutes dépendances done).
 */
function getReadyTasks(manifest) {
  return manifest.tasks.filter(
    t => t.status === 'pending' && areDependenciesSatisfied(t, manifest.tasks)
  );
}

/**
 * [LOCK OPTIMISTE] Merge la branche task/*, marque la tâche done, push.
 * Le merge EST dans la boucle de retry — en cas de push non fast-forward,
 * on repart de l'état origin et on re-merge pour ne jamais perdre les fichiers.
 *
 * Stratégie de retry : backoff exponentiel avec jitter
 *   délai = 2^attempt * 1000ms + jitter aléatoire [0, 500ms]
 *   → réduit la contention quand beaucoup de runners retentent simultanément
 *
 * Retourne { manifest, mergeError } — mergeError non-null si merge conflict.
 */
async function markDoneAndPush(manifest, taskId, pushedBranch, featureBranch, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const task = manifest.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Tâche "${taskId}" introuvable dans le manifest.`);

    if (task.status === 'done') {
      console.log(`[orchestrate] IDEMPOTENCE (retry ${attempt}) : tâche ${taskId} déjà done.`);
      return { manifest, mergeError: null };
    }

    console.log(`[orchestrate] Merge de ${pushedBranch} dans ${featureBranch} (tentative ${attempt})`);
    try {
      run('orchestrate', `git merge --no-ff origin/${pushedBranch} -m "chore: merge task ${taskId} into ${featureBranch}"`);
    } catch (mergeError) {
      try { run('orchestrate', 'git merge --abort'); } catch (_) {}
      return { manifest, mergeError };
    }

    task.status = 'done';
    const manifestGitPath = path.join(TASKS_DIR, `issue-${manifest.issue}`, MANIFEST_FILE);
    writeManifest(manifest);
    run('orchestrate', `git add ${manifestGitPath}`);
    run('orchestrate', `git commit -m "chore: mark task ${taskId} as done in manifest"`);

    try {
      runWithRetry('orchestrate', `git push origin ${featureBranch}`);
      return { manifest, mergeError: null };
    } catch (e) {
      if (attempt === maxAttempts) throw e;

      const backoff = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
      console.log(
        `[orchestrate] Push non fast-forward (tentative ${attempt}/${maxAttempts}) — ` +
        `backoff ${backoff}ms avant re-tentative...`
      );
      await new Promise(r => setTimeout(r, backoff));

      run('orchestrate', `git reset --hard HEAD~2`);
      runWithRetry('orchestrate', `git fetch origin ${featureBranch}`);
      run('orchestrate', `git checkout -B ${featureBranch} origin/${featureBranch}`);

      manifest = readManifest(manifest.issue);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers GitHub API
// ---------------------------------------------------------------------------

async function createFinalPR(manifest, repo, token, config) {
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
    body: JSON.stringify({ title, body, head: branch_base, base: config.pr_base }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Échec création PR : ${JSON.stringify(data)}`);
  console.log(`[orchestrate] PR finale créée : ${data.html_url}`);
  return data;
}

async function ensureAndApplyLabel(issueNumber, repo, token) {
  try {
    const labelName  = 'merge error';
    const labelColor = 'b60205';

    const checkRes = await fetch(
      `https://api.github.com/repos/${repo}/labels/${encodeURIComponent(labelName)}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    );

    if (checkRes.status === 404) {
      await fetch(`https://api.github.com/repos/${repo}/labels`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
        body: JSON.stringify({ name: labelName, color: labelColor }),
      });
    }

    await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/labels`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify({ labels: [labelName] }),
    });
  } catch (err) {
    console.warn(`[orchestrate] Impossible d'appliquer le label sur #${issueNumber} : ${err.message}`);
  }
}

async function postMergeFailureComment(issueNumber, taskId, branch, featureBranch, repo, token) {
  try {
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
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify({ body }),
    });
  } catch (err) {
    console.warn(`[orchestrate] Impossible de poster le commentaire merge-failure sur #${issueNumber} : ${err.message}`);
  }
}

async function deleteRemoteBranch(branch, repo, token) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    );
    if (res.ok || res.status === 422) {
      console.log(`[orchestrate] Branche ${branch} supprimée.`);
    } else {
      console.warn(`[orchestrate] Impossible de supprimer ${branch} : HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn(`[orchestrate] Erreur réseau lors de la suppression de ${branch} : ${err.message}`);
  }
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

  const { issueNumber, taskId } = parseBranchName(pushedBranch);
  const featureBranch = `feature/issue-${issueNumber}`;

  console.log(`[orchestrate] Signal de fin reçu : tâche ${taskId} (issue #${issueNumber})`);

  const config = loadConfig();

  // Setup git + fetch avec retry réseau
  setupGit('orchestrate', config, repo, ghToken);
  run('orchestrate', `git checkout -B ${featureBranch} origin/${featureBranch}`);

  let manifest = readManifest(issueNumber);

  const task = manifest.tasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Tâche "${taskId}" introuvable dans le manifest.`);

  if (task.status === 'done' || task.status === 'merge-failed') {
    console.log(`[orchestrate] IDEMPOTENCE : tâche ${taskId} déjà en état "${task.status}" — sortie sans modification.`);
    return;
  }

  const { manifest: updatedManifest, mergeError } = await markDoneAndPush(
    manifest, taskId, pushedBranch, featureBranch, config.orchestrate_retry_max
  );
  manifest = updatedManifest;

  if (mergeError) {
    console.error(`[orchestrate] MERGE FAILURE : ${mergeError.message}`);

    task.status = 'merge-failed';
    const manifestGitPath = path.join(TASKS_DIR, `issue-${issueNumber}`, MANIFEST_FILE);
    writeManifest(manifest);
    run('orchestrate', `git add ${manifestGitPath}`);
    run('orchestrate', `git commit -m "chore: mark task ${taskId} as merge-failed"`);
    runWithRetry('orchestrate', `git push origin ${featureBranch}`);

    await ensureAndApplyLabel(issueNumber, repo, ghToken);
    await postMergeFailureComment(issueNumber, taskId, pushedBranch, featureBranch, repo, ghToken);

    console.error(`[orchestrate] Workflow arrêté — intervention humaine requise.`);
    process.exit(1);
  }

  console.log(`[orchestrate] Tâche ${taskId} marquée done et mergée dans ${featureBranch}.`);
  await deleteRemoteBranch(pushedBranch, repo, ghToken);

  const allDone    = manifest.tasks.every(t => t.status === 'done');
  const readyTasks = getReadyTasks(manifest);

  if (allDone) {
    console.log('[orchestrate] Toutes les tâches sont done. Création de la PR finale.');
    await createFinalPR(manifest, repo, ghToken, config);
  } else if (readyTasks.length > 0) {
    console.log(`[orchestrate] [FAN-IN → FAN-OUT] ${readyTasks.length} tâche(s) débloquée(s) : ${readyTasks.map(t => t.id).join(', ')}`);
    await launchReadyTasks(manifest, repo, ghToken);
  } else {
    const inProgress = manifest.tasks.filter(t => t.status === 'in_progress');
    console.log(`[orchestrate] En attente des signaux de fin pour : ${inProgress.map(t => t.id).join(', ')}`);
  }

  console.log('[orchestrate] Orchestration terminée.');
}

main().catch(err => {
  console.error('[orchestrate] ERREUR :', err.message);
  process.exit(1);
});
