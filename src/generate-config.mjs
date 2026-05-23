/**
 * generate-config.mjs
 *
 * [SCRIPT CI] Génère la config opencode pour la sandbox GitHub Actions.
 * Appelé dans agent-execute.yml avant le step anomalyco.
 *
 * Mécanisme :
 *   1. Lit agents/config.yml via loadConfig()
 *   2. Extrait agent_config[cli] (ex: agent_config.opencode)
 *   3. Sérialise en JSON sur stdout
 *
 * Le JSON est capturé par le step CI et injecté dans OPENCODE_CONFIG_CONTENT
 * — mécanisme officiel opencode pour les overrides runtime.
 * Aucun fichier n'est écrit sur le disque.
 *
 * Usage :
 *   node src/generate-config.mjs
 *   → écrit le JSON sur stdout
 */

import { loadConfig } from './config.mjs';

try {
  const config = loadConfig();
  const cli = config.cli;
  const agentConfig = config.agent_config[cli];

  if (!agentConfig) {
    throw new Error(
      `Aucune section agent_config.${cli} dans agents/config.yml. ` +
      `Sections disponibles : ${Object.keys(config.agent_config).join(', ') || '(aucune)'}`
    );
  }

  process.stdout.write(JSON.stringify(agentConfig));
} catch (err) {
  process.stderr.write(`[generate-config] ERREUR : ${err.message}\n`);
  process.exit(1);
}
