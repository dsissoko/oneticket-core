/**
 * init.mjs
 *
 * [BOOTSTRAP] Démarre le pipeline FAN-OUT depuis un manifest.
 * Deux modes d'entrée :
 *
 *   Mode MANIFEST_ALREADY_PRESENT (nouveau) :
 *     Déclenché par Workflow Scatter (on-feature-push.yml) après qu'un agent
 *     a produit tasks/issue-N/manifest.json sur feature/issue-N.
 *     → Lit le manifest existant sur la branche → launchReadyTasks()
 *
 *   Mode BOOTSTRAP (existant, conservé pour les tests) :
 *     Déclenché directement (tests, fixture).
 *     → Parse l'issue body ou charge la fixture → crée branche + manifest → launchReadyTasks()
 *
 * [IDEMPOTENCE] Si la branche feature existe déjà avec un manifest actif
 * (au moins une tâche non-pending), on sort proprement sans rien écraser.
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, ISSUE_NUMBER, REPO
 *   MANIFEST_ALREADY_PRESENT (optionnel, mode Scatter)
 *   ISSUE_TITLE, ISSUE_BODY (optionnel, mode bootstrap)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, opts = {}) {
  console.log(`[init] $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd) {
  console.log(`[init] $ ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

/**
 * Extrait le premier bloc JSON délimité par ```json ... ``` dans un texte.
 * Retourne l'objet parsé ou null si absent/invalide.
 */
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

/**
 * Charge le graphe de tâches par défaut depuis test/fixtures/tasks-graph.json.
 * Utilisé quand le corps de l'issue ne contient pas de bloc JSON.
 */
function loadDefaultTaskGraph() {
  const fixturePath = path.join(__dirname, '..', 'test', 'fixtures', 'tasks-graph.json');
  if (!fs.existsSync(fixturePath)) {
    throw new Error(
      `Aucun bloc JSON dans l'issue et fixture introuvable : ${fixturePath}`
    );
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
  const issueNumber             = process.env.ISSUE_NUMBER;
  const issueBody               = process.env.ISSUE_BODY   || '';
  const repo                    = process.env.REPO;
  const manifestAlreadyPresent  = process.env.MANIFEST_ALREADY_PRESENT === 'true';

  if (!issueNumber) throw new Error('ISSUE_NUMBER manquant');
  if (!repo)        throw new Error('REPO manquant');

  const featureBranch = `feature/issue-${issueNumber}`;
  const ghToken       = process.env.GITHUB_TOKEN;

  // --- Configurer git -------------------------------------------------------
  run('git config user.name "oneticket-bot"');
  run('git config user.email "oneticket-bot@users.noreply.github.com"');

  if (ghToken) {
    run(`git remote set-url origin https://x-access-token:${ghToken}@github.com/${repo}.git`);
  }

  run('git fetch origin');

  // =========================================================================
  // MODE MANIFEST_ALREADY_PRESENT
  // Déclenché par Workflow Scatter — l'agent a déjà produit le manifest.
  // On lit le manifest existant sur la branche et on lance le FAN-OUT.
  // =========================================================================
  if (manifestAlreadyPresent) {
    console.log(`[init] Mode MANIFEST_ALREADY_PRESENT — lecture du manifest existant sur ${featureBranch}`);
    run(`git checkout -B ${featureBranch} origin/${featureBranch}`);

    const manifestPath = path.join(process.cwd(), 'tasks', `issue-${issueNumber}`, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`MANIFEST_ALREADY_PRESENT=true mais manifest introuvable : ${manifestPath}`);
    }
    const raw = fs.readFileSync(manifestPath, 'utf8');
    let manifest;
    try {
      manifest = JSON.parse(raw);
    } catch (err) {
      throw new Error(`manifest.json corrompu (JSON invalide) : ${manifestPath} — ${err.message}`);
    }

    // Vérifier que le manifest a des tâches pending avant de lancer le FAN-OUT
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
  // MODE BOOTSTRAP (conservé pour les tests)
  // Crée la branche, le manifest depuis fixture, et lance le FAN-OUT.
  // =========================================================================

  // --- [IDEMPOTENCE] Guard : branche + manifest déjà actifs ? ---------------
  const remoteBranches = runCapture('git branch -r');
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    // La branche existe — vérifier l'état du manifest
    run(`git checkout -B ${featureBranch} origin/${featureBranch}`);
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

  // --- 1. Parser les tâches -------------------------------------------------
  let parsed = extractJsonBlock(issueBody);
  if (!parsed || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
    parsed = loadDefaultTaskGraph();
  }

  // --- 2. Construire le manifest --------------------------------------------
  // Le champ file est préfixé par tasks/issue-<N>/ pour isoler chaque issue
  // dans son propre répertoire — zéro collision entre issues parallèles sur main.
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

  // --- 3. Créer ou réutiliser la branche feature ----------------------------
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    run(`git checkout -B ${featureBranch} origin/${featureBranch}`);
  } else {
    run(`git checkout -b ${featureBranch}`);
  }

  // --- 4. Créer tasks/issue-<N>/ et écrire tous les artefacts ------------------
  // Isolation complète par issue sous tasks/issue-<N>/ → zéro collision entre issues sur main.
  const issueDir     = path.join(process.cwd(), 'tasks', `issue-${issueNumber}`);
  const manifestPath = path.join(issueDir, 'manifest.json');
  const workflowPath = path.join(issueDir, 'workflow.md');

  if (!fs.existsSync(issueDir)) fs.mkdirSync(issueDir, { recursive: true });

  // [SOURCE DE VÉRITÉ] manifest.json isolé par issue
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  // workflow.md — journal d'exécution append-only
  // La ligne d'en-tête garantit que le fichier n'est pas vide au départ :
  // les agents parallèles appendant après cette ligne → Git merge 3-way propre
  // sans besoin de merge=union dans .gitattributes
  fs.writeFileSync(workflowPath, '# Execution trace\n');

  run(`git add tasks/issue-${issueNumber}/`);
  run(`git commit -m "chore: init manifest for issue #${issueNumber}" --allow-empty`);
  run(`git push origin ${featureBranch}`);

  console.log(`[init] Branche ${featureBranch} créée et manifest poussé.`);

  // --- 5. Premier FAN-OUT ---------------------------------------------------
  // [FAN-OUT entry point] Déclenche en parallèle toutes les tâches sans dépendances.
  // C'est le seul bootstrap — les FAN-OUT suivants sont déclenchés par orchestrate.mjs
  // après chaque signal de fin (push task/*).
  const { launchReadyTasks } = await import('./agent-launcher.mjs');
  await launchReadyTasks(manifest, repo, ghToken);

  console.log('[init] Initialisation terminée.');
}

main().catch(err => {
  console.error('[init] ERREUR :', err.message);
  process.exit(1);
});
