/**
 * dispatch-review-agents.mjs
 *
 * [DETERMINISTIC] Processes all inline review comments from a submitted PR review.
 * Called by on-pr-review.yml after a pull_request_review: submitted event.
 *
 * Responsibilities:
 *   1. Fetch all inline comments of the review via GitHub API
 *   2. Group comments by thread (thread_root_id)
 *   3. For each thread: take the last comment
 *      → if it starts with @role → dispatch an agent
 *      → otherwise → ignore
 *   4. For each invocation: build context (last 10 thread comments) + dispatch agent-execute.yml
 *   5. All dispatches in parallel (Promise.all)
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, REPO, ISSUE_NUMBER, PR_NUMBER, REVIEW_ID
 */

import { loadConfig } from './config.mjs';
import { setupGit, dispatchWorkflow, applyLabel } from './utils.mjs';
import { parseComment, resolveProjectContext, buildPrompt } from './agent-dispatch.mjs';

const THREAD_HISTORY_MAX = 10;

// ---------------------------------------------------------------------------
// GitHub API helpers
// ---------------------------------------------------------------------------

async function fetchReviewComments(repo, prNumber, reviewId, token) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/pulls/${prNumber}/comments?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch review comments: HTTP ${res.status}`);
  const all = await res.json();
  // Filter to this review only
  return all.filter(c => String(c.pull_request_review_id) === String(reviewId));
}

// ---------------------------------------------------------------------------
// Thread grouping
// ---------------------------------------------------------------------------

/**
 * Groups comments by thread root id.
 * thread_root_id = comment.in_reply_to_id ?? comment.id
 * Returns Map<thread_root_id, comment[]> sorted by created_at asc.
 */
function groupByThread(comments) {
  const threads = new Map();
  for (const comment of comments) {
    const rootId = comment.in_reply_to_id ?? comment.id;
    if (!threads.has(rootId)) threads.set(rootId, []);
    threads.get(rootId).push(comment);
  }
  // Sort each thread by created_at asc
  for (const [, thread] of threads) {
    thread.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  return threads;
}

// ---------------------------------------------------------------------------
// Context block builder for a thread
// ---------------------------------------------------------------------------

function buildThreadContextBlock(thread, prNumber, prTitle, prBody) {
  const lines = [];
  lines.push(`## Context for PR #${prNumber}`);
  lines.push(`**Title:** ${prTitle}`);
  lines.push('');
  lines.push(prBody || '');
  lines.push('');

  const root = thread[0];
  lines.push(`**File:** ${root.path}`);
  if (root.line) lines.push(`**Line:** ${root.line}`);
  if (root.diff_hunk) {
    lines.push('');
    lines.push('**Diff hunk:**');
    lines.push('```');
    lines.push(root.diff_hunk);
    lines.push('```');
  }
  lines.push('');

  // Last N comments of the thread as history
  const history = thread.slice(-THREAD_HISTORY_MAX);
  if (history.length > 0) {
    lines.push('## Thread history');
    for (const c of history) {
      lines.push(`- **${c.user.login}**: ${c.body.slice(0, 300)}`);
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const repo        = process.env.REPO;
  const token       = process.env.GITHUB_TOKEN;
  const issueNumber = process.env.ISSUE_NUMBER;
  const prNumber    = process.env.PR_NUMBER;
  const reviewId    = process.env.REVIEW_ID;
  const prTitle     = process.env.PR_TITLE     || '';
  const prBody      = process.env.PR_BODY      || '';

  if (!repo)        throw new Error('REPO missing');
  if (!token)       throw new Error('GITHUB_TOKEN missing');
  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!prNumber)    throw new Error('PR_NUMBER missing');
  if (!reviewId)    throw new Error('REVIEW_ID missing');

  console.log(`[dispatch-review-agents] Processing review #${reviewId} on PR #${prNumber} (issue #${issueNumber})`);

  // 1. Fetch inline comments of the review
  const comments = await fetchReviewComments(repo, prNumber, reviewId, token);
  console.log(`[dispatch-review-agents] ${comments.length} inline comment(s) found for review #${reviewId}`);

  if (comments.length === 0) {
    console.log('[dispatch-review-agents] No inline comments — nothing to dispatch.');
    return;
  }

  // 2. Group by thread
  const threads = groupByThread(comments);
  console.log(`[dispatch-review-agents] ${threads.size} thread(s) identified`);

  // 3. Load config + resolve context (same for all dispatches)
  const config = loadConfig();
  const { docsPath, appPath, currentProject } = resolveProjectContext(config);
  const featureBranch = `feature/issue-${issueNumber}`;

  setupGit('dispatch-review-agents', config, repo, token);

  // 4. For each thread: check last comment, dispatch if @role
  const dispatches = [];

  for (const [rootId, thread] of threads) {
    const last = thread[thread.length - 1];

    if (!last.body.trimStart().startsWith('@')) {
      console.log(`[dispatch-review-agents] Thread ${rootId} — last comment does not start with @ — skipping`);
      continue;
    }

    const parsed = parseComment(last.body);
    if (!parsed) continue;

    const { role, request } = parsed;
    const contextBlock = buildThreadContextBlock(thread, prNumber, prTitle, prBody);

    const prompt = buildPrompt({
      role,
      request,
      branch:       featureBranch,
      issueNumber,
      repo,
      docsPath,
      appPath,
      currentProject,
      contextBlock,
      originType:         'pull_request_review_comment',
      prNumber,
      replyToCommentId:   String(rootId),
      commentPath:        last.path        || '',
      commentLine:        String(last.line || ''),
      commentDiffHunk:    last.diff_hunk   || '',
      config,
    });

    console.log(`[dispatch-review-agents] Thread ${rootId} — dispatching @${role} (${prompt.length} chars)`);

    dispatches.push(
      dispatchWorkflow('agent-execute.yml', {
        issue_number: String(issueNumber),
        branch:       featureBranch,
        prompt,
        role,
        model:     config.model,
        retry_max: String(config.retry_max),
      }, repo, token)
    );
  }

  if (dispatches.length === 0) {
    console.log('[dispatch-review-agents] No @role invocations found — nothing dispatched.');
    return;
  }

  // 5. Dispatch all in parallel
  await Promise.all(dispatches);
  await applyLabel('in progress', issueNumber, repo, token, 'dispatch-review-agents');
  console.log(`[dispatch-review-agents] ${dispatches.length} agent(s) dispatched.`);
}

main().catch(err => {
  console.error('[dispatch-review-agents] ERROR:', err.message);
  process.exit(1);
});
