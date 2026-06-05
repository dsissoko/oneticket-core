/**
 * dispatch-fanout.mjs
 *
 * [DETERMINISTIC] Triggers the FAN-OUT workflow when a manifest is present.
 * Called by agent-execute.yml after the agent push (is_fanout_task=false only).
 *
 * Responsibilities:
 *   1. Check if manifest.json is present for this issue
 *   2. If yes → check if all tasks are already done (allDone guard)
 *      → allDone : skip FAN-OUT — manifest is stale, cleanup_on_success will handle it
 *      → not done: trigger on-fanout.yml via workflow_dispatch
 *   3. If no  → log and exit 0 (manifest is optional — direct agent run)
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, REPO, ISSUE_NUMBER
 */

import fs from 'fs';
import path from 'path';
import { dispatchWorkflow, removeLabel } from './utils.mjs';
import { loadConfig } from './config.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';

async function main() {
  const repo        = process.env.REPO;
  const token       = process.env.GITHUB_TOKEN;
  const issueNumber = process.env.ISSUE_NUMBER;

  if (!repo)        throw new Error('REPO missing');
  if (!token)       throw new Error('GITHUB_TOKEN missing');
  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');

  const manifestPath = path.join(process.cwd(), TASKS_DIR, `issue-${issueNumber}`, MANIFEST_FILE);

  if (!fs.existsSync(manifestPath)) {
    console.log(`[dispatch-fanout] No manifest found for issue #${issueNumber} — direct run complete.`);
    // Direct run — no FAN-OUT, remove in progress label
    await removeLabel('in progress', issueNumber, repo, token, 'dispatch-fanout');
    return;
  }

  // Guard: skip if all tasks already done — manifest is stale (not yet cleaned up)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const allDone = manifest.tasks && manifest.tasks.every(t => t.status === 'done');
  if (allDone) {
    console.log(`[dispatch-fanout] Manifest for issue #${issueNumber} is allDone — skipping FAN-OUT.`);
    return;
  }

  const config = loadConfig();

  console.log(`[dispatch-fanout] Manifest detected for issue #${issueNumber} — triggering FAN-OUT.`);

  await dispatchWorkflow('on-fanout.yml', {
    issue_number: String(issueNumber),
  }, repo, token, config.pr_base);

  console.log('[dispatch-fanout] FAN-OUT triggered.');
}

main().catch(err => {
  console.error('[dispatch-fanout] ERROR:', err.message);
  process.exit(1);
});
