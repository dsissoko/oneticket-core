/**
 * init.mjs
 *
 * [BOOTSTRAP] Point d'entrée du workflow complet, déclenché par /start sur une issue.
 * 100% déterministe — aucun LLM impliqué.
 *
 * Responsabilités :
 *   1. Parser le corps de l'issue pour extraire la liste des tâches
 *      → si absent, fallback sur test/fixtures/tasks-graph.json
 *   2. Construire le manifest.json (source de vérité en git)
 *   3. Créer la branche feature/issue-<N>
 *   4. Commiter le manifest.json sur cette branche
 *   5. Déclencher le premier [FAN-OUT] via agent-launcher → tâches sans dépendances
 *
 * [IDEMPOTENCE] Si la branche feature existe déjà avec un manifest actif
 * (au moins une tâche non-pending), on sort proprement sans rien écraser.
 * Protège contre le double déclenchement de /start.
 *
 * Format attendu dans le corps de l'issue (bloc JSON entre triple backticks) :
 * ```json
 * {
 *   "tasks": [
 *     { "id": "A", "file": "subtask-A.txt", "content": "...", "depends_on": [] },
 *     { "id": "B", "file": "subtask-B.txt", "content": "...", "depends_on": ["A"] }
 *   ]
 * }
 * ```
 *
 * Variables d'environnement attendues (injectées par le workflow) :
 *   GITHUB_TOKEN, ISSUE_NUMBER, ISSUE_TITLE, ISSUE_BODY, REPO
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
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueBody   = process.env.ISSUE_BODY   || '';
  const repo        = process.env.REPO;

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

  // --- [IDEMPOTENCE] Guard : branche + manifest déjà actifs ? ---------------
  const remoteBranches = runCapture('git branch -r');
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    // La branche existe — vérifier l'état du manifest
    run(`git checkout -B ${featureBranch} origin/${featureBranch}`);
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
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
  // Isolation complète par issue : manifest, workflow, params (via agent-run)
  // sous le même répertoire tasks/issue-<N>/ → zéro collision entre issues sur main.
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
