/**
 * config.mjs
 *
 * [MODULE PARTAGÉ] Unique point de lecture de agents/config.yml.
 * Utilisé par tous les scripts JS du projet.
 *
 * Exporte :
 *   loadConfig() → objet config complet
 *
 * Structure retournée :
 *   {
 *     language,        // 'fr' | null
 *     autonomous_mode, // boolean
 *     cli,             // 'opencode' | 'claude' | ...
 *     model,           // 'opencode/claude-haiku-4-5'
 *     retry_max,       // 3
 *     git_user_name,   // 'oneticket-bot'
 *     git_user_email,  // 'oneticket-bot@users.noreply.github.com'
 *     pr_base,         // 'main'
 *     agent_config,    // objet brut de la section agent_config
 *   }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Charge et parse agents/config.yml.
 * Retourne un objet config avec des valeurs par défaut sûres.
 *
 * @returns {object} Config complète
 * @throws {Error} Si le fichier est absent ou corrompu
 */
export function loadConfig() {
  const configPath = path.join(__dirname, '..', 'agents', 'config.yml');

  if (!fs.existsSync(configPath)) {
    throw new Error(`agents/config.yml introuvable : ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  let parsed;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    throw new Error(`agents/config.yml corrompu (YAML invalide) : ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('agents/config.yml est vide ou invalide');
  }

  return {
    language:               parsed.language       || null,
    autonomous_mode:        parsed.autonomous_mode !== false,
    cli:                    parsed.cli            || 'opencode',
    model:                  parsed.model          || 'opencode/claude-haiku-4-5',
    retry_max:              typeof parsed.retry_max === 'number' ? parsed.retry_max : 3,
    orchestrate_retry_max:  typeof parsed.orchestrate_retry_max === 'number' ? parsed.orchestrate_retry_max : 5,
    git_user_name:          parsed.git_user_name  || 'oneticket-bot',
    git_user_email:         parsed.git_user_email || 'oneticket-bot@users.noreply.github.com',
    pr_base:                parsed.pr_base        || 'main',
    agent_config:           parsed.agent_config   || {},
  };
}
