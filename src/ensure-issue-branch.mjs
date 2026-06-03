/**
 * ensure-issue-branch.mjs
 *
 * [DETERMINISTIC] Creates feature/issue-N if it does not exist on origin.
 * Called by on-issue-comment.yml before any agentic run.
 * Idempotent — safe to call multiple times.
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 */

import { loadConfig } from './config.mjs';
import { run, runCapture, runWithRetry, setupGit } from './utils.mjs';

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const repo        = process.env.REPO;
  const ghToken     = process.env.GITHUB_TOKEN;

  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  const featureBranch = `feature/issue-${issueNumber}`;
  const config = loadConfig();

  setupGit('ensure-issue-branch', config, repo, ghToken);

  const remoteBranches = runCapture('ensure-issue-branch', 'git branch -r');
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    console.log(`[ensure-issue-branch] ${featureBranch} already exists — skipping.`);
    return;
  }

  console.log(`[ensure-issue-branch] Creating ${featureBranch}...`);
  run('ensure-issue-branch', `git checkout -b ${featureBranch}`);
  runWithRetry('ensure-issue-branch', `git push origin ${featureBranch}`);
  run('ensure-issue-branch', `git checkout -`);
  console.log(`[ensure-issue-branch] ${featureBranch} created.`);
}

main().catch(err => {
  console.error('[ensure-issue-branch] ERROR:', err.message);
  process.exit(1);
});
