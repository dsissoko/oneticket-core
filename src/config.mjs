/**
 * config.mjs
 *
 * [SHARED MODULE] Single read point for .oneticket/config.yml.
 * Used by all JS scripts in the project.
 *
 * Exports:
 *   loadConfig() → full config object
 *
 * Returned structure:
 *   {
 *     language,                  // 'fr' | null (optional)
 *     autonomous_mode,           // boolean (optional, defaults to true)
 *     current_project,           // string | undefined (optional)
 *     clear_session_cache,       // boolean (optional, defaults to true)
 *     cli,                       // 'opencode' | 'claude' | ...
 *     model,                     // extracted from agent_config.<cli>.model
 *     retry_max,                 // 3
 *     orchestrate_retry_max,     // 5
 *     oneticket_git_user_name,   // 'oneticket-bot'
 *     oneticket_git_user_email,  // 'oneticket-bot@users.noreply.github.com'
 *     pr_base,                   // 'main'
 *     agent_config,              // raw agent_config section object
 *   }
 *
 * Note: the LLM model is NOT a top-level key — it is declared in
 * agent_config.<cli>.model and injected via OPENCODE_CONFIG_CONTENT.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { CONFIG_PATH } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Checks that a required key is present and non-empty in the parsed object.
 * Throws with an explicit message if absent.
 */
function require(parsed, key) {
  const val = parsed[key];
  if (val === undefined || val === null || val === '') {
    throw new Error(`Required key missing in ${CONFIG_PATH}: "${key}"`);
  }
  return val;
}

/**
 * Loads and parses .oneticket/config.yml.
 * No fallbacks — all required keys must be present.
 * Throws with an explicit message if a key is missing or the file is corrupted.
 *
 * @returns {object} Full config object
 * @throws {Error} If the file is missing, corrupted, or incomplete
 */
export function loadConfig() {
  const configPath = path.join(__dirname, '..', CONFIG_PATH);

  if (!fs.existsSync(configPath)) {
    throw new Error(`${CONFIG_PATH} not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  let parsed;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    throw new Error(`${CONFIG_PATH} corrupted (invalid YAML): ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`${CONFIG_PATH} is empty or invalid`);
  }

  const cli          = require(parsed, 'cli');
  const agent_config = parsed.agent_config || {};
  const cliConfig    = agent_config[cli]   || {};

  if (!cliConfig.model) {
    throw new Error(
      `Required key missing in ${CONFIG_PATH}: "agent_config.${cli}.model"`
    );
  }

  return {
    language:                 parsed.language        || null,  // optional
    autonomous_mode:          parsed.autonomous_mode !== false, // optional, defaults to true
    current_project:          parsed.current_project !== undefined ? (parsed.current_project || '') : undefined,
    clear_session_cache:      parsed.clear_session_cache !== false, // optional, defaults to true
    max_tasks:                parsed.max_tasks       || null,  // optional
    cli,
    model:                    cliConfig.model,
    retry_max:                require(parsed, 'retry_max'),
    orchestrate_retry_max:    require(parsed, 'orchestrate_retry_max'),
    oneticket_git_user_name:  require(parsed, 'oneticket_git_user_name'),
    oneticket_git_user_email: require(parsed, 'oneticket_git_user_email'),
    pr_base:                  require(parsed, 'pr_base'),
    agent_config,
  };
}
