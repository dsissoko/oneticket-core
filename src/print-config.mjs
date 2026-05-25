/**
 * print-config.mjs
 *
 * [CI UTILITY] Reads a key from .oneticket/config.yml and writes it to stdout.
 * Used in GitHub Actions workflows to read config values
 * without inline scripts or hardcoded values in YAML.
 *
 * Usage:
 *   node src/print-config.mjs <key>
 *   node src/print-config.mjs oneticket_git_user_name
 *   node src/print-config.mjs oneticket_git_user_email
 *
 * Example in a workflow:
 *   git config user.name "$(node src/print-config.mjs oneticket_git_user_name)"
 *
 * Explicit error if the key is missing or the file is not found.
 */

import { loadConfig } from './config.mjs';

const key = process.argv[2];

if (!key) {
  process.stderr.write('[print-config] Usage: node src/print-config.mjs <key>\n');
  process.exit(1);
}

try {
  const config = loadConfig();

  if (!(key in config)) {
    process.stderr.write(`[print-config] Unknown key: "${key}"\n`);
    process.stderr.write(`[print-config] Available keys: ${Object.keys(config).join(', ')}\n`);
    process.exit(1);
  }

  const val = config[key];
  if (val === null || val === undefined) {
    process.stderr.write(`[print-config] Key "${key}" is present but null.\n`);
    process.exit(1);
  }

  process.stdout.write(String(val));
} catch (err) {
  process.stderr.write(`[print-config] ERROR: ${err.message}\n`);
  process.exit(1);
}
