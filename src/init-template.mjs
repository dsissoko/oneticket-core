/**
 * init-template.mjs
 *
 * [DETERMINISTIC] Initializes the app scaffold for current_project from a template.
 * Triggered by @leaddev init-<template> via on-issue-comment.yml.
 * Idempotent — skips if apps/<current_project>/app/ already exists.
 *
 * Steps:
 *   1. Validate template exists (apps/<template>/app/)
 *   2. Check idempotence — skip if apps/<current_project>/app/ already exists
 *   3. Git setup + checkout feature/issue-N
 *   4. Copy apps/<template>/app/ → apps/<current_project>/app/ (excludes node_modules/, dist/)
 *   5. Replace all occurrences of template name / PascalCase in copied files
 *   6. Commit + push
 *   7. Post comment on issue
 *
 * Usage:
 *   node src/init-template.mjs <template>
 *   node src/init-template.mjs appshell
 *
 * Expected environment variables:
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 */

import fs from 'fs';
import path from 'path';
import { execFileSync, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';
import { setupGit, run, runWithRetry } from './utils.mjs';
import { createPR } from './create-pr.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, '..');

// Directories to exclude when copying the template
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Copies src directory to dest recursively, excluding EXCLUDE_DIRS.
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Converts a lowercase name to TitleCase by capitalizing each word.
 * Words are detected by splitting on common separators or known compound patterns.
 * Examples: "appshell" → "AppShell", "monjournal" → "MonJournal"
 *
 * Strategy: tries known word boundaries first (dictionary-based),
 * falls back to simple first-char uppercase.
 */
const KNOWN_COMPOUNDS = {
  appshell:   'AppShell',
  monjournal: 'MonJournal',
  spaceinvaders: 'SpaceInvaders',
  breakout:   'Breakout',
};

function toTitleCase(name) {
  return KNOWN_COMPOUNDS[name.toLowerCase()] || (name.charAt(0).toUpperCase() + name.slice(1));
}

/**
 * Replaces all occurrences of template name with project name in a file.
 * Handles lowercase, PascalCase (first char), and TitleCase (compound) variants.
 * Skips binary files silently.
 */
function replaceInFile(filePath, templateName, projectName) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return; // binary file — skip
  }

  const templatePascal = templateName.charAt(0).toUpperCase() + templateName.slice(1);
  const projectPascal  = projectName.charAt(0).toUpperCase() + projectName.slice(1);
  const templateTitle  = toTitleCase(templateName);
  const projectTitle   = toTitleCase(projectName);

  const updated = content
    .replaceAll(templateTitle,  projectTitle)
    .replaceAll(templatePascal, projectPascal)
    .replaceAll(templateName,   projectName);

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
}

/**
 * Recursively replaces template name in all files under dir.
 * Skips EXCLUDE_DIRS.
 */
function replaceInDir(dir, templateName, projectName) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(entryPath, templateName, projectName);
    } else {
      replaceInFile(entryPath, templateName, projectName);
    }
  }
}

/**
 * Posts a comment on the issue via gh CLI.
 */
function postComment(issueNumber, repo, ghToken, body) {
  try {
    execFileSync('gh', ['issue', 'comment', String(issueNumber), '--repo', repo, '--body', body],
      { env: { ...process.env, GH_TOKEN: ghToken }, stdio: 'inherit' });
  } catch (e) {
    console.error('[init-template] Could not post comment:', e.message);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const template    = process.argv[2];
  const issueNumber = process.env.ISSUE_NUMBER;
  const repo        = process.env.REPO;
  const ghToken     = process.env.GITHUB_TOKEN;

  if (!template)    throw new Error('Template name missing — usage: node src/init-template.mjs <template>');
  if (!issueNumber) throw new Error('ISSUE_NUMBER missing');
  if (!repo)        throw new Error('REPO missing');

  const config         = loadConfig();
  const currentProject = config.current_project;

  if (!currentProject) {
    postComment(issueNumber, repo, ghToken,
      `## Configuration error\n\n\`current_project\` is not set in \`.oneticket/config.yml\`.\n\nPlease set it before running \`@leaddev init-${template}\`.`
    );
    process.exit(0);
  }

  const templateAppPath = path.join(ROOT, 'apps', template, 'app');
  const projectAppPath  = path.join(ROOT, 'apps', currentProject, 'app');

  // Validate template exists
  if (!fs.existsSync(templateAppPath)) {
    postComment(issueNumber, repo, ghToken,
      `## Template not found\n\nTemplate \`${template}\` does not exist at \`apps/${template}/app/\`.\n\nAvailable templates: ${
        fs.readdirSync(path.join(ROOT, 'apps'))
          .filter(d => fs.existsSync(path.join(ROOT, 'apps', d, 'app')))
          .join(', ')
      }`
    );
    process.exit(0);
  }

  // Idempotence — skip if already exists
  if (fs.existsSync(projectAppPath)) {
    postComment(issueNumber, repo, ghToken,
      `## Template already initialized\n\n\`apps/${currentProject}/app/\` already exists — skipping.\n\nIf you want to reinitialize, delete the directory first.`
    );
    process.exit(0);
  }

  const featureBranch = `feature/issue-${issueNumber}`;

  // Git setup + checkout feature branch
  setupGit('init-template', config, repo, ghToken);
  run('init-template', `git checkout -B ${featureBranch} origin/${featureBranch}`);

  // Copy template
  console.log(`[init-template] Copying apps/${template}/app/ → apps/${currentProject}/app/...`);
  copyDir(templateAppPath, projectAppPath);

  // Replace placeholders
  console.log(`[init-template] Replacing "${template}" → "${currentProject}" in copied files...`);
  replaceInDir(projectAppPath, template, currentProject);

  // Commit + push
  run('init-template', `git add apps/${currentProject}/app/`);
  run('init-template', `git commit -m "feat: init ${currentProject} app from ${template} template"`);
  runWithRetry('init-template', `git push origin ${featureBranch}`);

  // Create PR if files were pushed
  await createPR(issueNumber, featureBranch, repo, ghToken, config);

  // Post success comment
  postComment(issueNumber, repo, ghToken,
    `## Template initialized\n\n\`apps/${currentProject}/app/\` created from \`${template}\` template.\n\nBranch: \`${featureBranch}\``
  );

  console.log(`[init-template] Done — apps/${currentProject}/app/ initialized from ${template}.`);
}

main().catch(err => {
  console.error('[init-template] ERROR:', err.message);
  process.exit(1);
});
