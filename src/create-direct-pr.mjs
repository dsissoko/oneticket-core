/**
 * create-direct-pr.mjs
 *
 * [DETERMINISTIC] Creates a PR for a feature/issue-N branch when no manifest was produced.
 * Called by agent-execute.yml when the agent worked directly (no FAN-OUT pipeline).
 *
 * Idempotent — if a PR already exists for the branch, exits without creating a duplicate.
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 */

import { loadConfig } from './config.mjs';

const repo        = process.env.REPO;
const ghToken     = process.env.GITHUB_TOKEN;
const issueNumber = process.env.ISSUE_NUMBER;

if (!repo)        throw new Error('[create-direct-pr] REPO missing');
if (!ghToken)     throw new Error('[create-direct-pr] GITHUB_TOKEN missing');
if (!issueNumber) throw new Error('[create-direct-pr] ISSUE_NUMBER missing');

const config     = loadConfig();
const branch     = `feature/issue-${issueNumber}`;
const prBase     = config.pr_base;
const apiHeaders = {
  Authorization:        `Bearer ${ghToken}`,
  Accept:               'application/vnd.github+json',
  'Content-Type':       'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
};

// [IDEMPOTENCE] Check if a PR already exists for this branch
async function getExistingPR() {
  const url = `https://api.github.com/repos/${repo}/pulls?head=${repo.split('/')[0]}:${branch}&state=open`;
  const res = await fetch(url, { headers: apiHeaders });
  if (!res.ok) throw new Error(`[create-direct-pr] Failed to list PRs: ${res.status}`);
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

async function createPR() {
  const existing = await getExistingPR();
  if (existing) {
    console.log(`[create-direct-pr] PR already exists: ${existing.html_url} — skipping.`);
    return;
  }

  const url  = `https://api.github.com/repos/${repo}/pulls`;
  const body = JSON.stringify({
    title: `feat: complete work for issue #${issueNumber}`,
    body:  `Closes #${issueNumber}`,
    head:  branch,
    base:  prBase,
  });

  const res  = await fetch(url, { method: 'POST', headers: apiHeaders, body });
  const data = await res.json();

  if (!res.ok) throw new Error(`[create-direct-pr] Failed to create PR: ${JSON.stringify(data)}`);
  console.log(`[create-direct-pr] PR created: ${data.html_url}`);
}

createPR().catch(err => {
  console.error('[create-direct-pr] ERROR:', err.message);
  process.exit(1);
});
