/**
 * generate-config.mjs
 *
 * [CI SCRIPT] Generates the opencode config for the GitHub Actions sandbox.
 * Called in agent-execute.yml before the anomalyco step.
 *
 * Mechanism:
 *   1. Reads .oneticket/config.yml via loadConfig()
 *   2. Extracts agent_config[cli] (e.g. agent_config.opencode)
 *   3. Serializes to JSON on stdout
 *
 * The JSON is captured by the CI step and injected into OPENCODE_CONFIG_CONTENT
 * — the official opencode mechanism for runtime overrides.
 * No file is written to disk.
 *
 * Usage:
 *   node src/generate-config.mjs [role]
 *   node src/generate-config.mjs po
 *   node src/generate-config.mjs        ← no role, no default_agent
 */

import { loadConfig } from './config.mjs';

const role = process.argv[2] || null;

try {
  const config = loadConfig();
  const cli    = config.cli;
  const agentConfig = config.agent_config[cli];

  if (!agentConfig) {
    throw new Error(
      `No agent_config.${cli} section in .oneticket/config.yml. ` +
      `Available sections: ${Object.keys(config.agent_config).join(', ') || '(none)'}`
    );
  }

  // Inject default_agent when role is provided — opencode loads the agent
  // from .opencode/agents/<role>.md (installed by APM from dsissoko/oneticket-skills)
  const output = role
    ? { ...agentConfig, default_agent: role }
    : agentConfig;

  if (role) {
    process.stderr.write(`[generate-config] default_agent=${role}\n`);
  }

  process.stdout.write(JSON.stringify(output));
} catch (err) {
  process.stderr.write(`[generate-config] ERROR: ${err.message}\n`);
  process.exit(1);
}
