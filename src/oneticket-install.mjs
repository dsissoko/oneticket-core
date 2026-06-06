/**
 * oneticket-install.mjs
 *
 * [DETERMINISTIC] Pre-run setup — called twice in agent-execute.yml:
 *
 *   1. --apm-only (before apm install):
 *      Copy .oneticket/apm.yml → apm.yml (repo root, read by apm install)
 *      Copy .oneticket/.apm/  → .apm/   (instructions compiled by apm compile)
 *
 *   2. --skills-only (after apm install + apm compile):
 *      Copy .oneticket/skills/<name>/SKILL.md → .agents/skills/<name>/SKILL.md
 *      Local skills take precedence — they override any same-named APM skill.
 *
 * Running --skills-only after apm install guarantees local skills always win.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, '..');
const SKILLS_SRC  = path.join(ROOT, '.oneticket', 'skills');
const SKILLS_DEST = path.join(ROOT, '.agents', 'skills');

const flag = process.argv[2]; // --apm-only | --skills-only | undefined (run all)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ---------------------------------------------------------------------------
// APM config — copy apm.yml + .apm/ to repo root (required before apm install)
// ---------------------------------------------------------------------------

function installApm() {
  const apmSrc  = path.join(ROOT, '.oneticket', 'apm.yml');
  const apmDest = path.join(ROOT, 'apm.yml');

  if (fs.existsSync(apmSrc)) {
    fs.copyFileSync(apmSrc, apmDest);
    console.log('[oneticket-install] apm.yml copied to repo root.');
  } else {
    console.log('[oneticket-install] No .oneticket/apm.yml found — skipping apm.yml copy.');
  }

  const apmDirSrc  = path.join(ROOT, '.oneticket', '.apm');
  const apmDirDest = path.join(ROOT, '.apm');

  if (fs.existsSync(apmDirSrc)) {
    copyDirRecursive(apmDirSrc, apmDirDest);
    console.log('[oneticket-install] .apm/ copied to repo root.');
  } else {
    console.log('[oneticket-install] No .oneticket/.apm/ found — skipping .apm/ copy.');
  }
}

// ---------------------------------------------------------------------------
// Local skills — copy after apm install so local skills override APM skills
// ---------------------------------------------------------------------------

function installSkills() {
  fs.mkdirSync(SKILLS_DEST, { recursive: true });

  if (!fs.existsSync(SKILLS_SRC)) {
    console.log('[oneticket-install] No skills found in .oneticket/skills/ — skipping.');
    return;
  }

  const skills = fs.readdirSync(SKILLS_SRC, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  if (skills.length === 0) {
    console.log('[oneticket-install] No local skills to install.');
    return;
  }

  let installed = 0;
  for (const skill of skills) {
    const srcSkill  = path.join(SKILLS_SRC, skill, 'SKILL.md');
    const destDir   = path.join(SKILLS_DEST, skill);
    const destSkill = path.join(destDir, 'SKILL.md');
    if (!fs.existsSync(srcSkill)) {
      console.log(`[oneticket-install] skipped  ${skill} (no SKILL.md found)`);
      continue;
    }
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcSkill, destSkill);
    console.log(`[oneticket-install] installed ${skill} (overrides APM if same name)`);
    installed++;
  }
  console.log(`[oneticket-install] Done — ${installed} local skill(s) installed into .agents/skills/`);
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

if (flag === '--apm-only') {
  installApm();
} else if (flag === '--skills-only') {
  installSkills();
} else {
  // No flag — run both (backward-compatible, useful locally)
  installApm();
  installSkills();
}
