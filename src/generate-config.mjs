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

  // TODO: default_agent — reserved for future APM integration (Agent Package Manager)
  // When opencode supports an external agent registry (e.g. Microsoft APM),
  // this field will allow dynamic loading of the right agent by role identifier.
  // Currently disabled: opencode only recognizes its native agents (build, plan).
  // The agent profile is injected directly into the system prompt via .oneticket/agents/<role>.agent.md.
  //
  // const output = role
  //   ? { ...agentConfig, default_agent: role }
  //   : agentConfig;

  const output = agentConfig;

  if (role) {
    process.stderr.write(`[generate-config] default_agent=${role}\n`);
  }

  process.stdout.write(JSON.stringify(output));
} catch (err) {
  process.stderr.write(`[generate-config] ERROR: ${err.message}\n`);
  process.exit(1);
}
