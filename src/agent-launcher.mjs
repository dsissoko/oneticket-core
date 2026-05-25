/**
 * agent-launcher.mjs
 *
 * [FAN-OUT] Triggers all ready tasks in parallel.
 * 100% deterministic — no LLM involved.
 *
 * Responsibilities:
 *   1. Identify ready tasks (pending + all dependencies done)
 *   2. [IDEMPOTENCE] Mark all ready tasks "in_progress" BEFORE dispatching
 *   3. Commit + push the updated manifest
 *   4. [FAN-OUT] Build each task prompt + trigger agent-execute.yml
 */

import path from 'path';
import { run, writeManifest, areDependenciesSatisfied, dispatchWorkflow } from './utils.mjs';
import { loadConfig } from './config.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the full prompt for a bounded task.
 *
 * NOTE: "git checkout <branch>" as the first action is intentional —
 * anomalyco detects the branch change (switched=true) and disables
 * its automatic push and PR creation mechanism.
 */
function buildTaskPrompt(task, manifest) {
  const workflowLog = path.join(TASKS_DIR, `issue-${manifest.issue}`, 'workflow.md');
  return [
    `FIRST ACTION - no exception: run bash command: git checkout ${task.branch}.`,
    `Create the file ${task.file} with this exact content: ${task.content}`,
    `Run this exact bash command (do not modify it):`,
    `echo "$(date -u '+%Y-%m-%d %H:%M') | ${task.id} | ${task.file}" >> ${workflowLog}`,
    `Commit all changes with message: feat: complete task ${task.id}.`,
    `Do NOT push. Do NOT create a PR. Do nothing else.`,
  ].join(' ');
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * [FAN-OUT] Identifies all ready tasks, marks them in_progress,
 * updates manifest.json in git, and triggers one workflow per task.
 */
export async function launchReadyTasks(manifest, repo, token) {
  const readyTasks = manifest.tasks.filter(
    t => t.status === 'pending' && areDependenciesSatisfied(t, manifest.tasks)
  );

  if (readyTasks.length === 0) {
    console.log('[agent-launcher] No ready tasks to launch.');
    return;
  }

  console.log(
    `[agent-launcher] [FAN-OUT] ${readyTasks.length} ready task(s): ${readyTasks.map(t => t.id).join(', ')}`
  );

  for (const task of readyTasks) {
    task.status = 'in_progress';
  }

  const manifestGitPath = path.join(TASKS_DIR, `issue-${manifest.issue}`, MANIFEST_FILE);
  writeManifest(manifest);
  run('agent-launcher', `git add ${manifestGitPath}`);
  run('agent-launcher', `git commit --allow-empty -m "chore: mark tasks ${readyTasks.map(t => t.id).join(', ')} as in_progress"`);

  // [DOUBLE-LAUNCH] Optimistic push — if non-fast-forward, another runner handles it
  try {
    run('agent-launcher', `git push origin ${manifest.branch_base}`);
  } catch (e) {
    console.log('[agent-launcher] Non-fast-forward push — another runner already launched these tasks. Aborting.');
    return;
  }

  const config = loadConfig();

  // [FAN-OUT] Trigger one workflow per task — continue if one task fails
  for (const task of readyTasks) {
    try {
      const prompt = buildTaskPrompt(task, manifest);
      await dispatchWorkflow('agent-execute.yml', {
        issue_number: String(manifest.issue),
        branch:       task.branch,
        branch_base:  manifest.branch_base,
        prompt,
        model:        config.model,
        retry_max:    String(config.retry_max),
      }, repo, token);
      console.log(`[agent-launcher] [FAN-OUT] Workflow triggered for task ${task.id}.`);
    } catch (err) {
      console.error(`[agent-launcher] Failed to trigger workflow for task ${task.id}: ${err.message}`);
    }
  }
}
