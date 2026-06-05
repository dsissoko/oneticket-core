/**
 * create-pr.mjs
 *
 * [DETERMINISTIC] Creates a PR feature/issue-N → main when files have been pushed.
 * Idempotent — safe to call multiple times.
 *
 * Rules:
 *   - Only creates a PR for feature/issue-N branches — task/* branches are ignored
 *   - Only creates a PR if there are commits ahead of pr_base
 *   - Never creates a duplicate PR — checks for existing open PR first
 *
 * Called from:
 *   - agent-execute.yml — after every push (direct runs)
 *   - orchestrate.mjs   — at allDone (FAN-OUT pipeline)
 *
 * Expected environment variables (standalone mode):
 *   GITHUB_TOKEN, REPO, ISSUE_NUMBER, BRANCH
 *
 * Exported function (module mode):
 *   createPR(issueNumber, branch, repo, token, config, manifest?)
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { loadConfig } from './config.mjs';
import { applyLabel } from './utils.mjs';
import { TASKS_DIR, MANIFEST_FILE } from './constants.mjs';

const GH_HEADERS = (token) => ({
  Authorization:          `Bearer ${token}`,
  Accept:                 'application/vnd.github+json',
  'Content-Type':         'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of commits ahead of pr_base on the current branch.
 */
function commitsAhead(prBase) {
  try {
    const count = execSync(`git rev-list --count origin/${prBase}..HEAD`, { encoding: 'utf8' }).trim();
    return parseInt(count, 10);
  } catch (e) {
    console.warn(`[create-pr] Could not count commits ahead of ${prBase}: ${e.message}`);
    return 0;
  }
}

/**
 * Returns an existing open PR for the given branch, or null.
 */
async function getExistingPR(branch, repo, token) {
  const owner = repo.split('/')[0];
  const res = await fetch(
    `https://api.github.com/repos/${repo}/pulls?head=${owner}:${branch}&state=open`,
    { headers: GH_HEADERS(token) }
  );
  if (!res.ok) throw new Error(`[create-pr] Failed to list PRs: ${res.status}`);
  const prs = await res.json();
  return prs.length > 0 ? prs[0] : null;
}

/**
 * Fetches the issue title from GitHub API.
 */
async function getIssueTitle(issueNumber, repo, token) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/issues/${issueNumber}`,
      { headers: GH_HEADERS(token) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch (e) {
    return null;
  }
}

/**
 * Posts a comment on the issue with the PR link.
 */
async function postPRComment(issueNumber, prUrl, repo, token) {
  try {
    await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      headers: GH_HEADERS(token),
      body: JSON.stringify({ body: `## Pull request ready\n\n${prUrl}` }),
    });
  } catch (e) {
    console.warn(`[create-pr] Could not post PR comment: ${e.message}`);
  }
}

/**
 * Applies a label to the issue (creates it if needed).
 */
async function applyLabel(labelName, issueNumber, repo, token) {
  const color = labelName === 'ready for review' ? '0e8a16' : 'ededed';
  try {
    const check = await fetch(
      `https://api.github.com/repos/${repo}/labels/${encodeURIComponent(labelName)}`,
      { headers: GH_HEADERS(token) }
    );
    if (check.status === 404) {
      await fetch(`https://api.github.com/repos/${repo}/labels`, {
        method: 'POST',
        headers: GH_HEADERS(token),
        body: JSON.stringify({ name: labelName, color }),
      });
    }
    await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/labels`, {
      method: 'POST',
      headers: GH_HEADERS(token),
      body: JSON.stringify({ labels: [labelName] }),
    });
  } catch (e) {
    console.warn(`[create-pr] Could not apply label "${labelName}": ${e.message}`);
  }
}

/**
 * Removes a label from the issue.
 */
async function removeLabel(labelName, issueNumber, repo, token) {
  try {
    await fetch(
      `https://api.github.com/repos/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(labelName)}`,
      { method: 'DELETE', headers: GH_HEADERS(token) }
    );
  } catch (e) {
    console.warn(`[create-pr] Could not remove label "${labelName}": ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Core function — exportable for orchestrate.mjs
// ---------------------------------------------------------------------------

/**
 * Creates a PR feature/issue-N → pr_base if conditions are met.
 * Idempotent — safe to call multiple times.
 * In FAN-OUT context (manifest provided without allDone), creates PR with
 * minimal body — pipeline in progress.
 *
 * @param {string} issueNumber
 * @param {string} branch        - feature/issue-N
 * @param {string} repo          - owner/repo
 * @param {string} token         - GitHub PAT
 * @param {object} config        - loaded from config.mjs
 * @param {object} [manifest]    - optional, used to detect FAN-OUT context
 * @param {boolean} [allDone]    - true when all tasks complete
 */
export async function createPR(issueNumber, branch, repo, token, config, manifest = null, allDone = false) {
  // Only create PRs for feature branches
  if (!branch.match(/^feature\/issue-\d+$/)) {
    console.log(`[create-pr] Branch ${branch} is not a feature branch — skipping.`);
    return;
  }

  // If called from agent-execute.yml (no manifest param) and manifest is present on disk
  // → FAN-OUT pipeline will handle the PR — skip now
  if (!manifest) {
    const manifestPath = path.join(process.cwd(), TASKS_DIR, `issue-${issueNumber}`, MANIFEST_FILE);
    if (fs.existsSync(manifestPath)) {
      console.log(`[create-pr] Manifest present — FAN-OUT pipeline will create PR. Skipping.`);
      return;
    }
  }

  // Check commits ahead
  const ahead = commitsAhead(config.pr_base);
  if (ahead === 0) {
    console.log(`[create-pr] No commits ahead of ${config.pr_base} — nothing to PR.`);
    return;
  }

  // Idempotence — check existing PR
  const existing = await getExistingPR(branch, repo, token);
  if (existing) {
    console.log(`[create-pr] PR already exists: ${existing.html_url} — skipping.`);
    return;
  }

  // Build PR title and body
  const issueTitle = await getIssueTitle(issueNumber, repo, token);
  const title = issueTitle
    ? `feat: issue #${issueNumber} — ${issueTitle}`
    : `feat: issue #${issueNumber}`;

  // Body: minimal during FAN-OUT, enriched at allDone
  const bodyLines = [`Closes #${issueNumber}`];
  if (manifest && allDone) {
    bodyLines.push('', '## Completed tasks');
    for (const t of manifest.tasks) {
      bodyLines.push(`- [x] ${t.id} — \`${t.file}\``);
    }
  } else if (manifest) {
    bodyLines.push('', '_Pipeline in progress — tasks completing progressively._');
    bodyLines.push(`_See issue #${issueNumber} for real-time progress._`);
  }

  // Create PR
  const res = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
    method: 'POST',
    headers: GH_HEADERS(token),
    body: JSON.stringify({
      title,
      body:  bodyLines.join('\n'),
      head:  branch,
      base:  config.pr_base,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`[create-pr] Failed to create PR: ${JSON.stringify(data)}`);

  console.log(`[create-pr] PR created: ${data.html_url}`);

  await postPRComment(issueNumber, data.html_url, repo, token);

  // Direct run (no manifest) — apply ready for review immediately
  // FAN-OUT — ready for review applied by orchestrate.mjs at allDone
  if (!manifest) {
    await applyLabel('ready for review', issueNumber, repo, token);
  }
}

/**
 * Updates the body of an existing PR with the completed task list.
 * Called by orchestrate.mjs at allDone.
 *
 * @param {string} issueNumber
 * @param {string} branch
 * @param {string} repo
 * @param {string} token
 * @param {object} manifest  - full manifest with all tasks done
 */
export async function updatePR(issueNumber, branch, repo, token, manifest) {
  const existing = await getExistingPR(branch, repo, token);
  if (!existing) {
    console.log(`[create-pr] No existing PR to update for ${branch}.`);
    return;
  }

  const bodyLines = [
    `Closes #${issueNumber}`,
    '',
    '## Completed tasks',
    ...manifest.tasks.map(t => `- [x] ${t.id} — \`${t.file}\``),
  ];

  const res = await fetch(
    `https://api.github.com/repos/${repo}/pulls/${existing.number}`,
    {
      method: 'PATCH',
      headers: GH_HEADERS(token),
      body: JSON.stringify({ body: bodyLines.join('\n') }),
    }
  );

  if (res.ok) {
    console.log(`[create-pr] PR #${existing.number} body updated with completed tasks.`);
  } else {
    console.warn(`[create-pr] Could not update PR #${existing.number}: HTTP ${res.status}`);
  }
}

// ---------------------------------------------------------------------------
// Standalone entry point — called from agent-execute.yml
// ---------------------------------------------------------------------------

async function main() {
  const repo        = process.env.REPO;
  const token       = process.env.GITHUB_TOKEN;
  const issueNumber = process.env.ISSUE_NUMBER;
  const branch      = process.env.BRANCH;

  if (!repo)        throw new Error('REPO missing');
  if (!token)       throw new Error('GITHUB_TOKEN missing');
  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!branch)      throw new Error('BRANCH missing');

  const config = loadConfig();
  await createPR(issueNumber, branch, repo, token, config);
}

// Standalone entry point — only when executed directly, not when imported
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('[create-pr] ERROR:', err.message);
    process.exit(1);
  });
}
