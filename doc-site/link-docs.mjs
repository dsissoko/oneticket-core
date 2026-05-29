#!/usr/bin/env node
// link-docs.mjs — copies DOC_SOURCE into src/content/docs/ with minimal transformations
//
// 1. Cleans and recreates src/content/docs/ from docSource (clean copy each run)
// 2. Renames README.md → index.md (Starlight uses index.md as directory root page)
// 3. Fixes cross-reference links: filename-only links and broken relative paths
//    resolved against a file index — no ../  counting required from agents
// 4. Injects minimal frontmatter { title } extracted from first H1 — required by Starlight
// 5. Removes the H1 from body to avoid duplicate with Starlight's auto title rendering
// 6. Generates index.md for directories without one (TOC of files and subdirs)
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

// Build a map of all .md files indexed by all path suffixes (most specific first)
// e.g. "how/slices/slice-0-setup/slice.md", "slices/slice-0-setup/slice.md",
//      "slice-0-setup/slice.md", "slice.md"
// First entry wins — most specific path takes precedence over ambiguous basename
function buildFileIndex(dir, root, index = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      buildFileIndex(fullPath, root, index);
    } else if (entry.name.endsWith('.md')) {
      const rel   = path.relative(root, fullPath).replace(/\\/g, '/');
      const parts = rel.split('/');
      // Index by all suffixes from most specific to least — skip if already set
      for (let i = 0; i < parts.length; i++) {
        const key = parts.slice(i).join('/');
        if (!index.has(key)) index.set(key, fullPath);
      }
    }
  }
  return index;
}

// Fix cross-reference links written as filename-only (no ../) by resolving them
// against the file index and computing the correct relative path.
// Also fixes broken relative paths that resolve outside docSource.
function fixCrossRefLinks(content, destFile, destDir, fileIndex) {
  const destFileDir = path.dirname(destFile);

  return content.replace(
    /\[([^\]]*)\]\(([^)]+\.md)(#[^)]*)?\)/g,
    (match, text, mdPath, anchor) => {
      // Skip external links and absolute paths
      if (mdPath.startsWith('http') || mdPath.startsWith('/')) return match;

      // Try to resolve the path as-is
      const resolved = path.resolve(destFileDir, mdPath);
      if (fs.existsSync(resolved)) return match; // already correct

      // Not found — try all suffixes of the stripped path from most to least specific
      // e.g. "how/slices/slice-0-setup/slice.md" → "slices/slice-0-setup/slice.md"
      //      → "slice-0-setup/slice.md" → "slice.md"
      const stripped = mdPath.replace(/^(\.\.\/)+/, '');
      const parts    = stripped.split('/');
      let target;
      for (let i = 0; i < parts.length; i++) {
        const key = parts.slice(i).join('/');
        if (fileIndex.has(key)) { target = fileIndex.get(key); break; }
      }

      if (target) {
        const newRel = path.relative(destFileDir, target).replace(/\\/g, '/');
        console.log(`[link-docs] fix: ${path.relative(destDir, destFile)}: "${mdPath}" → "${newRel}"`);
        return `[${text}](${newRel}${anchor || ''})`;
      }

      console.warn(`[link-docs] warn: ${path.relative(destDir, destFile)}: unresolvable link "${mdPath}"`);
      return match;
    }
  );
}


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

// Copy docSource → destDir, renaming README.md → index.md (raw copy, no transform yet)
function copyDirRaw(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destName = entry.name === 'README.md' ? 'index.md' : entry.name;
    const destPath = path.join(dest, destName);
    if (entry.isDirectory()) {
      copyDirRaw(srcPath, destPath);
    } else if (entry.name.endsWith('.md')) {
      fs.writeFileSync(destPath, fs.readFileSync(srcPath, 'utf8'));
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Apply fixCrossRefLinks + transformMarkdown to all .md files in destDir
function transformAll(dir) {
  const fileIndex = buildFileIndex(dir, dir);
  applyTransform(dir, dir, fileIndex);
}

function applyTransform(dir, destDir, fileIndex) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      applyTransform(fullPath, destDir, fileIndex);
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = fixCrossRefLinks(content, fullPath, destDir, fileIndex);
      content = transformMarkdown(content, fullPath);
      fs.writeFileSync(fullPath, content);
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
copyDirRaw(docSource, destDir);      // 1. raw copy
transformAll(destDir);               // 2. fix cross-ref links + transform markdown
processDirectory(destDir);           // 3. generate missing index.md
console.log(`[link-docs] ${docSource} → ${destDir}`);
