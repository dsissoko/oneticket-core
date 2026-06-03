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
 *
 * v1.0.0:
 *   - branch_base removed — not passed to agent-execute.yml
 *   - is_fanout_task: "true" passed to agent-execute.yml
 *   - role passed as separate input (loaded via default_agent by APM)
 *   - prompt is minimal — profile is handled by opencode via default_agent
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run, writeManifest, areDependenciesSatisfied, dispatchWorkflow, createBranch } from './utils.mjs';
import { loadConfig } from './config.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Prompt builder — minimal
// ---------------------------------------------------------------------------

/**
 * Builds the minimal prompt for a task.
 * Profile is loaded by opencode via default_agent — not injected inline.
 */
function buildTaskPrompt(task, manifest) {
  const workflowLog = path.join(TASKS_DIR, `issue-${manifest.issue}`, 'workflow.md');
  return [
    `FIRST ACTION - no exception: run bash command: git checkout ${task.branch}.`,
    task.content,
    `Run this exact bash command (do not modify it):`,
    `echo "$(date -u '+%Y-%m-%d %H:%M') | ${task.id} | ${task.file}" >> ${workflowLog}`,
    `Commit all changes with message: feat: complete task ${task.id}.`,
    `Do NOT push. Do NOT create a PR. Do nothing else.`,
  ].join('\n');
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

  const featureBranch = `feature/issue-${manifest.issue}`;
  const manifestGitPath = path.join(TASKS_DIR, `issue-${manifest.issue}`, MANIFEST_FILE);
  writeManifest(manifest);
  run('agent-launcher', `git add ${manifestGitPath}`);
  run('agent-launcher', `git commit --allow-empty -m "chore: mark tasks ${readyTasks.map(t => t.id).join(', ')} as in_progress"`);

  // [DOUBLE-LAUNCH] Optimistic push — if non-fast-forward, another runner handles it
  try {
    run('agent-launcher', `git push origin ${featureBranch}`);
  } catch (e) {
    console.log('[agent-launcher] Non-fast-forward push — another runner already launched these tasks. Aborting.');
    return;
  }

  const config = loadConfig();

  // [FAN-OUT] Trigger one workflow per task — batched to avoid GitHub Actions concurrency cancellations
  const BATCH_SIZE        = 4;
  const BATCH_DELAY_MS    = 3000;
  const DISPATCH_DELAY_MS = 2000;

  for (let i = 0; i < readyTasks.length; i += BATCH_SIZE) {
    const batch = readyTasks.slice(i, i + BATCH_SIZE);

    if (i > 0) {
      console.log(`[agent-launcher] [FAN-OUT] Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }

    for (const task of batch) {
      try {
        // Create task branch via GitHub API before dispatching
        const featureBranch = `feature/issue-${manifest.issue}`;
        await createBranch(task.branch, featureBranch, repo, token);

        const prompt = buildTaskPrompt(task, manifest);

        await dispatchWorkflow('agent-execute.yml', {
          issue_number:  String(manifest.issue),
          branch:        task.branch,
          is_fanout_task: 'true',
          prompt,
          role:          task.role || '',
          model:         config.model,
          retry_max:     String(config.retry_max),
        }, repo, token);

        console.log(`[agent-launcher] [FAN-OUT] Workflow triggered for task ${task.id}${task.role ? ` (role: ${task.role})` : ''}.`);

        // [DISPATCH-DELAY] Avoid simultaneous workflow dispatches causing GitHub Actions cancellations
        await new Promise(r => setTimeout(r, DISPATCH_DELAY_MS));
      } catch (err) {
        console.error(`[agent-launcher] Failed to trigger workflow for task ${task.id}: ${err.message}`);
      }
    }
  }
}
