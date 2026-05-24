/**
 * init.mjs
 *
 * [BOOTSTRAP] Démarre le pipeline FAN-OUT depuis un manifest.
 * Deux modes d'entrée :
 *
 *   Mode MANIFEST_ALREADY_PRESENT :
 *     Déclenché par agent-execute.yml après qu'un agent a produit le manifest.
 *     → Lit le manifest existant sur la branche → launchReadyTasks()
 *
 *   Mode BOOTSTRAP (conservé pour les tests) :
 *     Déclenché directement (tests, fixture).
 *     → Parse l'issue body ou charge la fixture → crée branche + manifest → launchReadyTasks()
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 *   MANIFEST_ALREADY_PRESENT (optionnel)
 *   ISSUE_BODY (optionnel, mode bootstrap)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';
import { run, runCapture, runWithRetry, setupGit, readManifest } from './utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers locaux
// ---------------------------------------------------------------------------

function extractJsonBlock(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.warn(`[init] WARN : bloc JSON trouvé mais invalide — ${e.message}`);
    return null;
  }
}

function loadDefaultTaskGraph() {
  const fixturePath = path.join(__dirname, '..', 'test', 'fixtures', 'tasks-graph.json');
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Aucun bloc JSON dans l'issue et fixture introuvable : ${fixturePath}`);
  }
  console.warn('[init] WARN : aucun bloc JSON dans le corps de l\'issue — utilisation du graphe par défaut (test/fixtures/tasks-graph.json)');
  const raw = fs.readFileSync(fixturePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Fixture tasks-graph.json corrompu (JSON invalide) : ${fixturePath} — ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const issueNumber            = process.env.ISSUE_NUMBER;
  const issueBody              = process.env.ISSUE_BODY  || '';
  const repo                   = process.env.REPO;
  const manifestAlreadyPresent = process.env.MANIFEST_ALREADY_PRESENT === 'true';

  if (!issueNumber) throw new Error('ISSUE_NUMBER manquant');
  if (!repo)        throw new Error('REPO manquant');

  const featureBranch = `feature/issue-${issueNumber}`;
  const ghToken       = process.env.GITHUB_TOKEN;
  const config        = loadConfig();

  // Setup git + fetch avec retry réseau
  setupGit('init', config, repo, ghToken);

  // =========================================================================
  // MODE MANIFEST_ALREADY_PRESENT
  // =========================================================================
  if (manifestAlreadyPresent) {
    console.log(`[init] Mode MANIFEST_ALREADY_PRESENT — lecture du manifest existant sur ${featureBranch}`);
    run('init', `git checkout -B ${featureBranch} origin/${featureBranch}`);

    const manifest = readManifest(issueNumber);

    const pendingTasks = manifest.tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      console.log('[init] Aucune tâche pending dans le manifest — FAN-OUT non nécessaire.');
      return;
    }

    console.log(`[init] ${pendingTasks.length} tâche(s) pending — lancement FAN-OUT.`);
    const { launchReadyTasks } = await import('./agent-launcher.mjs');
    await launchReadyTasks(manifest, repo, ghToken);
    console.log('[init] FAN-OUT lancé depuis manifest existant.');
    return;
  }

  // =========================================================================
  // MODE BOOTSTRAP (tests / fixture)
  // =========================================================================

  // [IDEMPOTENCE] Guard : branche + manifest déjà actifs ?
  const remoteBranches = runCapture('init', 'git branch -r');
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    run('init', `git checkout -B ${featureBranch} origin/${featureBranch}`);
    const manifestPath = path.join(process.cwd(), 'tasks', `issue-${issueNumber}`, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, 'utf8');
      let existing;
      try {
        existing = JSON.parse(raw);
      } catch (err) {
        throw new Error(`manifest.json existant corrompu (JSON invalide) : ${manifestPath} — ${err.message}`);
      }
      const hasActiveTasks = existing.tasks.some(t => t.status !== 'pending');
      if (hasActiveTasks) {
        console.log(
          `[init] IDEMPOTENCE : manifest déjà actif pour l'issue #${issueNumber} ` +
          `(${existing.tasks.filter(t => t.status !== 'pending').length} tâche(s) non-pending). Sortie sans modification.`
        );
        return;
      }
    }
  }

  // --- 1. Parser les tâches -----------------------------------------------
  let parsed = extractJsonBlock(issueBody);
  if (!parsed || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
    parsed = loadDefaultTaskGraph();
  }

  // --- 2. Construire le manifest ------------------------------------------
  const manifest = {
    issue: parseInt(issueNumber, 10),
    branch_base: featureBranch,
    tasks: parsed.tasks.map(t => ({
      id:         t.id,
      branch:     `task/issue-${issueNumber}-${t.id}`,
      file:       `tasks/issue-${issueNumber}/${t.file}`,
      content:    t.content,
      depends_on: t.depends_on || [],
      status:     'pending',
    })),
  };

  console.log('[init] Manifest construit :', JSON.stringify(manifest, null, 2));

  // --- 3. Créer ou réutiliser la branche feature --------------------------
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    run('init', `git checkout -B ${featureBranch} origin/${featureBranch}`);
  } else {
    run('init', `git checkout -b ${featureBranch}`);
  }

  // --- 4. Écrire manifest + workflow.md -----------------------------------
  const issueDir     = path.join(process.cwd(), 'tasks', `issue-${issueNumber}`);
  const manifestPath = path.join(issueDir, 'manifest.json');
  const workflowPath = path.join(issueDir, 'workflow.md');

  if (!fs.existsSync(issueDir)) fs.mkdirSync(issueDir, { recursive: true });

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(workflowPath, '# Execution trace\n');

  run('init', `git add tasks/issue-${issueNumber}/`);
  run('init', `git commit -m "chore: init manifest for issue #${issueNumber}" --allow-empty`);
  runWithRetry('init', `git push origin ${featureBranch}`);

  console.log(`[init] Branche ${featureBranch} créée et manifest poussé.`);

  // --- 5. Premier FAN-OUT -------------------------------------------------
  const { launchReadyTasks } = await import('./agent-launcher.mjs');
  await launchReadyTasks(manifest, repo, ghToken);

  console.log('[init] Initialisation terminée.');
}

main().catch(err => {
  console.error('[init] ERREUR :', err.message);
  process.exit(1);
});
