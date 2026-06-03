/**
 * oneticket-install.mjs
 *
 * [DETERMINISTIC] Pre-run setup — called in agent-execute.yml before apm install and agent run.
 *
 * 1. Copy .oneticket/skills/<name>/SKILL.md → .agents/skills/<name>/SKILL.md
 *    Idempotent — OneTicket skills always take precedence over external skills.
 *    Called AFTER apm install so OneTicket skills override any same-named external skill.
 *
 * 2. Copy .oneticket/AGENTS.md → .agents/AGENTS.md
 *
 * 3. Copy .oneticket/apm.yml → apm.yml (repo root)
 *    APM reads apm.yml from the repo root — this is a dynamic copy, never committed.
 *    Excluded from git via .git/info/exclude in agent-execute.yml.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, '..');
const SKILLS_SRC  = path.join(ROOT, '.oneticket', 'skills');
const SKILLS_DEST = path.join(ROOT, '.agents', 'skills');

// ---------------------------------------------------------------------------
// Ensure .agents/skills/ exists unconditionally before any copy
// ---------------------------------------------------------------------------

fs.mkdirSync(SKILLS_DEST, { recursive: true });

// ---------------------------------------------------------------------------
// 1. Install skills
// ---------------------------------------------------------------------------

if (!fs.existsSync(SKILLS_SRC)) {
  console.log('[oneticket-install] No skills found in .oneticket/skills/ — skipping.');
} else {
  const skills = fs.readdirSync(SKILLS_SRC, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  if (skills.length === 0) {
    console.log('[oneticket-install] No skills to install.');
  } else {
    fs.mkdirSync(SKILLS_DEST, { recursive: true });
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
      console.log(`[oneticket-install] installed ${skill}`);
      installed++;
    }
    console.log(`[oneticket-install] Done — ${installed} skill(s) installed into .agents/skills/`);
  }
}

// ---------------------------------------------------------------------------
// 3. Copy .oneticket/apm.yml → apm.yml (repo root)
// ---------------------------------------------------------------------------

const apmSrc  = path.join(ROOT, '.oneticket', 'apm.yml');
const apmDest = path.join(ROOT, 'apm.yml');

if (fs.existsSync(apmSrc)) {
  fs.copyFileSync(apmSrc, apmDest);
  console.log('[oneticket-install] apm.yml copied to repo root.');
} else {
  console.log('[oneticket-install] No .oneticket/apm.yml found — skipping apm.yml copy.');
}
