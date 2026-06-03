/**
 * dispatch-fanout.mjs
 *
 * [DETERMINISTIC] Triggers the FAN-OUT workflow when a manifest is present.
 * Called by agent-execute.yml after the agent push (is_fanout_task=false only).
 *
 * Responsibilities:
 *   1. Check if manifest.json is present for this issue
 *   2. If yes → trigger on-fanout.yml via workflow_dispatch
 *   3. If no  → log and exit 0 (manifest is optional — direct agent run)
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, REPO, ISSUE_NUMBER
 */

import fs from 'fs';
import path from 'path';
import { dispatchWorkflow } from './utils.mjs';
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
    console.log(`[dispatch-fanout] No manifest found for issue #${issueNumber} — skipping FAN-OUT.`);
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
