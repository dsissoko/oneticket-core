/**
 * launch-fanout.mjs
 *
 * [DETERMINISTIC] Starts FAN-OUT from a manifest present in the working tree.
 * Called by agent-execute.yml after an agent has produced .oneticket/tasks/issue-N/manifest.json.
 *
 * Single responsibility:
 *   1. Verify manifest is present (defensive check)
 *   2. Git setup
 *   3. Checkout feature/issue-N
 *   4. Read manifest
 *   5. Launch launchReadyTasks() → FAN-OUT
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 */

import { launchReadyTasks } from './agent-launcher.mjs';
import { loadConfig } from './config.mjs';
import { setupGit, readManifest, run } from './utils.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';
import path from 'path';
import fs from 'fs';

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const repo        = process.env.REPO;
  const ghToken     = process.env.GITHUB_TOKEN;

  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  const featureBranch = `feature/issue-${issueNumber}`;

  const config = loadConfig();

  // Git setup + fetch with network retry
  setupGit('launch-fanout', config, repo, ghToken);
  run('launch-fanout', `git fetch origin ${featureBranch}`);
  run('launch-fanout', `git checkout -B ${featureBranch} origin/${featureBranch}`);

  // Defensive check — manifest must be present after checkout
  const manifestPath = path.join(process.cwd(), TASKS_DIR, `issue-${issueNumber}`, MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `${MANIFEST_FILE} not found: ${manifestPath}\n` +
      `launch-fanout.mjs must only be called when the manifest is present on ${featureBranch}.`
    );
  }

  // Read manifest
  const manifest = readManifest(issueNumber);

  // Check there are pending tasks before launching FAN-OUT
  const pendingTasks = manifest.tasks.filter(t => t.status === 'pending');
  if (pendingTasks.length === 0) {
    console.log('[launch-fanout] No pending tasks — FAN-OUT not needed.');
    return;
  }

  console.log(`[launch-fanout] ${pendingTasks.length} pending task(s) — launching FAN-OUT.`);
  await launchReadyTasks(manifest, repo, ghToken);
  console.log('[launch-fanout] FAN-OUT launched.');
}

main().catch(err => {
  console.error('[launch-fanout] ERROR:', err.message);
  process.exit(1);
});
