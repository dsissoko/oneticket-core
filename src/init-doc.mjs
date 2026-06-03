/**
 * init-doc.mjs
 *
 * [DETERMINISTIC] Initializes the doc structure for a project.
 * Copies .oneticket/templates/docs/ to <docs_path> — idempotent, never overwrites existing files.
 *
 * Two modes:
 *
 * 1. Library mode — called by check-prerequisites.mjs with docs_path argument:
 *    node src/init-doc.mjs <docs_path>
 *    node src/init-doc.mjs apps/breakout/docs
 *
 * 2. Command mode — called by on-issue-comment.yml (@po init-doc):
 *    node src/init-doc.mjs
 *    (no argument — reads current_project from config.yml, does git setup + commit + push + comment)
 *
 * Exit codes:
 *   0 — success (created, already existed, or handled config error)
 *   1 — unexpected error (templates missing, git failure)
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';
import { setupGit, run, runCapture, runWithRetry } from './utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');

const TEMPLATES_SRC = path.join(ROOT, '.oneticket', 'templates', 'docs');

// ---------------------------------------------------------------------------
// Core copy function — shared by both modes
// ---------------------------------------------------------------------------

/**
 * Copies src directory to dest recursively.
 * Idempotent — never overwrites existing files.
 * Returns the number of files created.
 */
function copyDir(src, dest) {
  let created = 0;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      created += copyDir(srcPath, destPath);
    } else {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`[init-doc] created ${path.relative(ROOT, destPath)}`);
        created++;
      } else {
        console.log(`[init-doc] kept    ${path.relative(ROOT, destPath)} (already exists)`);
      }
    }
  }
  return created;
}

/**
 * Posts a comment on the issue via gh CLI.
 */
function postComment(issueNumber, repo, ghToken, body) {
  try {
    execFileSync('gh', ['issue', 'comment', String(issueNumber), '--repo', repo, '--body', body],
      { env: { ...process.env, GH_TOKEN: ghToken }, stdio: 'inherit' });
  } catch (e) {
    console.error('[init-doc] Could not post comment:', e.message);
  }
}

// ---------------------------------------------------------------------------
// Mode 1 — Library mode (called by check-prerequisites.mjs)
// ---------------------------------------------------------------------------

const docsPath = process.argv[2];

if (docsPath) {
  // Templates must exist — if not, it is a repo configuration error
  if (!fs.existsSync(TEMPLATES_SRC)) {
    process.stderr.write(
      `[init-doc] ERROR: .oneticket/templates/docs/ not found.\n` +
      `This directory is required for doc site generation.\n` +
      `Please restore it from the OneTicket framework repository.\n`
    );
    process.exit(1);
  }

  const dest = path.join(ROOT, docsPath);
  console.log(`[init-doc] Initializing doc structure at ${docsPath}...`);
  copyDir(TEMPLATES_SRC, dest);
  console.log(`[init-doc] Done.`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Mode 2 — Command mode (called by on-issue-comment.yml via @po init-doc)
// ---------------------------------------------------------------------------

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const repo        = process.env.REPO;
  const ghToken     = process.env.GITHUB_TOKEN;

  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  // Gate 0 — current_project check
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    postComment(issueNumber, repo, ghToken,
      `## Configuration error\n\nCould not read \`.oneticket/config.yml\`: ${e.message}`
    );
    process.exit(0);
  }

  if (!config.current_project) {
    postComment(issueNumber, repo, ghToken,
      `## Configuration error\n\n\`current_project\` is not set in \`.oneticket/config.yml\`.\n\nPlease set it before running \`@po init-doc\`.`
    );
    process.exit(0);
  }

  const currentProject = config.current_project;
  const resolvedDocsPath = currentProject === 'oneticket-core'
    ? '.oneticket/docs'
    : `apps/${currentProject}/docs`;

  // Templates must exist
  if (!fs.existsSync(TEMPLATES_SRC)) {
    postComment(issueNumber, repo, ghToken,
      `## Repository configuration error\n\n\`.oneticket/templates/docs/\` is missing.\n\nThis directory is required to initialize the doc structure for \`${resolvedDocsPath}\`.`
    );
    process.exit(1);
  }

  const featureBranch = `feature/issue-${issueNumber}`;

  // Git setup
  setupGit('init-doc', config, repo, ghToken);

  // Ensure feature branch exists — create if absent
  const remoteBranches = runCapture('init-doc', 'git branch -r');
  if (!remoteBranches.includes(`origin/${featureBranch}`)) {
    console.log(`[init-doc] Creating ${featureBranch}...`);
    run('init-doc', `git checkout -b ${featureBranch}`);
    runWithRetry('init-doc', `git push origin ${featureBranch}`);
    run('init-doc', `git checkout -`);
  }

  // Checkout feature branch
  run('init-doc', `git checkout -B ${featureBranch} origin/${featureBranch}`);

  const dest = path.join(ROOT, resolvedDocsPath);
  console.log(`[init-doc] Initializing doc structure at ${resolvedDocsPath}...`);
  const created = copyDir(TEMPLATES_SRC, dest);

  if (created === 0) {
    postComment(issueNumber, repo, ghToken,
      `## Doc structure already initialized\n\n\`${resolvedDocsPath}\` already contains the full doc structure — nothing to do.`
    );
    console.log('[init-doc] Nothing to commit — doc structure already complete.');
    return;
  }

  // Commit + push
  run('init-doc', `git add ${resolvedDocsPath}`);
  run('init-doc', `git commit -m "feat: init doc structure for ${currentProject}"`);
  runWithRetry('init-doc', `git push origin ${featureBranch}`);

  postComment(issueNumber, repo, ghToken,
    `## Doc structure initialized\n\n\`${resolvedDocsPath}\` created with standard structure (what/how/ship/run).\n\nBranch: \`${featureBranch}\``
  );

  console.log(`[init-doc] Done — ${created} file(s) created at ${resolvedDocsPath}.`);
}

main().catch(err => {
  console.error('[init-doc] ERROR:', err.message);
  process.exit(1);
});
