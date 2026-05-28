#!/usr/bin/env node
// link-docs.mjs — copies DOC_SOURCE into src/content/docs/ with minimal transformations
//
// 1. Cleans and recreates src/content/docs/ from docSource (clean copy each run)
// 2. Renames README.md → index.md (Starlight uses index.md as directory root page)
// 3. Injects minimal frontmatter { title } extracted from first H1 — required by Starlight
// 4. Removes the H1 from body to avoid duplicate with Starlight's auto title rendering
// 5. Generates index.md for directories without one (TOC of files and subdirs)
//
// src/content/docs/ is gitignored — always regenerated before dev/build.
// Sources in .oneticket/docs/ are NEVER modified.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, '..');

// Resolve DOC_SOURCE
const docSource = process.env.DOC_SOURCE
  ? path.resolve(repoRoot, process.env.DOC_SOURCE)
  : path.resolve(repoRoot, '.oneticket/docs');

const destDir = path.resolve(__dirname, 'src/content/docs');

// ASTRO_BASE is set by CI workflow — used to prefix absolute URLs in links
// so they resolve correctly regardless of the site base path
const astroBase = (process.env.ASTRO_BASE || '').replace(/\/$/, '');

// Transform a single markdown file — inject title from H1, remove H1 from body
// srcFile: absolute path of the source file (used to resolve relative links)
function transformMarkdown(content, srcFile) {
  // Strip existing YAML frontmatter if present (agents may commit files with frontmatter)
  const fmMatch = content.match(/^---\n[\s\S]*?\n---\n?/);
  const stripped = fmMatch ? content.slice(fmMatch[0].length) : content;

  // Extract title from first H1
  const h1Match = stripped.match(/^#\s+(.+)$/m);
  const title   = h1Match ? h1Match[1].trim() : 'Untitled';
  const body    = h1Match
    ? stripped.replace(/^#\s+.+\n?/m, '').replace(/^\n+/, '\n')
    : stripped;

  // Convert markdown links to absolute Starlight URLs
  // Relative .md links are resolved from the source file location → absolute path from docSource root
  // e.g. from what/epics/epic-0-mvp/epic.md: ../../../how/slices/slice-1/slice.md → /how/slices/slice-1/slice/
  const srcDir = path.dirname(srcFile);
  const converted = body.replace(
    /\[([^\]]*)\]\(([^)]+\.md)(#[^)]*)?\)/g,
    (_, text, mdPath, anchor) => {
      // Skip external links and absolute paths
      if (mdPath.startsWith('http') || mdPath.startsWith('/')) {
        return `[${text}](${mdPath.replace(/\.md$/, '/')}${anchor || ''})`;
      }
      // Resolve relative path from source file location
      const absPath   = path.resolve(srcDir, mdPath);
      // Make it relative to docSource root → Starlight URL prefixed with ASTRO_BASE
      const fromRoot  = path.relative(docSource, absPath);
      const urlPath   = astroBase + '/' + fromRoot.replace(/\.md$/, '/').replace(/\\/g, '/');
      return `[${text}](${urlPath}${anchor || ''})`;
    }
  );

  return `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n${converted}`;
}

// Copy docSource → destDir, renaming README.md → index.md
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destName = entry.name === 'README.md' ? 'index.md' : entry.name;
    const destPath = path.join(dest, destName);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.md')) {
      fs.writeFileSync(destPath, transformMarkdown(fs.readFileSync(srcPath, 'utf8'), srcPath));
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Generate index.md with TOC for directories without one
function toTitle(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function generateIndex(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const title   = toTitle(path.basename(dir));
  const links   = [];

  for (const e of entries.filter(e => e.isDirectory()))
    links.push(`- [${toTitle(e.name)}](./${e.name}/)`);

  for (const e of entries.filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md'))
    links.push(`- [${toTitle(e.name.replace(/\.md$/, ''))}](./${e.name.replace(/\.md$/, '')})`);

  fs.writeFileSync(
    path.join(dir, 'index.md'),
    `---\ntitle: '${title}'\n---\n\n${links.join('\n')}\n`
  );
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  if (!fs.existsSync(path.join(dir, 'index.md'))) generateIndex(dir);
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()))
    processDirectory(path.join(dir, e.name));
}

// Clean previous copy and rebuild
if (!fs.existsSync(docSource)) {
  console.error(`[link-docs] ERROR: doc source not found: ${docSource}`);
  console.error(`[link-docs] Set DOC_SOURCE env var or ensure .oneticket/docs exists.`);
  process.exit(1);
}
if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
copyDir(docSource, destDir);
processDirectory(destDir);
console.log(`[link-docs] ${docSource} → ${destDir}`);
