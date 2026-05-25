/**
 * oneticket-install.mjs
 *
 * [DETERMINISTIC] Installs OneTicket skills into .agents/skills/
 * so they are natively discovered by opencode (and any APM-compatible CLI).
 *
 * Copies .oneticket/skills/<name>/SKILL.md → .agents/skills/<name>/SKILL.md
 * for every skill found under .oneticket/skills/.
 *
 * Idempotent — existing files are overwritten (OneTicket skills always take precedence).
 *
 * Called in agent-execute.yml before the agent runs — skills are available
 * when opencode starts.
 *
 * TODO: apm install will replace or complement this step in a future version.
 *       When APM is available, oneticket-install.mjs runs AFTER apm install
 *       so that OneTicket skills always take precedence over external skills
 *       with the same name. Collision risk is mitigated by the oneticket- prefix
 *       on all framework skills.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_SRC  = path.join(__dirname, '..', '.oneticket', 'skills');
const SKILLS_DEST = path.join(__dirname, '..', '.agents', 'skills');

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!fs.existsSync(SKILLS_SRC)) {
  console.log('[oneticket-install] No skills found in .oneticket/skills/ — nothing to install.');
  process.exit(0);
}

const skills = fs.readdirSync(SKILLS_SRC, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

if (skills.length === 0) {
  console.log('[oneticket-install] No skills to install.');
  process.exit(0);
}

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
