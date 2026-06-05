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
 * Prerequisites (handled upstream by on-issue-comment.yml):
 *   - ensure-issue-branch.mjs — feature/issue-N exists
 *   - check-prerequisites.mjs — Gate 0 + doc structure
 *
 * Optional env vars:
 *   CONTEXT_BLOCK        — comment history block built by the trigger workflow
 *   ORIGIN_TYPE          — issue_comment | pull_request_comment | pull_request_review_comment
 *   PR_NUMBER            — PR number (for PR triggers)
 *   REPLY_TO_COMMENT_ID  — inline review comment id (for review triggers)
 *   COMMENT_PATH         — file path of the commented line (review triggers)
 *   COMMENT_LINE         — line number (review triggers)
 *   COMMENT_DIFF_HUNK    — diff hunk (review triggers)
 */

import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';
import { setupGit, dispatchWorkflow, applyLabel } from './utils.mjs';

// ---------------------------------------------------------------------------
// Comment parsing
// ---------------------------------------------------------------------------

export function parseComment(commentBody) {
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
// Project context
// ---------------------------------------------------------------------------

export function resolveProjectContext(config) {
  if (config.current_project === 'oneticket-core') {
    return { docsPath: '.oneticket/docs', appPath: null, currentProject: 'oneticket-core' };
  }
  return {
    docsPath:       `apps/${config.current_project}/docs`,
    appPath:        `apps/${config.current_project}/app`,
    currentProject: config.current_project,
  };
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

export function buildPrompt({ role, request, branch, issueNumber, repo, docsPath, appPath,
  currentProject, contextBlock, originType, prNumber, replyToCommentId,
  commentPath, commentLine, commentDiffHunk, config }) {

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

  // File context — injected for review triggers
  if (commentPath) {
    lines.push(`## File context`);
    lines.push(`file: ${commentPath}`);
    if (commentLine) lines.push(`line: ${commentLine}`);
    if (commentDiffHunk) {
      lines.push(`diff hunk:`);
      lines.push('```');
      lines.push(commentDiffHunk);
      lines.push('```');
    }
    lines.push('');
  }

  // Agent contract — response channel
  lines.push(`## Agent contract`);
  lines.push(`- Prefix every response with: **[Agent: \`@${role}\`]**`);
  lines.push(`- ALWAYS respond at the end of every job — no exception.`);

  if (originType === 'pull_request_review_comment') {
    lines.push(`- Reply inline to the specific comment that triggered you. Your response must directly address the comment and state what action you took (fixed, explained, skipped + why).`);
    lines.push(`- Use this command (DO NOT use any other):`);
    lines.push('  ```bash');
    lines.push(`  gh api repos/${repo}/pulls/${prNumber}/comments --method POST --field body="**[Agent: @${role}]** {direct answer to the comment + action taken}" --field in_reply_to=${replyToCommentId}`);
    lines.push('  ```');
  } else if (originType === 'pull_request_comment') {
    lines.push(`- Reply on the PR with a summary of what you did. Include: files created or modified, key decisions, and what the reviewer should check.`);
    lines.push('  ```bash');
    lines.push(`  gh api repos/${repo}/issues/${prNumber}/comments --method POST --field body="**[Agent: @${role}]** ✅ Done\\n\\n**Files:** {list}\\n**Decisions:** {key decisions}\\n**To review:** {what to check}"`);
    lines.push('  ```');
  } else {
    lines.push(`- Reply on the issue with a summary of what you did. Include: files created or modified, key decisions, and what the user should validate visually.`);
    lines.push('  ```bash');
    lines.push(`  gh api repos/${repo}/issues/${issueNumber}/comments --method POST --field body="**[Agent: @${role}]** ✅ Done\\n\\n**Files:** {list}\\n**Decisions:** {key decisions}\\n**To validate:** {what to check visually}"`);
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

  // Pipeline housekeeping — symmetric with FAN-OUT prompt
  lines.push(`## Pipeline housekeeping`);
  lines.push(`If you produced or modified files, commit them with message: feat: @${role} response for issue #${issueNumber}.`);
  lines.push(`Do NOT push. Do NOT create a PR. The pipeline handles this after your run.`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main — standalone execution only
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
  const commentPath      = process.env.COMMENT_PATH        || '';
  const commentLine      = process.env.COMMENT_LINE        || '';
  const commentDiffHunk  = process.env.COMMENT_DIFF_HUNK   || '';

  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  // 1. Parse comment
  const parsed = parseComment(commentBody);
  if (!parsed) return;

  const { role, request } = parsed;
  const featureBranch = `feature/issue-${issueNumber}`;

  // 2. Load config
  const config = loadConfig();

  // 3. Resolve project context
  const { docsPath, appPath, currentProject } = resolveProjectContext(config);
  console.log(`[agent-dispatch] current_project="${currentProject}", docs_path="${docsPath}"`);

  // 4. Git setup
  setupGit('agent-dispatch', config, repo, ghToken);

  // 5. Build prompt
  const prompt = buildPrompt({
    role, request, branch: featureBranch, issueNumber, repo,
    docsPath, appPath, currentProject, contextBlock,
    originType, prNumber, replyToCommentId,
    commentPath, commentLine, commentDiffHunk, config,
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('[agent-dispatch] ERROR:', err.message);
    process.exit(1);
  });
}
