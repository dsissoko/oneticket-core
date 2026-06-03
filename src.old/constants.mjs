/**
 * constants.mjs
 *
 * [SHARED MODULE] Framework constants — reserved paths of oneticket-core.
 * Single source of truth for all internal framework paths.
 *
 * These paths are NOT configurable by the user.
 * They are part of the framework contract (like .git/ or .github/).
 *
 * Imported by: config.mjs, utils.mjs, agent-dispatch.mjs,
 *              agent-launcher.mjs, orchestrate.mjs, launch-fanout.mjs
 */

// Framework root directory (committed, reserved)
export const ONETICKET_DIR   = '.oneticket';

// Main configuration file path
export const CONFIG_PATH     = `${ONETICKET_DIR}/config.yml`;

// Task manifests and state directory
export const TASKS_DIR       = `${ONETICKET_DIR}/tasks`;

// Manifest filename (inside TASKS_DIR/issue-<N>/)
export const MANIFEST_FILE   = 'manifest.json';

// Framework agent profiles directory
export const AGENTS_DIR      = `${ONETICKET_DIR}/agents`;

// Agent profile file extension (APM convention)
export const AGENT_EXT       = '.agent.md';

// Framework skills directory
export const SKILLS_DIR      = `${ONETICKET_DIR}/skills`;

// ---------------------------------------------------------------------------
// Comment history — injected into agent prompts via build-context.mjs
// ---------------------------------------------------------------------------

// Maximum number of previous comments to inject in the context block
export const COMMENT_HISTORY_MAX    = 10;

// Maximum characters per comment body before truncation
export const COMMENT_BODY_MAX_CHARS = 500;

// Section title for comment history in the context block
export const COMMENT_HISTORY_TITLE  = '## Recent comments';
