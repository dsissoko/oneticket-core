/**
 * utils.mjs
 *
 * [SHARED MODULE] Common utilities for all JS scripts in the project.
 * Eliminates duplication across orchestrate.mjs, agent-launcher.mjs,
 * agent-dispatch.mjs.
 *
 * Exports:
 *   run(prefix, cmd)                      — execSync with log, throws on error
 *   runCapture(prefix, cmd)               — execSync with stdout capture
 *   runWithRetry(prefix, cmd, max)        — run with exponential backoff + jitter
 *   setupGit(prefix, config, repo, token) — git config + fetch sequence
 *   writeManifest(manifest)               — writes .oneticket/tasks/issue-N/manifest.json
 *   readManifest(issueNumber)             — reads .oneticket/tasks/issue-N/manifest.json
 *   areDependenciesSatisfied(task, all)   — checks task dependencies
 *   dispatchWorkflow(file, inputs, repo, token) — POST workflow_dispatch with retry
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';

// ---------------------------------------------------------------------------
// Base git helpers
// ---------------------------------------------------------------------------

/**
 * Runs a shell command with logging.
 * Throws if exit code is non-zero.
 */
export function run(prefix, cmd, opts = {}) {
  console.log(`[${prefix}] $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

/**
 * Runs a shell command and captures stdout.
 */
export function runCapture(prefix, cmd) {
  console.log(`[${prefix}] $ ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

/**
 * Runs a shell command with exponential backoff + jitter on failure.
 *
 * Strategy: delay = 2^attempt * 1000ms + [0, 500ms] random
 * Uses Atomics.wait for synchronous delay (compatible with execSync).
 *
 * @param {string} prefix      - Log prefix (e.g. 'orchestrate')
 * @param {string} cmd         - Shell command to execute
 * @param {number} maxAttempts - Maximum number of attempts (default: 3)
 */
export function runWithRetry(prefix, cmd, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return run(prefix, cmd);
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const backoff = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
      console.warn(
        `[${prefix}] Failed "${cmd}" (attempt ${attempt}/${maxAttempts}) — ` +
        `backoff ${backoff}ms...`
      );
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoff);
    }
  }
}

// ---------------------------------------------------------------------------
// Git setup
// ---------------------------------------------------------------------------

/**
 * Standard git sequence: user.name + user.email + remote url + fetch.
 * git fetch uses runWithRetry to resist transient network errors.
 *
 * @param {string} prefix  - Log prefix
 * @param {object} config  - Config loaded from loadConfig()
 * @param {string} repo    - "owner/repo"
 * @param {string} token   - GitHub PAT (can be null/undefined)
 */
export function setupGit(prefix, config, repo, token) {
  run(prefix, `git config user.name "${config.oneticket_git_user_name}"`);
  run(prefix, `git config user.email "${config.oneticket_git_user_email}"`);
  if (token) {
    run(prefix, `git remote set-url origin https://x-access-token:${token}@github.com/${repo}.git`);
  }
  runWithRetry(prefix, 'git fetch origin');
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

/**
 * Writes the manifest to .oneticket/tasks/issue-<N>/manifest.json.
 */
export function writeManifest(manifest) {
  const manifestPath = path.join(
    process.cwd(), TASKS_DIR, `issue-${manifest.issue}`, MANIFEST_FILE
  );
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Reads the manifest from .oneticket/tasks/issue-<N>/manifest.json.
 */
export function readManifest(issueNumber) {
  const manifestPath = path.join(
    process.cwd(), TASKS_DIR, `issue-${issueNumber}`, MANIFEST_FILE
  );
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`${MANIFEST_FILE} not found: ${manifestPath}`);
  }
  const raw = fs.readFileSync(manifestPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${MANIFEST_FILE} corrupted (invalid JSON): ${manifestPath} — ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

/**
 * Determines if all dependencies of a task are satisfied (status done).
 */
export function areDependenciesSatisfied(task, allTasks) {
  if (!task.depends_on || task.depends_on.length === 0) return true;
  const doneIds = new Set(allTasks.filter(t => t.status === 'done').map(t => t.id));
  return task.depends_on.every(dep => doneIds.has(dep));
}

// ---------------------------------------------------------------------------
// GitHub workflow dispatch
// ---------------------------------------------------------------------------

/**
 * Triggers a GitHub Actions workflow via workflow_dispatch.
 * Automatic retry with exponential backoff + jitter on network error.
 *
 * @param {string} workflowFile - Workflow filename (e.g. 'agent-execute.yml')
 * @param {object} inputs       - workflow_dispatch inputs
 * @param {string} repo         - "owner/repo"
 * @param {string} token        - GitHub PAT
 * @param {string} ref          - Reference branch (default: 'main')
 * @param {number} maxAttempts  - Maximum number of attempts (default: 3)
 */
export async function dispatchWorkflow(workflowFile, inputs, repo, token, ref = 'main', maxAttempts = 3) {
  const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/dispatches`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:        'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref, inputs }),
    });

    if (res.ok) return;

    const body = await res.text();

    // 4xx client errors — no point retrying
    if (res.status >= 400 && res.status < 500) {
      throw new Error(`Failed to dispatch ${workflowFile}: ${res.status} ${body}`);
    }

    // 5xx server errors — retry with backoff
    if (attempt === maxAttempts) {
      throw new Error(`Failed to dispatch ${workflowFile} after ${maxAttempts} attempts: ${res.status} ${body}`);
    }

    const backoff = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
    console.warn(`[dispatch] Error ${res.status} on ${workflowFile} (attempt ${attempt}/${maxAttempts}) — backoff ${backoff}ms...`);
    await new Promise(r => setTimeout(r, backoff));
  }
}
