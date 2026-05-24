/**
 * launch-fanout.mjs
 *
 * [DÉTERMINISTE] Démarre le FAN-OUT depuis un manifest présent dans le working tree.
 * Appelé par agent-execute.yml après qu'un agent a produit tasks/issue-N/manifest.json.
 *
 * Responsabilité unique :
 *   1. Vérifier que le manifest est présent (vérification défensive)
 *   2. Setup git
 *   3. Checkout feature/issue-N
 *   4. Lire le manifest
 *   5. Lancer launchReadyTasks() → FAN-OUT
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 */

import { launchReadyTasks } from './agent-launcher.mjs';
import { loadConfig } from './config.mjs';
import { setupGit, readManifest, run } from './utils.mjs';
import path from 'path';
import fs from 'fs';

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const repo        = process.env.REPO;
  const ghToken     = process.env.GITHUB_TOKEN;

  if (!issueNumber) throw new Error('ISSUE_NUMBER manquant');
  if (!repo)        throw new Error('REPO manquant');

  const featureBranch = `feature/issue-${issueNumber}`;

  // Vérification défensive — ce script doit être appelé uniquement
  // quand le manifest est présent dans le working tree
  const manifestPath = path.join(process.cwd(), 'tasks', `issue-${issueNumber}`, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `manifest.json introuvable : ${manifestPath}\n` +
      `launch-fanout.mjs doit être appelé uniquement quand le manifest est présent dans le working tree.`
    );
  }

  const config = loadConfig();

  // Setup git + fetch avec retry réseau
  setupGit('launch-fanout', config, repo, ghToken);
  run('launch-fanout', `git checkout -B ${featureBranch} origin/${featureBranch}`);

  // Lecture du manifest
  const manifest = readManifest(issueNumber);

  // Vérifier qu'il y a des tâches pending avant de lancer le FAN-OUT
  const pendingTasks = manifest.tasks.filter(t => t.status === 'pending');
  if (pendingTasks.length === 0) {
    console.log('[launch-fanout] Aucune tâche pending — FAN-OUT non nécessaire.');
    return;
  }

  console.log(`[launch-fanout] ${pendingTasks.length} tâche(s) pending — lancement FAN-OUT.`);
  await launchReadyTasks(manifest, repo, ghToken);
  console.log('[launch-fanout] FAN-OUT lancé.');
}

main().catch(err => {
  console.error('[launch-fanout] ERREUR :', err.message);
  process.exit(1);
});
