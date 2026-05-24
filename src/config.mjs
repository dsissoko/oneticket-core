/**
 * config.mjs
 *
 * [MODULE PARTAGÉ] Unique point de lecture de .oneticket/config.yml.
 * Utilisé par tous les scripts JS du projet.
 *
 * Exporte :
 *   loadConfig() → objet config complet
 *
 * Structure retournée :
 *   {
 *     language,                  // 'fr' | null (optionnel)
 *     autonomous_mode,           // boolean (optionnel, défaut true)
 *     cli,                       // 'opencode' | 'claude' | ...
 *     retry_max,                 // 3
 *     orchestrate_retry_max,     // 5
 *     oneticket_git_user_name,   // 'oneticket-bot'
 *     oneticket_git_user_email,  // 'oneticket-bot@users.noreply.github.com'
 *     pr_base,                   // 'main'
 *     agent_config,              // objet brut de la section agent_config
 *   }
 *
 * Note : le modèle LLM n'est PAS dans cet objet — il est déclaré dans
 * agent_config.<cli>.model et injecté via OPENCODE_CONFIG_CONTENT.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { CONFIG_PATH } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vérifie qu'une clé obligatoire est présente et non-vide dans l'objet parsé.
 * Throw avec un message explicite si absente.
 */
function require(parsed, key) {
  const val = parsed[key];
  if (val === undefined || val === null || val === '') {
    throw new Error(`Clé obligatoire manquante dans ${CONFIG_PATH} : "${key}"`);
  }
  return val;
}

/**
 * Charge et parse .oneticket/config.yml.
 * Aucun fallback — toutes les clés obligatoires doivent être présentes.
 * Throw avec un message explicite si une clé est absente ou si le fichier est corrompu.
 *
 * @returns {object} Config complète
 * @throws {Error} Si le fichier est absent, corrompu ou incomplet
 */
export function loadConfig() {
  const configPath = path.join(__dirname, '..', CONFIG_PATH);

  if (!fs.existsSync(configPath)) {
    throw new Error(`${CONFIG_PATH} introuvable : ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  let parsed;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    throw new Error(`${CONFIG_PATH} corrompu (YAML invalide) : ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`${CONFIG_PATH} est vide ou invalide`);
  }

  return {
    language:                 parsed.language        || null,  // optionnel
    autonomous_mode:          parsed.autonomous_mode !== false, // optionnel, défaut true
    cli:                      require(parsed, 'cli'),
    retry_max:                require(parsed, 'retry_max'),
    orchestrate_retry_max:    require(parsed, 'orchestrate_retry_max'),
    oneticket_git_user_name:  require(parsed, 'oneticket_git_user_name'),
    oneticket_git_user_email: require(parsed, 'oneticket_git_user_email'),
    pr_base:                  require(parsed, 'pr_base'),
    agent_config:             parsed.agent_config    || {},    // optionnel
  };
}
