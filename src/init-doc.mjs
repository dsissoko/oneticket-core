/**
 * init-doc.mjs
 *
 * [DETERMINISTIC] Initializes the doc structure for a project.
 * Copies .oneticket/templates/docs/ to <docs_path> — idempotent, never overwrites existing files.
 * Called by check-prerequisites.mjs when docs_path structure is missing.
 *
 * Usage:
 *   node src/init-doc.mjs <docs_path>
 *   node src/init-doc.mjs apps/breakout/docs
 *
 * Exit codes:
 *   0 — success (created or already existed)
 *   1 — templates/docs/ missing (repo configuration error)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');

const docsPath = process.argv[2];

if (!docsPath) {
  process.stderr.write('Usage: node src/init-doc.mjs <docs_path>\n');
  process.exit(1);
}

const TEMPLATES_SRC = path.join(ROOT, '.oneticket', 'templates', 'docs');
const DEST          = path.join(ROOT, docsPath);

// Templates must exist — if not, it is a repo configuration error
if (!fs.existsSync(TEMPLATES_SRC)) {
  process.stderr.write(
    `[init-doc] ERROR: .oneticket/templates/docs/ not found.\n` +
    `This directory is required for doc site generation.\n` +
    `Please restore it from the OneTicket framework repository.\n`
  );
  process.exit(1);
}

/**
 * Copies src directory to dest recursively.
 * Idempotent — never overwrites existing files.
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`[init-doc] created ${path.relative(ROOT, destPath)}`);
      } else {
        console.log(`[init-doc] kept    ${path.relative(ROOT, destPath)} (already exists)`);
      }
    }
  }
}

console.log(`[init-doc] Initializing doc structure at ${docsPath}...`);
copyDir(TEMPLATES_SRC, DEST);
console.log(`[init-doc] Done.`);
