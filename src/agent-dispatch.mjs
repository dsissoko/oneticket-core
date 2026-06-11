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
import fs from 'fs';
import path from 'path';
import { loadConfig } from './config.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';
import { setupGit, dispatchWorkflow, applyLabel, removeLabel } from './utils.mjs';

// ---------------------------------------------------------------------------
// GitHub helpers
// ---------------------------------------------------------------------------

async function getExistingPR(branch, repo, token) {
  const owner = repo.split('/')[0];
  const res = await fetch(
    `https://api.github.com/repos/${repo}/pulls?head=${owner}:${branch}&state=open`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  );
  if (!res.ok) return null;
  const prs = await res.json();
  return prs.length > 0 ? prs[0] : null;
}

// ---------------------------------------------------------------------------
// Comment parsing
// ---------------------------------------------------------------------------

export function parseComment(commentBody) {
  const parallelMode = commentBody.includes('--parallel');
  const cleanBody = commentBody.replace('--parallel', '').trim();
  const match = cleanBody.match(/@([a-zA-Z][a-zA-Z0-9_-]*)/);
  if (!match) {
    console.log('[agent-dispatch] No @role found in comment — exiting.');
    return null;
  }
  const role    = match[1].toLowerCase();
  const request = cleanBody.replace(match[0], '').trim();
  const safeMode = !parallelMode; // sequential by default, --parallel opts into FAN-OUT
  console.log(`[agent-dispatch] role="${role}", safeMode=${safeMode}, parallelMode=${parallelMode}, request="${request.slice(0, 80)}..."`);
  return { role, request, safeMode };
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
  commentPath, commentLine, commentDiffHunk, config, safeMode = false }) {

  const lines = [];

  // switched=true mechanism — must be first line
  lines.push(`FIRST ACTION - no exception: run bash command: git checkout ${branch}.`);
  lines.push('');

  // Critical pipeline rules — explicit guard against rogue branch/PR creation
  lines.push(`CRITICAL RULES — no exception:`);
  lines.push(`- NEVER call \`gh pr create\` — PR creation is handled by the pipeline after your run.`);
  lines.push(`- NEVER create a new git branch — work exclusively on the branch already checked out (${branch}).`);
  lines.push(`- NEVER call \`git push\` — the pipeline handles all pushes after your run.`);
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

  // --safe mode — injected when comment contains '--safe'
  // Forces strictly sequential manifest decomposition — no parallel tasks.
  if (safeMode) {
    lines.push(`## Sequential mode (--safe)`);
    lines.push(`The manifest MUST be strictly sequential — no parallel tasks allowed.`);
    lines.push(`Every task must declare depends_on pointing to the previous task.`);
    lines.push(`The dependency chain must be linear: A → B → C → D → ... → N.`);
    lines.push(`depends_on: [] is only allowed for the very first task (A).`);
    lines.push(`No two tasks may have the same depends_on value or run concurrently.`);
    lines.push('');
  }

  // reverse-doc complement — injected when request contains 'reverse-doc'
  // Ensures doc structure exists (guaranteed by check-prerequisites.mjs upstream)
  // and loads all relevant documentation skills explicitly.
  if (request && request.toLowerCase().includes('reverse-doc')) {
    lines.push(`## Reverse documentation instructions`);
    lines.push(`The documentation structure at \`${docsPath}\` has been initialized and is ready.`);
    lines.push(`Load and apply the following skills to execute the reverse documentation workflow:`);
    lines.push('');
    lines.push(`1. Load skill \`oneticket-reverse-doc\` — this is your primary orchestration guide for reverse documentation, code discovery, and ordered generation.`);
     lines.push(`   It will instruct you to also load: \`oneticket-doc-structure\`, \`oneticket-user-story\`, \`oneticket-epic-breakdown\`, \`oneticket-c4\`, \`oneticket-create-sprint\`, \`oneticket-complete-sprint-technical\` as needed.`);
    lines.push('');
    lines.push(`Key constraints:`);
    lines.push(`- docs_path: \`${docsPath}\``);
    if (appPath) lines.push(`- app_path: \`${appPath}\``);
    lines.push(`- Never overwrite a non-empty file without reading it first`);
    lines.push(`- product-spec.md : if it exists but is outdated vs the current code → UPDATE it to reflect the current implementation`);
    lines.push(`- architecture.md : if it exists but is outdated vs the current code → UPDATE it to reflect the current implementation`);
    lines.push(`- C4 diagrams (how/c4/) : if they exist but are outdated vs the current stack or components → UPDATE them`);
     lines.push(`- sprints : if existing sprints do not match the current src/ structure → UPDATE them`);
    lines.push(`- user stories : if new observable features exist in the code with no corresponding US → CREATE the missing US`);
    lines.push(`- All other files (epic.md) : update only if explicitly requested or clearly outdated`);
    lines.push(`- Every generated artifact must be traceable to the code in app_path/src/`);
    lines.push(`- Commit message: \`docs: @po reverse-doc ${currentProject}\``);
    lines.push('');
  }

  // Comment history
  if (contextBlock) {
    lines.push(contextBlock);
  }

  // Pipeline housekeeping — symmetric with FAN-OUT prompt
  lines.push(`## Pipeline housekeeping`);
  const commitMsg = (request && request.toLowerCase().includes('reverse-doc'))
    ? `docs: @po reverse-doc ${currentProject}`
    : `feat: @${role} response for issue #${issueNumber}`;
  lines.push(`If you produced or modified files, commit them with message: ${commitMsg}.`);
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

  const { role, request, safeMode } = parsed;
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
    commentPath, commentLine, commentDiffHunk, config, safeMode,
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

  // 7. Label management
  // Direct run on existing PR — remove ready for review before agent runs
  // (signals the PR is being modified, prevents premature merge)
  const manifestPath = path.join(process.cwd(), TASKS_DIR, `issue-${issueNumber}`, MANIFEST_FILE);
  const isDirectRun = !fs.existsSync(manifestPath);
  if (isDirectRun && (originType === 'issue_comment' || originType === 'pull_request_comment')) {
    const existingPR = await getExistingPR(featureBranch, repo, ghToken);
    if (existingPR) {
      console.log(`[agent-dispatch] Direct run on existing PR #${existingPR.number} — removing ready for review`);
      await removeLabel('ready for review', existingPR.number, repo, ghToken, 'agent-dispatch');
    }
  }

  await applyLabel('in progress', issueNumber, repo, ghToken, 'agent-dispatch');
  console.log('[agent-dispatch] Dispatch complete.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('[agent-dispatch] ERROR:', err.message);
    process.exit(1);
  });
}
