/**
 * generate-config.mjs
 *
 * [SCRIPT CI] Génère la config opencode pour la sandbox GitHub Actions.
 * Appelé dans agent-execute.yml avant le step anomalyco.
 *
 * Mécanisme :
 *   1. Lit agents/config.yml via loadConfig()
 *   2. Extrait agent_config[cli] (ex: agent_config.opencode)
 *   3. Injecte default_agent si un role est fourni en argument
 *      → opencode charge directement le bon profil agent sans instruction dans le prompt
 *   4. Sérialise en JSON sur stdout
 *
 * Le JSON est capturé par le step CI et injecté dans OPENCODE_CONFIG_CONTENT
 * — mécanisme officiel opencode pour les overrides runtime.
 * Aucun fichier n'est écrit sur le disque.
 *
 * Usage :
 *   node src/generate-config.mjs [role]
 *   node src/generate-config.mjs po
 *   node src/generate-config.mjs        ← sans role, pas de default_agent
 */

import { loadConfig } from './config.mjs';

const role = process.argv[2] || null;

try {
  const config = loadConfig();
  const cli    = config.cli;
  const agentConfig = config.agent_config[cli];

  if (!agentConfig) {
    throw new Error(
      `Aucune section agent_config.${cli} dans agents/config.yml. ` +
      `Sections disponibles : ${Object.keys(config.agent_config).join(', ') || '(aucune)'}`
    );
  }

  // TODO: default_agent — réservé pour intégration future avec APM (Agent Protocol Manager)
  // Quand opencode supportera un registre d'agents externe (ex: Microsoft APM),
  // ce champ permettra de charger dynamiquement le bon agent par son identifiant de rôle.
  // Actuellement désactivé : opencode ne reconnaît que ses agents natifs (build, plan).
  // Le profil agent est injecté directement dans le prompt système via agents/<role>/profile.md.
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
  process.stderr.write(`[generate-config] ERREUR : ${err.message}\n`);
  process.exit(1);
}
