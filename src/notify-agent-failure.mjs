/**
 * notify-agent-failure.mjs
 *
 * [DETERMINISTIC] Called by agent-execute.yml on agent failure.
 * - Posts a comment on the issue
 * - Applies 'dev error' label on the issue
 * - Applies 'dev error' label on the feature PR (if it exists)
 * - Removes 'ready for review' and 'in progress' labels from the PR
 *
 * Environment variables:
 *   GITHUB_TOKEN, REPO, ISSUE_NUMBER, BRANCH, RUN_URL, RETRY_COUNT, RETRY_MAX, IS_FANOUT_TASK
 */

import { applyLabel, removeLabel } from './utils.mjs';

const token       = process.env.GITHUB_TOKEN;
const repo        = process.env.REPO;
const issueNumber = process.env.ISSUE_NUMBER;
const branch      = process.env.BRANCH;
const runUrl      = process.env.RUN_URL      || '';
const retryCount  = process.env.RETRY_COUNT  || '0';
const retryMax    = process.env.RETRY_MAX    || '3';
const isFanout    = process.env.IS_FANOUT_TASK === 'true';

const GH_HEADERS = {
  Authorization:          `Bearer ${token}`,
  Accept:                 'application/vnd.github+json',
  'Content-Type':         'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function getExistingPR(branch) {
  const owner = repo.split('/')[0];
  const res = await fetch(
    `https://api.github.com/repos/${repo}/pulls?head=${owner}:${branch}&state=open`,
    { headers: GH_HEADERS }
  );
  if (!res.ok) return null;
  const prs = await res.json();
  return prs.length > 0 ? prs[0] : null;
}

async function postComment(body) {
  await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
    method:  'POST',
    headers: GH_HEADERS,
    body:    JSON.stringify({ body }),
  });
}

async function main() {
  const context = isFanout ? `task branch \`${branch}\`` : `feature branch \`${branch}\``;
  const body = `## Agent failure

The agent failed on ${context} (retry ${retryCount}/${retryMax}).

**Run:** ${runUrl}`;

  // Post comment on issue
  await postComment(body);
  console.log('[notify-agent-failure] Comment posted on issue');

  // Apply dev error on issue
  await applyLabel('dev error', issueNumber, repo, token, 'notify-agent-failure');

  // Only manage PR labels for feature branches (not FAN-OUT task branches)
  if (!isFanout) {
    const pr = await getExistingPR(branch);
    if (pr) {
      console.log(`[notify-agent-failure] Found PR #${pr.number} — applying dev error`);
      await removeLabel('ready for review', pr.number, repo, token, 'notify-agent-failure');
      await removeLabel('in progress',      pr.number, repo, token, 'notify-agent-failure');
      await applyLabel('dev error',         pr.number, repo, token, 'notify-agent-failure');
    }
  }

  console.log('[notify-agent-failure] Done');
}

main().catch(err => {
  console.error('[notify-agent-failure] ERROR:', err.message);
  process.exit(1);
});
