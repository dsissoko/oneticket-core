/**
 * constants.mjs
 *
 * [MODULE PARTAGÉ] Constantes framework — chemins réservés de oneticket-core.
 * Source de vérité unique pour tous les chemins internes du framework.
 *
 * Ces chemins ne sont PAS configurables par l'utilisateur.
 * Ils font partie du contrat du framework (comme .git/ ou .github/).
 *
 * Importé par : config.mjs, utils.mjs, agent-dispatch.mjs,
 *               agent-launcher.mjs, orchestrate.mjs, launch-fanout.mjs
 */

// Répertoire racine du framework (commité, réservé)
export const ONETICKET_DIR   = '.oneticket';

// Fichier de configuration principal
export const CONFIG_PATH     = `${ONETICKET_DIR}/config.yml`;

// Répertoire des manifests et états de tâches
export const TASKS_DIR       = `${ONETICKET_DIR}/tasks`;

// Nom du fichier manifest (dans TASKS_DIR/issue-<N>/)
export const MANIFEST_FILE   = 'manifest.json';

// Répertoire des profils agents framework
export const AGENTS_DIR      = `${ONETICKET_DIR}/agents`;

// Extension des fichiers profils agents (convention APM)
export const AGENT_EXT       = '.agent.md';

// Répertoire des skills framework
export const SKILLS_DIR      = `${ONETICKET_DIR}/skills`;
