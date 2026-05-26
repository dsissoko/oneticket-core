/**
 * agent-dispatch.mjs
 *
 * [DETERMINISTIC] Processes agent invocations from GitHub triggers.
 * Single entry point for all agent dispatches.
 *
 * Interface contract — required environment variables:
 *   COMMENT_BODY   — comment text containing @<role> + request
 *   ISSUE_NUMBER   — GitHub issue number (for feature/issue-N branch)
 *   REPO           — owner/repo
 *   GITHUB_TOKEN   — GitHub PAT
 *
 * Optional variable provided by each trigger:
 *   CONTEXT_BLOCK  — free-form text block built by the trigger YAML workflow
 *                    (issue context, PR diff, history, etc.)
 *                    Inserted as-is into the system prompt.
 *                    Each trigger is autonomous in building this block.
 *
 * Extensibility: to add a new trigger, create a new YAML workflow
 * that exposes these variables + builds its own CONTEXT_BLOCK.
 * This file does not change.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';
import { run, runCapture, runWithRetry, setupGit, dispatchWorkflow } from './utils.mjs';
import { AGENTS_DIR, AGENT_EXT } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Comment parsing — shared zone
// ---------------------------------------------------------------------------

/**
 * Parses the comment to extract role and request.
 * First @<role> found → role. Rest of comment → request.
 *
 * @returns {{ role: string, demande: string } | null}
 */
function parseComment(commentBody) {
  const match = commentBody.match(/@([a-zA-Z][a-zA-Z0-9_-]*)/);
  if (!match) {
    console.log('[agent-dispatch] No @role found in comment — exiting without action.');
    return null;
  }
  const role    = match[1].toLowerCase();
  const demande = commentBody.replace(match[0], '').trim();
  console.log(`[agent-dispatch] role="${role}", request="${demande.slice(0, 80)}..."`);
  return { role, demande };
}

// ---------------------------------------------------------------------------
// Profile loading
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

// ---------------------------------------------------------------------------
// System prompt construction
// ---------------------------------------------------------------------------

/**
 * Resolves docs_path deterministically from config.current_project.
 *
 * Three states for current_project:
 *   - absent (undefined) → config error — caller must notify user and stop
 *   - empty ("")         → docs_path = .oneticket/docs (framework context)
 *   - set ("myapp")      → docs_path = apps/myapp/docs (application context)
 *
 * current_project is passed as-is into the prompt — the agent reads it directly.
 *
 * @returns {{ docsPath: string, currentProject: string, error: string|null }}
 */
function resolveProjectContext(config) {
  // current_project key absent entirely — config error
  if (config.current_project === undefined) {
    return {
      docsPath:       null,
      currentProject: null,
      error:          'current_project key is missing from .oneticket/config.yml. ' +
                      'Add it with your project name or leave it empty for framework context.',
    };
  }

  // current_project present but empty — framework context
  if (config.current_project === '' || config.current_project === null) {
    return {
      docsPath:       `.oneticket/docs`,
      currentProject: ``,
      error:          null,
    };
  }

  // current_project set — application project context
  return {
    docsPath:       `apps/${config.current_project}/docs`,
    currentProject: config.current_project,
    error:          null,
  };
}

/**
 * Builds the system prompt injected into Agent Execute.
 *
 * Structure:
 *   [Common trunk]
 *     - git checkout (anomalyco switched=true mechanism)
 *     - Agent profile
 *     - Language + autonomous_mode
 *     - Project context (all resolved deterministically — never by the agent)
 *     - Request
 *   [Trigger context]
 *     - CONTEXT_BLOCK as-is (built by the trigger YAML workflow)
 *
 * NOTE: git checkout at the top → anomalyco detects switched=true →
 * disables automatic push and PR creation.
 */
function buildPrompt({ role, demande, branch, config, profile, contextBlock, docsPath, currentProject, issueNumber, repo }) {
  const lines = [];

  // Common trunk — required regardless of trigger
  lines.push(`FIRST ACTION - no exception: run bash command: git checkout ${branch}.`);
  lines.push('');

  if (profile) {
    lines.push(profile);
    lines.push('');
  }

  if (config.language) {
    lines.push(`## Language`);
    lines.push(`Réponds exclusivement en ${config.language}. Directive système.`);
    lines.push('');
  }

  lines.push(`## Mode`);
  lines.push(`autonomous_mode: ${config.autonomous_mode}`);
  lines.push('');

  // Project context — all values resolved deterministically, injected as-is
  // Use these values in gh commands and file paths — never resolve them yourself
  lines.push(`## Project context`);
  lines.push(`issue_number: ${issueNumber}`);
  lines.push(`repo: ${repo}`);
  lines.push(`docs_path: ${docsPath}`);
  lines.push(`current_project: ${currentProject}`);
  lines.push('');

  lines.push(`## Request`);
  lines.push(demande || `@${role}`);
  lines.push('');

  // Trigger context — specific, built by the YAML workflow
  if (contextBlock) {
    lines.push(contextBlock);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const commentBody  = process.env.COMMENT_BODY  || '';
  const issueNumber  = process.env.ISSUE_NUMBER;
  const repo         = process.env.REPO;
  const ghToken      = process.env.GITHUB_TOKEN;
  const contextBlock = process.env.CONTEXT_BLOCK || '';

  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  // --- 1. Parse comment — shared zone ----------------------------------
  const parsed = parseComment(commentBody);
  if (!parsed) return;

  const { role, demande } = parsed;
  const featureBranch = `feature/issue-${issueNumber}`;

  // --- 2. Load config + profile ----------------------------------------
  const config  = loadConfig();
  const profile = loadProfile(role);

  // --- 3. Git setup + create feature branch if it doesn't exist --------
  setupGit('agent-dispatch', config, repo, ghToken);

  const remoteBranches = runCapture('agent-dispatch', 'git branch -r');
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    console.log(`[agent-dispatch] Branch ${featureBranch} already exists.`);
  } else {
    console.log(`[agent-dispatch] Creating branch ${featureBranch}...`);
    run('agent-dispatch', `git checkout -b ${featureBranch}`);
    runWithRetry('agent-dispatch', `git push origin ${featureBranch}`);
    run('agent-dispatch', `git checkout -`);
  }

  // --- 4. Build system prompt ------------------------------------------
  const { docsPath, currentProject, error } = resolveProjectContext(config);

  if (error) {
    console.error(`[agent-dispatch] Project context error: ${error}`);
    try {
      const { execSync } = await import('child_process');
      execSync(
        `gh issue comment ${issueNumber} --repo ${repo} --body "## Configuration error\n\n${error}"`,
        { env: { ...process.env, GH_TOKEN: ghToken } }
      );
    } catch (e) {
      console.error('[agent-dispatch] Could not post error comment:', e.message);
    }
    process.exit(1);
  }

  console.log(`[agent-dispatch] project context resolved: current_project="${currentProject}", docs_path="${docsPath}"`);

  const prompt = buildPrompt({
    role,
    demande,
    branch:         featureBranch,
    config,
    profile,
    contextBlock,
    docsPath,
    currentProject,
    issueNumber,
    repo,
  });
  console.log(`[agent-dispatch] Prompt built (${prompt.length} chars).`);

  // --- 5. Dispatch Agent Execute ---------------------------------------
  console.log(`[agent-dispatch] Dispatching Agent Execute — role=${role}, issue #${issueNumber}, branch ${featureBranch}`);
  await dispatchWorkflow('agent-execute.yml', {
    issue_number: String(issueNumber),
    branch:       featureBranch,
    prompt,
    role,
    model:        config.model,
    retry_max:    String(config.retry_max),
  }, repo, ghToken);

  console.log('[agent-dispatch] Dispatch complete.');
}

main().catch(err => {
  console.error('[agent-dispatch] ERROR:', err.message);
  process.exit(1);
});
