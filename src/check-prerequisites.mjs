/**
 * check-prerequisites.mjs
 *
 * [DETERMINISTIC] Gate 0 + doc structure check before any agentic run.
 * Called by on-issue-comment.yml after ensure-issue-branch.mjs.
 *
 * Responsibilities:
 *   1. Gate 0 — verify current_project is defined in .oneticket/config.yml
 *      → if missing: post comment on issue + exit 1 (pipeline stops)
 *   2. init-doc — verify docs_path contains the standard structure (what/how/ship/run)
 *      → if missing: run init-doc.mjs to copy templates/docs/ → docs_path
 *      → if templates/docs/ absent: post comment on issue + exit 1
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 */

import { execFileSync, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');

// Standard doc structure — all 4 directories must exist
const DOC_DIRS = ['what', 'how', 'ship', 'run'];

/**
 * Posts a comment on the issue via gh CLI.
 */
function postComment(issueNumber, repo, ghToken, body) {
  try {
    execFileSync('gh', ['issue', 'comment', String(issueNumber), '--repo', repo, '--body', body],
      { env: { ...process.env, GH_TOKEN: ghToken }, stdio: 'inherit' });
  } catch (e) {
    console.error('[check-prerequisites] Could not post comment:', e.message);
  }
}

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const repo        = process.env.REPO;
  const ghToken     = process.env.GITHUB_TOKEN;

  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  // ---------------------------------------------------------------------------
  // 1. Gate 0 — current_project check
  // ---------------------------------------------------------------------------

  let config;
  try {
    config = loadConfig();
  } catch (e) {
    const body = `## Configuration error\n\nCould not read \`.oneticket/config.yml\`: ${e.message}`;
    postComment(issueNumber, repo, ghToken, body);
    process.exit(1);
  }

  if (!config.current_project) {
    const body = [
      `## Configuration error`,
      ``,
      `\`current_project\` is not set in \`.oneticket/config.yml\`.`,
      ``,
      `Please set it before triggering an agent:`,
      `\`\`\`yaml`,
      `current_project: <your-project-name>`,
      `\`\`\``,
    ].join('\n');
    postComment(issueNumber, repo, ghToken, body);
    process.exit(1);
  }

  const currentProject = config.current_project;
  const docsPath = currentProject === 'oneticket-core'
    ? '.oneticket/docs'
    : `apps/${currentProject}/docs`;

  console.log(`[check-prerequisites] Gate 0 OK — current_project="${currentProject}", docs_path="${docsPath}"`);

  // ---------------------------------------------------------------------------
  // 2. init-doc — doc structure check
  // ---------------------------------------------------------------------------

  const docsAbs = path.join(ROOT, docsPath);
  const missingDirs = DOC_DIRS.filter(d => !fs.existsSync(path.join(docsAbs, d)));

  if (missingDirs.length === 0) {
    console.log(`[check-prerequisites] Doc structure OK at ${docsPath}`);
    return;
  }

  console.log(`[check-prerequisites] Missing doc dirs: ${missingDirs.join(', ')} — running init-doc...`);

  // Check templates exist before attempting init
  const templatesPath = path.join(ROOT, '.oneticket', 'templates', 'docs');
  if (!fs.existsSync(templatesPath)) {
    const body = [
      `## Repository configuration error`,
      ``,
      `\`.oneticket/templates/docs/\` is missing from this repository.`,
      ``,
      `This directory is required to initialize the doc structure for \`${docsPath}\`.`,
      `Without it, the doc site cannot be generated.`,
      ``,
      `> Please restore \`.oneticket/templates/docs/\` from the OneTicket framework repository.`,
    ].join('\n');
    postComment(issueNumber, repo, ghToken, body);
    process.exit(1);
  }

  try {
    execSync(`node src/init-doc.mjs ${docsPath}`, { stdio: 'inherit', cwd: ROOT });
  } catch (e) {
    const body = [
      `## Doc initialization error`,
      ``,
      `Failed to initialize doc structure at \`${docsPath}\`: ${e.message}`,
    ].join('\n');
    postComment(issueNumber, repo, ghToken, body);
    process.exit(1);
  }

  console.log(`[check-prerequisites] Doc structure initialized at ${docsPath}`);
}

main().catch(err => {
  console.error('[check-prerequisites] ERROR:', err.message);
  process.exit(1);
});
