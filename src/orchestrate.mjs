/**
 * orchestrate.mjs
 *
 * [GATHER] Collects task completion signals and decides what to do next.
 * Triggered by each push on a task/* branch.
 * 100% deterministic — no LLM involved.
 *
 * Responsibilities:
 *   1. Identify the issue and task from the pushed branch name
 *   2. Checkout feature/issue-<N> and read manifest.json
 *   3. [IDEMPOTENCE] If task already done → clean exit
 *   4. Merge task/* branch into feature/issue-<N>
 *      → On failure: log manifest, label "merge error", comment on issue, exit 1
 *   5. Mark the task as "done" in the manifest
 *   6. [DETERMINISTIC ROUTING] Decide what comes next:
 *      → ready tasks   : [FAN-OUT] via agent-launcher
 *      → all done      : create final PR
 *      → waiting       : nothing, a future push will trigger this workflow
 *
 * [OPTIMISTIC LOCK] No GitHub Actions concurrency — manifest access conflicts
 * are handled here with push retry (exponential backoff + jitter).
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, TASK_BRANCH (e.g. task/issue-42-B), REPO, PR_NUMBER
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
// Local helpers
// ---------------------------------------------------------------------------

/**
 * Parses the task/issue-<N>-<ID> branch name.
 * Returns { issueNumber, taskId } or throws if format is invalid.
 */
function parseBranchName(branch) {
  const match = branch.match(/^task\/issue-(\d+)-([A-Za-z0-9]+)$/);
  if (!match) {
    throw new Error(
      `Unrecognized branch name: "${branch}". ` +
      'Expected format: task/issue-<N>-<ID>'
    );
  }
  return { issueNumber: match[1], taskId: match[2] };
}

/**
 * Returns tasks ready to be launched (pending + all dependencies done).
 */
function getReadyTasks(manifest) {
  return manifest.tasks.filter(
    t => t.status === 'pending' && areDependenciesSatisfied(t, manifest.tasks)
  );
}

/**
 * [OPTIMISTIC LOCK] Merges the task/* branch, marks the task done, pushes.
 * The merge IS inside the retry loop — on non-fast-forward push,
 * we reset to origin state and re-merge to never lose files.
 *
 * Retry strategy: exponential backoff with jitter
 *   delay = 2^attempt * 1000ms + random jitter [0, 500ms]
 *   → reduces contention when many runners retry simultaneously
 *
 * Returns { manifest, mergeError } — mergeError non-null on merge conflict.
 */
async function markDoneAndPush(manifest, taskId, pushedBranch, featureBranch, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const task = manifest.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task "${taskId}" not found in manifest.`);

    if (task.status === 'done') {
      console.log(`[orchestrate] IDEMPOTENCE (retry ${attempt}): task ${taskId} already done.`);
      return { manifest, mergeError: null };
    }

    console.log(`[orchestrate] Merging ${pushedBranch} into ${featureBranch} (attempt ${attempt})`);
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
        `[orchestrate] Non-fast-forward push (attempt ${attempt}/${maxAttempts}) — ` +
        `backoff ${backoff}ms before retry...`
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
// GitHub API helpers
// ---------------------------------------------------------------------------

async function createFinalPR(manifest, repo, token, config) {
  const { issue, branch_base } = manifest;
  const title = `feat: complete all tasks for issue #${issue}`;
  const body  = [
    `Closes #${issue}`,
    '',
    '## Completed tasks',
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
  if (!res.ok) throw new Error(`Failed to create PR: ${JSON.stringify(data)}`);
  console.log(`[orchestrate] Final PR created: ${data.html_url}`);
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
    console.warn(`[orchestrate] Could not apply label on #${issueNumber}: ${err.message}`);
  }
}

async function postMergeFailureComment(issueNumber, taskId, branch, featureBranch, repo, token) {
  try {
    const body = [
      `## Merge failure — manual intervention required`,
      '',
      `Branch \`${branch}\` (task **${taskId}**) could not be merged into \`${featureBranch}\`.`,
      '',
      '**Required action:** resolve the conflict manually and re-trigger the task.',
      '',
      `> Status updated in \`manifest.json\`: \`merge-failed\``,
    ].join('\n');

    await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify({ body }),
    });
  } catch (err) {
    console.warn(`[orchestrate] Could not post merge-failure comment on #${issueNumber}: ${err.message}`);
  }
}

async function findTaskPR(taskBranch, featureBranch, repo, token) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/pulls?head=${repo.split('/')[0]}:${taskBranch}&base=${featureBranch}&state=open`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    );
    const prs = await res.json();
    if (prs.length > 0) {
      console.log(`[orchestrate] Found task PR #${prs[0].number} for ${taskBranch}`);
      return String(prs[0].number);
    }
    console.log(`[orchestrate] No open task PR found for ${taskBranch} — skipping PR close`);
    return null;
  } catch (err) {
    console.warn(`[orchestrate] Could not find task PR for ${taskBranch}: ${err.message}`);
    return null;
  }
}

async function closePR(prNumber, repo, token) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
        body: JSON.stringify({ state: 'closed' }),
      }
    );
    if (res.ok) {
      console.log(`[orchestrate] Task PR #${prNumber} closed.`);
    } else {
      console.warn(`[orchestrate] Could not close PR #${prNumber}: HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn(`[orchestrate] Network error while closing PR #${prNumber}: ${err.message}`);
  }
}

async function deleteRemoteBranch(branch, repo, token) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    );
    if (res.ok || res.status === 422) {
      console.log(`[orchestrate] Branch ${branch} deleted.`);
    } else {
      console.warn(`[orchestrate] Could not delete ${branch}: HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn(`[orchestrate] Network error while deleting ${branch}: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const taskBranch = process.env.TASK_BRANCH;
  const repo       = process.env.REPO;
  const ghToken    = process.env.GITHUB_TOKEN;
  // PR_NUMBER is optional — if not provided, orchestrate finds the task PR by branch name
  const prNumber   = process.env.PR_NUMBER || null;

  if (!taskBranch) throw new Error('TASK_BRANCH missing');
  if (!repo)       throw new Error('REPO missing');

  const { issueNumber, taskId } = parseBranchName(taskBranch);
  const featureBranch = `feature/issue-${issueNumber}`;

  console.log(`[orchestrate] Completion signal received: task ${taskId} (issue #${issueNumber})`);

  const config = loadConfig();

  // Git setup + fetch with network retry
  setupGit('orchestrate', config, repo, ghToken);
  run('orchestrate', `git checkout -B ${featureBranch} origin/${featureBranch}`);

  let manifest = readManifest(issueNumber);

  const task = manifest.tasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Task "${taskId}" not found in manifest.`);

  if (task.status === 'done' || task.status === 'merge-failed') {
    console.log(`[orchestrate] IDEMPOTENCE: task ${taskId} already in state "${task.status}" — exiting without changes.`);
    return;
  }

  const { manifest: updatedManifest, mergeError } = await markDoneAndPush(
    manifest, taskId, taskBranch, featureBranch, config.orchestrate_retry_max
  );
  manifest = updatedManifest;

  if (mergeError) {
    console.error(`[orchestrate] MERGE FAILURE: ${mergeError.message}`);

    task.status = 'merge-failed';
    const manifestGitPath = path.join(TASKS_DIR, `issue-${issueNumber}`, MANIFEST_FILE);
    writeManifest(manifest);
    run('orchestrate', `git add ${manifestGitPath}`);
    run('orchestrate', `git commit -m "chore: mark task ${taskId} as merge-failed"`);
    runWithRetry('orchestrate', `git push origin ${featureBranch}`);

    await ensureAndApplyLabel(issueNumber, repo, ghToken);
    await postMergeFailureComment(issueNumber, taskId, taskBranch, featureBranch, repo, ghToken);

    console.error(`[orchestrate] Workflow stopped — human intervention required.`);
    process.exit(1);
  }

  console.log(`[orchestrate] Task ${taskId} marked done and merged into ${featureBranch}.`);
  // Find and close the task PR (by number if provided, otherwise search by branch)
  const resolvedPrNumber = prNumber || await findTaskPR(taskBranch, featureBranch, repo, ghToken);
  if (resolvedPrNumber) {
    await closePR(resolvedPrNumber, repo, ghToken);
  }
  await deleteRemoteBranch(taskBranch, repo, ghToken);

  const allDone    = manifest.tasks.every(t => t.status === 'done');
  const readyTasks = getReadyTasks(manifest);

  if (allDone) {
    console.log('[orchestrate] All tasks done. Creating final PR.');
    await createFinalPR(manifest, repo, ghToken, config);
  } else if (readyTasks.length > 0) {
    console.log(`[orchestrate] [FAN-IN → FAN-OUT] ${readyTasks.length} unblocked task(s): ${readyTasks.map(t => t.id).join(', ')}`);
    await launchReadyTasks(manifest, repo, ghToken);
  } else {
    const inProgress = manifest.tasks.filter(t => t.status === 'in_progress');
    console.log(`[orchestrate] Waiting for completion signals from: ${inProgress.map(t => t.id).join(', ')}`);
  }

  console.log('[orchestrate] Orchestration complete.');
}

main().catch(err => {
  console.error('[orchestrate] ERROR:', err.message);
  process.exit(1);
});
