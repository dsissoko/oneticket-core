/**
 * init-doc.mjs
 *
 * [DETERMINISTIC] Initializes the documentation structure for a project.
 *
 * Copies .oneticket/templates/docs/ recursively into <docs_path>.
 * Idempotent — existing files are never overwritten.
 *
 * Usage:
 *   node src/init-doc.mjs <docs_path>
 *
 * Example:
 *   node src/init-doc.mjs apps/my-app/docs
 *   node src/init-doc.mjs .oneticket/docs
 *
 * Called by agents (via doc-structure skill) — never directly by CI.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', '.oneticket', 'templates', 'docs');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copies src directory into dest.
 * Skips files that already exist — never overwrites.
 */
function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
        console.log(`[init-doc] created  ${destPath}/`);
      }
      copyRecursive(srcPath, destPath);
    } else {
      if (fs.existsSync(destPath)) {
        console.log(`[init-doc] skipped  ${destPath} (already exists)`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`[init-doc] created  ${destPath}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const docsPath = process.argv[2];

if (!docsPath) {
  console.error('[init-doc] ERROR: docs_path argument is required.');
  console.error('[init-doc] Usage: node src/init-doc.mjs <docs_path>');
  process.exit(1);
}

if (!fs.existsSync(TEMPLATE_DIR)) {
  console.error(`[init-doc] ERROR: template directory not found: ${TEMPLATE_DIR}`);
  process.exit(1);
}

const resolvedDocsPath = path.resolve(docsPath);
console.log(`[init-doc] Initializing doc structure at: ${resolvedDocsPath}`);

fs.mkdirSync(resolvedDocsPath, { recursive: true });
copyRecursive(TEMPLATE_DIR, resolvedDocsPath);

console.log('[init-doc] Done.');
