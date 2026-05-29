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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run, writeManifest, areDependenciesSatisfied, dispatchWorkflow } from './utils.mjs';
import { loadConfig } from './config.mjs';
import { TASKS_DIR, MANIFEST_FILE, AGENTS_DIR, AGENT_EXT } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers — role-based prompt (copied from agent-dispatch.mjs — intentional duplication)
// Refactor to prompt-builder.mjs deferred until tests are in place.
// ---------------------------------------------------------------------------

/**
 * Loads .oneticket/agents/<role>.agent.md.
 * Throws with an explicit message if not found.
 */
function loadProfile(role) {
  const profilePath = path.join(__dirname, '..', AGENTS_DIR, `${role}${AGENT_EXT}`);
  if (!fs.existsSync(profilePath)) {
    throw new Error(
      `No agent profile for "@${role}": ${profilePath}\n` +
      `Create ${AGENTS_DIR}/${role}${AGENT_EXT} to enable this agent.`
    );
  }
  return fs.readFileSync(profilePath, 'utf8');
}

/**
 * Resolves docs_path and app_path from config.current_project.
 * Returns { docsPath, appPath, currentProject, error }.
 */
function resolveProjectContext(config) {
  if (!config.current_project) {
    return { docsPath: null, appPath: null, currentProject: null,
      error: 'current_project key is missing or empty in .oneticket/config.yml.' };
  }
  if (config.current_project === 'oneticket-core') {
    return { docsPath: '.oneticket/docs', appPath: null, currentProject: 'oneticket-core', error: null };
  }
  return {
    docsPath:       `apps/${config.current_project}/docs`,
    appPath:        `apps/${config.current_project}/app`,
    currentProject: config.current_project,
    error:          null,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the minimal prompt for a bounded task without role.
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

/**
 * Builds a full prompt for a task with a role — includes agent profile,
 * language, mode, project context, agent contract and request.
 * Returns null (+ logs error) if profile or project context cannot be resolved.
 */
function buildRoleTaskPrompt(task, manifest, config, repo) {
  // Load profile
  let profile;
  try {
    profile = loadProfile(task.role);
  } catch (e) {
    console.error(`[agent-launcher] Cannot build role prompt for task ${task.id}: ${e.message}`);
    return null;
  }

  // Resolve project context
  const { docsPath, appPath, currentProject, error } = resolveProjectContext(config);
  if (error) {
    console.error(`[agent-launcher] Cannot build role prompt for task ${task.id}: ${error}`);
    return null;
  }

  const lines = [];

  lines.push(`FIRST ACTION - no exception: run bash command: git checkout ${task.branch}.`);
  lines.push('');

  lines.push(profile);
  lines.push('');

  if (config.language) {
    lines.push(`## Language`);
    lines.push(`Réponds exclusivement en ${config.language}. Directive système.`);
    lines.push('');
  }

  lines.push(`## Mode`);
  lines.push(`autonomous_mode: ${config.autonomous_mode}`);
  lines.push('');

  lines.push(`## Response style`);
  lines.push(`- Keep responses short and focused — 20 lines max`);
  lines.push(`- ✅ done, ❌ error/failure, 🔀 routing, 🤝 handoff. For other cases where relevant, use other emojis.`);
  lines.push('');

  lines.push(`## Project context`);
  lines.push(`issue_number: ${manifest.issue}`);
  lines.push(`repo: ${repo}`);
  lines.push(`docs_path: ${docsPath}`);
  if (appPath) lines.push(`app_path: ${appPath}`);
  lines.push(`current_project: ${currentProject}`);
  lines.push('');

  lines.push(`## Agent contract`);
  lines.push(`- Prefix every response with: **[Agent: \`@${task.role}\`]**`);
  lines.push(`- ALWAYS respond at the end of every job — no exception.`);
  lines.push(`- The exact command to respond (issue comment):`);
  lines.push('  ```bash');
  lines.push(`  gh api repos/${repo}/issues/${manifest.issue}/comments --method POST --field body="**[Agent: @${task.role}]** {your message here}"`);
  lines.push('  ```');
  lines.push('');

  lines.push(`## Request`);
  lines.push(task.content);
  lines.push('');

  const workflowLog = path.join(TASKS_DIR, `issue-${manifest.issue}`, 'workflow.md');
  lines.push(`## Pipeline housekeeping`);
  lines.push(`After completing the request, run this exact bash command:`);
  lines.push('```bash');
  lines.push(`echo "$(date -u '+%Y-%m-%d %H:%M') | ${task.id} | ${task.file}" >> ${workflowLog}`);
  lines.push('```');
  lines.push(`Then commit all changes with message: feat: complete task ${task.id}.`);
  lines.push(`Do NOT push. Do NOT create a PR.`);

  return lines.join('\n');
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

  // [FAN-OUT] Trigger one workflow per task — batched to avoid GitHub Actions concurrency cancellations
  // Max BATCH_SIZE dispatches at a time, with BATCH_DELAY_MS between batches
  const BATCH_SIZE  = 4;
  const BATCH_DELAY_MS = 3000;

  for (let i = 0; i < readyTasks.length; i += BATCH_SIZE) {
    const batch = readyTasks.slice(i, i + BATCH_SIZE);

    if (i > 0) {
      console.log(`[agent-launcher] [FAN-OUT] Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }

    for (const task of batch) {
      try {
        let prompt;
        if (task.role) {
          prompt = buildRoleTaskPrompt(task, manifest, config, repo);
        }
        if (!prompt) {
          if (task.role) {
            console.warn(`[agent-launcher] Role "${task.role}" not found for task ${task.id} — falling back to generic worker.`);
          }
          prompt = buildTaskPrompt(task, manifest);
        }

        await dispatchWorkflow('agent-execute.yml', {
          issue_number: String(manifest.issue),
          branch:       task.branch,
          branch_base:  manifest.branch_base,
          prompt,
          model:        config.model,
          retry_max:    String(config.retry_max),
        }, repo, token);
        console.log(`[agent-launcher] [FAN-OUT] Workflow triggered for task ${task.id}${task.role ? ` (role: ${task.role})` : ''}.`);
      } catch (err) {
        console.error(`[agent-launcher] Failed to trigger workflow for task ${task.id}: ${err.message}`);
      }
    }
  }
}
