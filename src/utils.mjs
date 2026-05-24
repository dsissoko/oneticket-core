/**
 * utils.mjs
 *
 * [MODULE PARTAGÉ] Utilitaires communs à tous les scripts JS du projet.
 * Élimine les duplications entre orchestrate.mjs, agent-launcher.mjs,
 * agent-dispatch.mjs et init.mjs.
 *
 * Exports :
 *   run(prefix, cmd)                    — execSync avec log, throw si erreur
 *   runCapture(prefix, cmd)             — execSync avec capture stdout
 *   runWithRetry(prefix, cmd, max)      — run avec backoff exponentiel + jitter
 *   setupGit(prefix, config, repo, token) — séquence git config + fetch
 *   writeManifest(manifest)             — écrit tasks/issue-N/manifest.json
 *   areDependenciesSatisfied(task, all) — vérifie les dépendances d'une tâche
 *   dispatchWorkflow(file, inputs, repo, token) — POST workflow_dispatch avec retry
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Helpers git de base
// ---------------------------------------------------------------------------

/**
 * Exécute une commande shell avec log.
 * Throw si exit code non-zéro.
 */
export function run(prefix, cmd, opts = {}) {
  console.log(`[${prefix}] $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

/**
 * Exécute une commande shell et capture la sortie stdout.
 */
export function runCapture(prefix, cmd) {
  console.log(`[${prefix}] $ ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

/**
 * Exécute une commande shell avec backoff exponentiel + jitter sur échec.
 *
 * Stratégie : délai = 2^attempt * 1000ms + [0, 500ms] aléatoire
 * Utilise Atomics.wait pour un délai synchrone (compatible execSync).
 *
 * @param {string} prefix      - Préfixe de log (ex: 'orchestrate')
 * @param {string} cmd         - Commande shell à exécuter
 * @param {number} maxAttempts - Nombre maximum de tentatives (défaut: 3)
 */
export function runWithRetry(prefix, cmd, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return run(prefix, cmd);
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const backoff = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
      console.warn(
        `[${prefix}] Échec "${cmd}" (tentative ${attempt}/${maxAttempts}) — ` +
        `backoff ${backoff}ms...`
      );
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoff);
    }
  }
}

// ---------------------------------------------------------------------------
// Setup git
// ---------------------------------------------------------------------------

/**
 * Séquence git standard : user.name + user.email + remote url + fetch.
 * Dupliquée auparavant dans orchestrate.mjs, agent-dispatch.mjs, init.mjs.
 * Le git fetch utilise runWithRetry pour résister aux erreurs réseau transitoires.
 *
 * @param {string} prefix  - Préfixe de log
 * @param {object} config  - Config chargée depuis loadConfig()
 * @param {string} repo    - "owner/repo"
 * @param {string} token   - GitHub PAT (peut être null/undefined)
 */
export function setupGit(prefix, config, repo, token) {
  run(prefix, `git config user.name "${config.git_user_name}"`);
  run(prefix, `git config user.email "${config.git_user_email}"`);
  if (token) {
    run(prefix, `git remote set-url origin https://x-access-token:${token}@github.com/${repo}.git`);
  }
  runWithRetry(prefix, 'git fetch origin');
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

/**
 * Écrit le manifest dans tasks/issue-<N>/manifest.json.
 * Dupliqué auparavant dans orchestrate.mjs et agent-launcher.mjs.
 */
export function writeManifest(manifest) {
  const manifestPath = path.join(
    process.cwd(), 'tasks', `issue-${manifest.issue}`, 'manifest.json'
  );
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Lit le manifest depuis tasks/issue-<N>/manifest.json.
 * Dupliqué auparavant dans orchestrate.mjs et init.mjs.
 */
export function readManifest(issueNumber) {
  const manifestPath = path.join(
    process.cwd(), 'tasks', `issue-${issueNumber}`, 'manifest.json'
  );
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json introuvable : ${manifestPath}`);
  }
  const raw = fs.readFileSync(manifestPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`manifest.json corrompu (JSON invalide) : ${manifestPath} — ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Dépendances
// ---------------------------------------------------------------------------

/**
 * Détermine si toutes les dépendances d'une tâche sont satisfaites (status done).
 * Dupliqué auparavant dans orchestrate.mjs et agent-launcher.mjs.
 */
export function areDependenciesSatisfied(task, allTasks) {
  if (!task.depends_on || task.depends_on.length === 0) return true;
  const doneIds = new Set(allTasks.filter(t => t.status === 'done').map(t => t.id));
  return task.depends_on.every(dep => doneIds.has(dep));
}

// ---------------------------------------------------------------------------
// Dispatch workflow GitHub
// ---------------------------------------------------------------------------

/**
 * Déclenche un workflow GitHub Actions via workflow_dispatch.
 * Retry automatique avec backoff exponentiel + jitter sur erreur réseau.
 *
 * @param {string} workflowFile - Nom du fichier workflow (ex: 'agent-execute.yml')
 * @param {object} inputs       - Inputs du workflow_dispatch
 * @param {string} repo         - "owner/repo"
 * @param {string} token        - GitHub PAT
 * @param {string} ref          - Branche de référence (défaut: 'main')
 * @param {number} maxAttempts  - Nombre maximum de tentatives (défaut: 3)
 */
export async function dispatchWorkflow(workflowFile, inputs, repo, token, ref = 'main', maxAttempts = 3) {
  const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/dispatches`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:        'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref, inputs }),
    });

    if (res.ok) return;

    const body = await res.text();

    // 4xx client errors — pas la peine de retry
    if (res.status >= 400 && res.status < 500) {
      throw new Error(`Échec dispatch ${workflowFile} : ${res.status} ${body}`);
    }

    // 5xx server errors — retry avec backoff
    if (attempt === maxAttempts) {
      throw new Error(`Échec dispatch ${workflowFile} après ${maxAttempts} tentatives : ${res.status} ${body}`);
    }

    const backoff = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
    console.warn(`[dispatch] Erreur ${res.status} sur ${workflowFile} (tentative ${attempt}/${maxAttempts}) — backoff ${backoff}ms...`);
    await new Promise(r => setTimeout(r, backoff));
  }
}
