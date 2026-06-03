/**
 * agent-dispatch.mjs
 *
 * [DETERMINISTIC] Processes agent invocations from GitHub triggers.
 * Single entry point for all agentic dispatches.
 *
 * Required env vars:
 *   COMMENT_BODY   — comment text containing @<role> + request
 *   ISSUE_NUMBER   — GitHub issue number
 *   REPO           — owner/repo
 *   GITHUB_TOKEN   — GitHub PAT
 *
 * Optional env vars:
 *   CONTEXT_BLOCK  — comment history block built by the trigger workflow
 *   ORIGIN_TYPE    — issue_comment | pull_request_comment | pull_request_review_comment
 *   PR_NUMBER      — PR number (for PR triggers)
 *   REPLY_TO_COMMENT_ID — inline review comment id (for review triggers)
 */

import { loadConfig } from './config.mjs';
import { run, runCapture, runWithRetry, setupGit, dispatchWorkflow, applyLabel } from './utils.mjs';

// ---------------------------------------------------------------------------
// Comment parsing
// ---------------------------------------------------------------------------

function parseComment(commentBody) {
  const match = commentBody.match(/@([a-zA-Z][a-zA-Z0-9_-]*)/);
  if (!match) {
    console.log('[agent-dispatch] No @role found in comment — exiting.');
    return null;
  }
  const role    = match[1].toLowerCase();
  const request = commentBody.replace(match[0], '').trim();
  console.log(`[agent-dispatch] role="${role}", request="${request.slice(0, 80)}..."`);
  return { role, request };
}

// ---------------------------------------------------------------------------
// Project context (Gate 0)
// ---------------------------------------------------------------------------

function resolveProjectContext(config) {
  if (!config.current_project) {
    return { docsPath: null, appPath: null, currentProject: null,
      error: 'current_project is missing or empty in .oneticket/config.yml.' };
  }
  if (config.current_project === 'oneticket-core') {
    return { docsPath: '.oneticket/docs', appPath: null,
      currentProject: 'oneticket-core', error: null };
  }
  return {
    docsPath:       `apps/${config.current_project}/docs`,
    appPath:        `apps/${config.current_project}/app`,
    currentProject: config.current_project,
    error:          null,
  };
}

// ---------------------------------------------------------------------------
// Prompt construction (simplified)
// ---------------------------------------------------------------------------

function buildPrompt({ role, request, branch, issueNumber, repo, docsPath, appPath,
  currentProject, contextBlock, originType, prNumber, replyToCommentId, config }) {

  const lines = [];

  // switched=true mechanism — must be first line
  lines.push(`FIRST ACTION - no exception: run bash command: git checkout ${branch}.`);
  lines.push('');

  // Project context — injected deterministically
  lines.push(`## Project context`);
  lines.push(`issue_number: ${issueNumber}`);
  lines.push(`repo: ${repo}`);
  lines.push(`docs_path: ${docsPath}`);
  if (appPath) lines.push(`app_path: ${appPath}`);
  lines.push(`current_project: ${currentProject}`);
  if (config.max_tasks) lines.push(`max_tasks: ${config.max_tasks}`);
  lines.push('');

  // Agent contract — response channel
  lines.push(`## Agent contract`);
  lines.push(`- Prefix every response with: **[Agent: \`@${role}\`]**`);
  lines.push(`- ALWAYS respond at the end of every job — no exception.`);

  if (originType === 'pull_request_review_comment') {
    lines.push(`- Reply inline:`);
    lines.push('  ```bash');
    lines.push(`  gh api repos/${repo}/pulls/${prNumber}/comments --method POST --field body="**[Agent: @${role}]** {your message}" --field in_reply_to=${replyToCommentId}`);
    lines.push('  ```');
  } else if (originType === 'pull_request_comment') {
    lines.push(`- Reply on PR:`);
    lines.push('  ```bash');
    lines.push(`  gh api repos/${repo}/issues/${prNumber}/comments --method POST --field body="**[Agent: @${role}]** {your message}"`);
    lines.push('  ```');
  } else {
    lines.push(`- Reply on issue:`);
    lines.push('  ```bash');
    lines.push(`  gh api repos/${repo}/issues/${issueNumber}/comments --method POST --field body="**[Agent: @${role}]** {your message}"`);
    lines.push('  ```');
  }
  lines.push('');

  // Request
  lines.push(`## Request`);
  lines.push(request || `@${role}`);
  lines.push('');

  // Comment history
  if (contextBlock) {
    lines.push(contextBlock);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const commentBody      = process.env.COMMENT_BODY        || '';
  const issueNumber      = process.env.ISSUE_NUMBER;
  const repo             = process.env.REPO;
  const ghToken          = process.env.GITHUB_TOKEN;
  const contextBlock     = process.env.CONTEXT_BLOCK       || '';
  const originType       = process.env.ORIGIN_TYPE         || 'issue_comment';
  const prNumber         = process.env.PR_NUMBER           || '';
  const replyToCommentId = process.env.REPLY_TO_COMMENT_ID || '';

  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  // 1. Parse comment
  const parsed = parseComment(commentBody);
  if (!parsed) return;

  const { role, request } = parsed;
  const featureBranch = `feature/issue-${issueNumber}`;

  // 2. Load config
  const config = loadConfig();

  // 3. Gate 0 — current_project check
  const { docsPath, appPath, currentProject, error } = resolveProjectContext(config);

  if (error || currentProject === null) {
    console.error(`[agent-dispatch] Gate 0 failed: ${error}`);
    try {
      const { execFileSync } = await import('child_process');
      const body = `## Configuration error\n\n\`current_project\` is not set in \`.oneticket/config.yml\`.\n\nPlease set it before triggering an agent:\n\`\`\`yaml\ncurrent_project: <your-project-name>\n\`\`\``;
      execFileSync('gh', ['issue', 'comment', String(issueNumber), '--repo', repo, '--body', body],
        { env: { ...process.env, GH_TOKEN: ghToken } });
    } catch (e) {
      console.error('[agent-dispatch] Could not post Gate 0 comment:', e.message);
    }
    process.exit(0);
  }

  console.log(`[agent-dispatch] current_project="${currentProject}", docs_path="${docsPath}"`);

  // 4. Git setup + ensure feature branch exists
  setupGit('agent-dispatch', config, repo, ghToken);

  const remoteBranches = runCapture('agent-dispatch', 'git branch -r');
  if (!remoteBranches.includes(`origin/${featureBranch}`)) {
    console.log(`[agent-dispatch] Creating branch ${featureBranch}...`);
    run('agent-dispatch', `git checkout -b ${featureBranch}`);
    runWithRetry('agent-dispatch', `git push origin ${featureBranch}`);
    run('agent-dispatch', `git checkout -`);
  }

  // 5. Build prompt
  const prompt = buildPrompt({
    role, request, branch: featureBranch, issueNumber, repo,
    docsPath, appPath, currentProject, contextBlock,
    originType, prNumber, replyToCommentId, config,
  });
  console.log(`[agent-dispatch] Prompt built (${prompt.length} chars).`);

  // 6. Dispatch agent-execute.yml
  await dispatchWorkflow('agent-execute.yml', {
    issue_number: String(issueNumber),
    branch:       featureBranch,
    prompt,
    role,
    model:     config.model,
    retry_max: String(config.retry_max),
  }, repo, ghToken);

  await applyLabel('in progress', issueNumber, repo, ghToken, 'agent-dispatch');
  console.log('[agent-dispatch] Dispatch complete.');
}

main().catch(err => {
  console.error('[agent-dispatch] ERROR:', err.message);
  process.exit(1);
});
