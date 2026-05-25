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
 * Expected environment variables:
 *   GITHUB_TOKEN, REPO, TASK_BRANCH, BRANCH_BASE
 */

import { dispatchWorkflow } from './utils.mjs';
import { loadConfig } from './config.mjs';

async function main() {
  const repo        = process.env.REPO;
  const token       = process.env.GITHUB_TOKEN;
  const taskBranch  = process.env.TASK_BRANCH;
  const branchBase  = process.env.BRANCH_BASE;

  if (!repo)       throw new Error('REPO missing');
  if (!token)      throw new Error('GITHUB_TOKEN missing');
  if (!taskBranch) throw new Error('TASK_BRANCH missing');
  if (!branchBase) throw new Error('BRANCH_BASE missing');

  const config = loadConfig();

  console.log(`[dispatch-gather] Triggering Gather for ${taskBranch} → ${branchBase}`);

  await dispatchWorkflow('on-gather.yml', {
    task_branch:  taskBranch,
    branch_base:  branchBase,
  }, repo, token, config.pr_base);

  console.log('[dispatch-gather] Gather triggered.');
}

main().catch(err => {
  console.error('[dispatch-gather] ERROR:', err.message);
  process.exit(1);
});
