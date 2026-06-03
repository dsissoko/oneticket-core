/**
 * dispatch-gather.mjs
 *
 * [DETERMINISTIC] Triggers the Gather workflow after a task branch is pushed.
 * Called by agent-execute.yml after the agent has committed and pushed its work.
 *
 * Uses dispatchWorkflow() from utils.mjs — same JSON API mechanism as all
 * other dispatches. Safe for all content, no shell interpolation issues.
 *
 * This is the reliable signal for the GATHER — independent of GitHub's
 * PR mergeability check, which can block pull_request triggers on conflicts.
 *
 * v1.0.0: branch_base is derived from task_branch — not passed as input.
 *   task/issue-42-A → feature/issue-42
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, REPO, TASK_BRANCH
 */

import { dispatchWorkflow } from './utils.mjs';
import { loadConfig } from './config.mjs';

async function main() {
  const repo       = process.env.REPO;
  const token      = process.env.GITHUB_TOKEN;
  const taskBranch = process.env.TASK_BRANCH;

  if (!repo)       throw new Error('REPO missing');
  if (!token)      throw new Error('GITHUB_TOKEN missing');
  if (!taskBranch) throw new Error('TASK_BRANCH missing');

  // Derive branch_base from task_branch: task/issue-42-A → feature/issue-42
  const match = taskBranch.match(/^task\/issue-(\d+)-/);
  if (!match) {
    throw new Error(`Cannot derive branch_base from task_branch: "${taskBranch}". Expected format: task/issue-<N>-<ID>`);
  }
  const branchBase = `feature/issue-${match[1]}`;

  const config = loadConfig();

  console.log(`[dispatch-gather] Triggering Gather for ${taskBranch} → ${branchBase}`);

  await dispatchWorkflow('on-gather.yml', {
    task_branch: taskBranch,
  }, repo, token, config.pr_base);

  console.log('[dispatch-gather] Gather triggered.');
}

main().catch(err => {
  console.error('[dispatch-gather] ERROR:', err.message);
  process.exit(1);
});
