/**
 * build-context.mjs
 *
 * [DETERMINISTIC] Builds the CONTEXT_BLOCK injected into agent prompts.
 * Fetches comment history from GitHub API and formats it with issue/PR metadata.
 *
 * Called by trigger workflows (on-issue-comment.yml, on-pr-comment.yml,
 * on-pr-review-comment.yml) before dispatching to agent-dispatch.mjs.
 *
 * Writes base64-encoded CONTEXT_BLOCK to stdout.
 *
 * Environment variables:
 *   GITHUB_TOKEN          — GitHub PAT
 *   REPO                  — owner/repo
 *   ORIGIN_TYPE           — issue_comment | pull_request_comment | pull_request_review_comment
 *   ISSUE_NUMBER          — issue or PR number
 *   CURRENT_COMMENT_ID    — current comment id (excluded from history)
 *   ISSUE_TITLE           — issue or PR title
 *   ISSUE_BODY            — issue or PR body
 *
 *   For pull_request_review_comment only:
 *   COMMENT_PATH          — file path of the inline comment
 *   COMMENT_LINE          — line number of the inline comment
 *   COMMENT_DIFF_HUNK     — diff hunk context
 *   COMMENT_BODY          — body of the inline comment
 */

import { COMMENT_HISTORY_MAX, COMMENT_BODY_MAX_CHARS, COMMENT_HISTORY_TITLE } from './constants.mjs';

const token        = process.env.GITHUB_TOKEN;
const repo         = process.env.REPO;
const originType   = process.env.ORIGIN_TYPE   || 'issue_comment';
const issueNumber  = process.env.ISSUE_NUMBER;
const currentId    = String(process.env.CURRENT_COMMENT_ID || '');
const issueTitle   = process.env.ISSUE_TITLE   || '';
const issueBody    = process.env.ISSUE_BODY     || '';

// pull_request_review_comment specific
const commentPath     = process.env.COMMENT_PATH      || '';
const commentLine     = process.env.COMMENT_LINE      || '';
const commentDiffHunk = process.env.COMMENT_DIFF_HUNK || '';
const commentBody     = process.env.COMMENT_BODY      || '';

if (!token)       { console.error('[build-context] GITHUB_TOKEN missing'); process.exit(1); }
if (!repo)        { console.error('[build-context] REPO missing'); process.exit(1); }
if (!issueNumber) { console.error('[build-context] ISSUE_NUMBER missing'); process.exit(1); }

// ---------------------------------------------------------------------------
// GitHub API helper
// ---------------------------------------------------------------------------

async function githubApi(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization:          `Bearer ${token}`,
      Accept:                 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${path} → ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Fetch comment history
// ---------------------------------------------------------------------------

async function fetchCommentHistory() {
  try {
    let endpoint;
    if (originType === 'pull_request_review_comment') {
      endpoint = `/repos/${repo}/pulls/${issueNumber}/comments?per_page=100`;
    } else {
      // issue_comment and pull_request_comment both use issues API
      endpoint = `/repos/${repo}/issues/${issueNumber}/comments?per_page=100`;
    }

    const comments = await githubApi(endpoint);

    return comments
      .filter(c => String(c.id) !== currentId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-COMMENT_HISTORY_MAX)
      .map(c => ({
        author:     c.user?.login || 'unknown',
        created_at: c.created_at?.slice(0, 10) || '',
        body:       (c.body || '').slice(0, COMMENT_BODY_MAX_CHARS),
      }));
  } catch (err) {
    console.error(`[build-context] Could not fetch comment history: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Format context block
// ---------------------------------------------------------------------------

function formatHistory(comments) {
  if (comments.length === 0) return '';
  const lines = [COMMENT_HISTORY_TITLE, ''];
  for (const c of comments) {
    lines.push(`**${c.author}** (${c.created_at}):`);
    lines.push(c.body);
    lines.push('---');
  }
  return lines.join('\n');
}

function buildContextBlock(history) {
  const lines = [];

  if (originType === 'pull_request_review_comment') {
    lines.push(`## Context for PR #${issueNumber}`);
    lines.push(`**Title:** ${issueTitle}`);
    lines.push('');
    lines.push(issueBody);
    lines.push('');
    if (commentPath) {
      lines.push(`**File:** ${commentPath}`);
      lines.push(`**Line:** ${commentLine}`);
      lines.push('');
      lines.push('**Diff hunk:**');
      lines.push('```');
      lines.push(commentDiffHunk);
      lines.push('```');
      lines.push('');
      lines.push(`**Original comment:** ${commentBody}`);
    }
  } else {
    lines.push(`## Context for issue #${issueNumber}`);
    lines.push(`**Title:** ${issueTitle}`);
    lines.push('');
    lines.push(issueBody);
  }

  const historyBlock = formatHistory(history);
  if (historyBlock) {
    lines.push('');
    lines.push(historyBlock);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const history = await fetchCommentHistory();
const block   = buildContextBlock(history);
const encoded = Buffer.from(block).toString('base64');

process.stdout.write(encoded);
