/**
 * agent-dispatch.mjs
 *
 * [DÉTERMINISTE] Traite les invocations agents depuis les triggers GitHub.
 * Point d'entrée unique pour tout déclenchement agent.
 *
 * Contrat d'interface — variables d'environnement obligatoires :
 *   COMMENT_BODY   — texte du commentaire contenant @<role> + demande
 *   ISSUE_NUMBER   — numéro d'issue GitHub (pour branche feature/issue-N)
 *   REPO           — owner/repo
 *   GITHUB_TOKEN   — PAT GitHub
 *
 * Variable optionnelle fournie par chaque trigger :
 *   CONTEXT_BLOCK  — bloc texte libre construit par le workflow YAML du trigger
 *                    (contexte issue, PR diff, historique, etc.)
 *                    Inséré tel quel dans le prompt système.
 *                    Chaque trigger est autonome pour construire ce bloc.
 *
 * Extensibilité : pour ajouter un nouveau trigger, créer un nouveau workflow
 * YAML qui expose ces variables + construit son propre CONTEXT_BLOCK.
 * Ce fichier ne change pas.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';
import { run, runCapture, runWithRetry, setupGit, dispatchWorkflow } from './utils.mjs';
import { AGENTS_DIR, AGENT_EXT } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Parsing commentaire — zone commune
// ---------------------------------------------------------------------------

/**
 * Parse le commentaire pour extraire role et demande.
 * Premier @<role> trouvé → role. Reste du commentaire → demande.
 *
 * @returns {{ role: string, demande: string } | null}
 */
function parseComment(commentBody) {
  const match = commentBody.match(/@([a-zA-Z][a-zA-Z0-9_-]*)/);
  if (!match) {
    console.log('[agent-dispatch] Aucun @role trouvé dans le commentaire — sortie sans action.');
    return null;
  }
  const role    = match[1].toLowerCase();
  const demande = commentBody.replace(match[0], '').trim();
  console.log(`[agent-dispatch] role="${role}", demande="${demande.slice(0, 80)}..."`);
  return { role, demande };
}

// ---------------------------------------------------------------------------
// Chargement profil
// ---------------------------------------------------------------------------

/**
 * Charge .oneticket/agents/<role>.agent.md.
 * Retourne le contenu brut ou chaîne vide si introuvable.
 */
function loadProfile(role) {
  const profilePath = path.join(__dirname, '..', AGENTS_DIR, `${role}${AGENT_EXT}`);
  if (!fs.existsSync(profilePath)) {
    throw new Error(
      `Aucun profil agent pour "@${role}" : ${profilePath}
` +
      `Créer ${AGENTS_DIR}/${role}${AGENT_EXT} pour activer cet agent.`
    );
  }
  return fs.readFileSync(profilePath, 'utf8');
}

// ---------------------------------------------------------------------------
// Construction du prompt système
// ---------------------------------------------------------------------------

/**
 * Construit le prompt système injecté dans Agent Execute.
 *
 * Structure :
 *   [Tronc commun]
 *     - git checkout (mécanisme switched=true anomalyco)
 *     - Profil agent
 *     - Language + autonomous_mode
 *     - Demande
 *   [Contexte trigger]
 *     - CONTEXT_BLOCK tel quel (construit par le workflow YAML du trigger)
 *
 * NOTE : git checkout en tête → anomalyco détecte switched=true →
 * désactive push automatique et création PR.
 */
function buildPrompt({ role, demande, branch, config, profile, contextBlock }) {
  const lines = [];

  // Tronc commun — obligatoire quel que soit le trigger
  lines.push(`FIRST ACTION - no exception: run bash command: git checkout ${branch}.`);
  lines.push('');

  if (profile) {
    lines.push(profile);
    lines.push('');
  }

  if (config.language) {
    lines.push(`## Language`);
    lines.push(`Réponds exclusivement en ${config.language}. Directive système.`);
    lines.push('');
  }

  lines.push(`## Mode`);
  lines.push(`autonomous_mode: ${config.autonomous_mode}`);
  lines.push('');

  lines.push(`## Branche de travail`);
  lines.push(branch);
  lines.push('');

  lines.push(`## Demande`);
  lines.push(demande || `@${role}`);
  lines.push('');

  // Contexte trigger — spécifique, construit par le workflow YAML
  if (contextBlock) {
    lines.push(contextBlock);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const commentBody  = process.env.COMMENT_BODY  || '';
  const issueNumber  = process.env.ISSUE_NUMBER;
  const repo         = process.env.REPO;
  const ghToken      = process.env.GITHUB_TOKEN;
  const contextBlock = process.env.CONTEXT_BLOCK || '';

  if (!issueNumber) throw new Error('ISSUE_NUMBER manquant');
  if (!repo)        throw new Error('REPO manquant');

  // --- 1. Parser le commentaire — zone commune -------------------------
  const parsed = parseComment(commentBody);
  if (!parsed) return;

  const { role, demande } = parsed;
  const featureBranch = `feature/issue-${issueNumber}`;

  // --- 2. Charger config + profil --------------------------------------
  const config  = loadConfig();
  const profile = loadProfile(role);

  // --- 3. Setup git + créer la branche feature si elle n'existe pas ----
  setupGit('agent-dispatch', config, repo, ghToken);

  const remoteBranches = runCapture('agent-dispatch', 'git branch -r');
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    console.log(`[agent-dispatch] Branche ${featureBranch} existe déjà.`);
  } else {
    console.log(`[agent-dispatch] Création de la branche ${featureBranch}...`);
    run('agent-dispatch', `git checkout -b ${featureBranch}`);
    runWithRetry('agent-dispatch', `git push origin ${featureBranch}`);
    run('agent-dispatch', `git checkout -`);
  }

  // --- 4. Construire le prompt système ---------------------------------
  const prompt = buildPrompt({
    role,
    demande,
    branch:       featureBranch,
    config,
    profile,
    contextBlock,
  });
  console.log(`[agent-dispatch] Prompt construit (${prompt.length} caractères).`);

  // --- 5. Dispatcher Agent Execute -------------------------------------
  console.log(`[agent-dispatch] Dispatch Agent Execute — role=${role}, issue #${issueNumber}, branche ${featureBranch}`);
  await dispatchWorkflow('agent-execute.yml', {
    issue_number: String(issueNumber),
    branch:       featureBranch,
    prompt,
    role,
    model:        config.model,
    retry_max:    String(config.retry_max),
  }, repo, ghToken);

  console.log('[agent-dispatch] Dispatch terminé.');
}

main().catch(err => {
  console.error('[agent-dispatch] ERREUR :', err.message);
  process.exit(1);
});
