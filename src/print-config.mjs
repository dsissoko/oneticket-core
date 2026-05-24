/**
 * print-config.mjs
 *
 * [UTILITAIRE CI] Lit une clé depuis .oneticket/config.yml et l'écrit sur stdout.
 * Utilisé dans les workflows GitHub Actions pour lire les valeurs de config
 * sans inline scripts ni valeurs hardcodées dans le YAML.
 *
 * Usage :
 *   node src/print-config.mjs <key>
 *   node src/print-config.mjs oneticket_git_user_name
 *   node src/print-config.mjs oneticket_git_user_email
 *
 * Exemple dans un workflow :
 *   git config user.name "$(node src/print-config.mjs oneticket_git_user_name)"
 *
 * Erreur explicite si la clé est absente ou si le fichier est introuvable.
 */

import { loadConfig } from './config.mjs';

const key = process.argv[2];

if (!key) {
  process.stderr.write('[print-config] Usage : node src/print-config.mjs <key>\n');
  process.exit(1);
}

try {
  const config = loadConfig();

  if (!(key in config)) {
    process.stderr.write(`[print-config] Clé inconnue : "${key}"\n`);
    process.stderr.write(`[print-config] Clés disponibles : ${Object.keys(config).join(', ')}\n`);
    process.exit(1);
  }

  const val = config[key];
  if (val === null || val === undefined) {
    process.stderr.write(`[print-config] La clé "${key}" est présente mais nulle.\n`);
    process.exit(1);
  }

  process.stdout.write(String(val));
} catch (err) {
  process.stderr.write(`[print-config] ERREUR : ${err.message}\n`);
  process.exit(1);
}
