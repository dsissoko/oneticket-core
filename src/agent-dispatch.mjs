/**
 * agent-dispatch.mjs
 *
 * [DÉTERMINISTE] Traite les invocations agents depuis les commentaires GitHub.
 * Appelé par Comment Dispatcher (on-issue-comment.yml).
 *
 * Responsabilités :
 *   1. Parser le commentaire : premier /role → paramètre role, reste → paramètre demande
 *   2. Créer feature/issue-N si elle n'existe pas (déterministe)
 *   3. Construire le prompt complet : profil role + demande + contexte issue
 *   4. Dispatcher Agent Execute (agent-execute.yml) via API GitHub workflow_dispatch
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, ISSUE_NUMBER, ISSUE_TITLE, ISSUE_BODY, COMMENT_BODY, REPO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.mjs';
import { run, runCapture, runWithRetry, setupGit, dispatchWorkflow } from './utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Parsing commentaire
// ---------------------------------------------------------------------------

function parseComment(comment) {
  const match = comment.match(/\/([a-zA-Z][a-zA-Z0-9_-]*)/);
  if (!match) {
    console.log('[agent-dispatch] Aucun /role trouvé dans le commentaire — sortie sans action.');
    return null;
  }
  const role = match[1].toLowerCase();
  const demande = comment.replace(match[0], '').trim();
  console.log(`[agent-dispatch] role="${role}", demande="${demande.slice(0, 80)}..."`);
  return { role, demande };
}

// ---------------------------------------------------------------------------
// Chargement profil
// ---------------------------------------------------------------------------

function loadProfile(role) {
  const profilePath = path.join(__dirname, '..', 'agents', role, 'profile.md');
  if (!fs.existsSync(profilePath)) {
    console.warn(`[agent-dispatch] Profil introuvable pour le role "${role}" : ${profilePath}`);
    return '';
  }
  return fs.readFileSync(profilePath, 'utf8');
}

// ---------------------------------------------------------------------------
// Construction du prompt
// ---------------------------------------------------------------------------

/**
 * NOTE : le "git checkout <branch>" en tête du prompt est le signal que anomalyco
 * interprète comme switched=true → désactive son push automatique et sa création de PR.
 */
function buildPrompt({ role, demande, issueNumber, issueTitle, issueBody, config, profile }) {
  const branch = `feature/issue-${issueNumber}`;
  const lines = [];

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
  lines.push(demande || `/${role}`);
  lines.push('');

  lines.push(`## Contexte de l'issue #${issueNumber}`);
  if (issueTitle) lines.push(`**Titre :** ${issueTitle}`);
  if (issueBody) {
    lines.push('');
    lines.push(issueBody);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const commentBody = process.env.COMMENT_BODY || '';
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueTitle  = process.env.ISSUE_TITLE  || '';
  const issueBody   = process.env.ISSUE_BODY   || '';
  const repo        = process.env.REPO;
  const ghToken     = process.env.GITHUB_TOKEN;

  if (!issueNumber) throw new Error('ISSUE_NUMBER manquant');
  if (!repo)        throw new Error('REPO manquant');

  // --- 1. Parser le commentaire ----------------------------------------
  const parsed = parseComment(commentBody);
  if (!parsed) return;

  const { role, demande } = parsed;
  const featureBranch = `feature/issue-${issueNumber}`;

  // --- 2. Charger la config + profil -----------------------------------
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

  // --- 4. Construire le prompt -----------------------------------------
  const prompt = buildPrompt({ role, demande, issueNumber, issueTitle, issueBody, config, profile });
  console.log(`[agent-dispatch] Prompt construit (${prompt.length} caractères).`);

  // --- 5. Dispatcher Agent Execute ------------------------------------
  console.log(`[agent-dispatch] Dispatch Agent Execute — issue #${issueNumber}, branche ${featureBranch}`);
  await dispatchWorkflow('agent-execute.yml', {
    issue_number: String(issueNumber),
    branch:       featureBranch,
    prompt,
    model:        config.model,
    retry_max:    String(config.retry_max),
  }, repo, ghToken);

  console.log('[agent-dispatch] Dispatch terminé.');
}

main().catch(err => {
  console.error('[agent-dispatch] ERREUR :', err.message);
  process.exit(1);
});
