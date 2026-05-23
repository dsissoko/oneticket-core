/**
 * agent-dispatch.mjs
 *
 * [DÉTERMINISTE] Traite les invocations agents depuis les commentaires GitHub.
 * Appelé par Comment Dispatcher (on-issue-comment.yml).
 *
 * Responsabilités :
 *   1. Parser le commentaire : premier /role → paramètre role, reste → paramètre demande
 *   2. Créer feature/issue-N si elle n'existe pas (déterministe)
 *   3. Charger agents/config.yml (language, autonomous_mode)
 *   4. Construire le prompt complet : profil role + demande + contexte issue
 *   5. Dispatcher Agent Execute (agent-execute.yml) via API GitHub workflow_dispatch
 *
 * Parsing du commentaire :
 *   - Scan du début à la fin
 *   - Premier match de /[a-zA-Z][a-zA-Z0-9_-]* → role
 *   - Cette occurrence est retirée du commentaire → reste = demande (trimé)
 *   - Exemple : "/po peux-tu créer un jeu Breakout ?"
 *               → role="po", demande="peux-tu créer un jeu Breakout ?"
 *
 * Variables d'environnement attendues :
 *   GITHUB_TOKEN, ISSUE_NUMBER, ISSUE_TITLE, ISSUE_BODY, COMMENT_BODY, REPO
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers git
// ---------------------------------------------------------------------------

function run(cmd, opts = {}) {
  console.log(`[agent-dispatch] $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd) {
  console.log(`[agent-dispatch] $ ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

// ---------------------------------------------------------------------------
// Parsing commentaire
// ---------------------------------------------------------------------------

/**
 * Parse un commentaire GitHub pour en extraire le role et la demande.
 *
 * Règle : scan du début à la fin, premier /role rencontré est extrait.
 * Le reste du commentaire (sans ce /role) constitue la demande.
 *
 * @param {string} comment - Corps du commentaire GitHub
 * @returns {{ role: string, demande: string } | null} - null si aucun /role trouvé
 */
function parseComment(comment) {
  // Match le premier /role : lettre puis lettres/chiffres/tirets/underscores
  const match = comment.match(/\/([a-zA-Z][a-zA-Z0-9_-]*)/);
  if (!match) {
    console.log('[agent-dispatch] Aucun /role trouvé dans le commentaire — sortie sans action.');
    return null;
  }

  const role = match[1].toLowerCase();
  // Retirer la première occurrence du /role du commentaire
  const demande = comment.replace(match[0], '').trim();

  console.log(`[agent-dispatch] role="${role}", demande="${demande.slice(0, 80)}..."`);
  return { role, demande };
}

// ---------------------------------------------------------------------------
// Chargement config et profil
// ---------------------------------------------------------------------------

/**
 * Charge agents/config.yml — minimaliste, parse manuellement les clés simples.
 * Évite une dépendance yaml externe pour 2 clés.
 */
function loadConfig() {
  const configPath = path.join(__dirname, '..', 'agents', 'config.yml');
  if (!fs.existsSync(configPath)) {
    console.warn('[agent-dispatch] agents/config.yml introuvable — valeurs par défaut.');
    return { language: null, autonomous_mode: true };
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  const language = (raw.match(/^language:\s*(\S+)/m) || [])[1] || null;
  const autonomousRaw = (raw.match(/^autonomous_mode:\s*(\S+)/m) || [])[1];
  const autonomous_mode = autonomousRaw !== 'false';
  return { language, autonomous_mode };
}

/**
 * Charge le profil d'un agent depuis agents/<role>/profile.md.
 * Retourne le contenu brut ou une chaîne vide si introuvable.
 */
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
 * Construit le prompt complet injecté dans Agent Execute.
 * Structure :
 *   - Première action : git checkout <branch> (mécanisme switched=true anomalyco)
 *   - Profil de l'agent (agents/<role>/profile.md)
 *   - Directives de mode (language, autonomous_mode)
 *   - Contexte de la branche de travail
 *   - Demande active
 *   - Contexte de l'issue (titre + body)
 *
 * NOTE : le "git checkout <branch>" en tête du prompt est le signal que anomalyco
 * interprète comme switched=true → désactive son push automatique et sa création de PR.
 */
function buildPrompt({ role, demande, issueNumber, issueTitle, issueBody, config, profile }) {
  const branch = `feature/issue-${issueNumber}`;
  const lines = [];

  // Première action : git checkout — mécanisme switched=true anomalyco
  lines.push(`FIRST ACTION - no exception: run bash command: git checkout ${branch}.`);
  lines.push('');

  // Profil de l'agent
  if (profile) {
    lines.push(profile);
    lines.push('');
  }

  // Directives de mode
  if (config.language) {
    lines.push(`## Language`);
    lines.push(`Réponds exclusivement en ${config.language}. Directive système.`);
    lines.push('');
  }

  lines.push(`## Mode`);
  lines.push(`autonomous_mode: ${config.autonomous_mode}`);
  lines.push('');

  // Branche de travail
  lines.push(`## Branche de travail`);
  lines.push(branch);
  lines.push('');

  // Demande active
  lines.push(`## Demande`);
  lines.push(demande || `/${role}`);
  lines.push('');

  // Contexte issue
  lines.push(`## Contexte de l'issue #${issueNumber}`);
  if (issueTitle) {
    lines.push(`**Titre :** ${issueTitle}`);
  }
  if (issueBody) {
    lines.push('');
    lines.push(issueBody);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Dispatch vers Agent Execute
// ---------------------------------------------------------------------------

/**
 * Déclenche agent-execute.yml via l'API GitHub workflow_dispatch.
 */
async function dispatchAgentExecute({ issueNumber, branch, prompt, repo, token }) {
  const url = `https://api.github.com/repos/${repo}/actions/workflows/agent-execute.yml/dispatches`;

  console.log(`[agent-dispatch] Dispatch Agent Execute — issue #${issueNumber}, branche ${branch}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        issue_number: String(issueNumber),
        branch,
        prompt,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Échec dispatch agent-execute.yml : ${res.status} ${body}`);
  }

  console.log(`[agent-dispatch] Agent Execute déclenché avec succès.`);
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
  if (!parsed) return; // Aucun /role → sortie propre

  const { role, demande } = parsed;
  const featureBranch = `feature/issue-${issueNumber}`;

  // --- 2. Créer la branche feature si elle n'existe pas ----------------
  run('git config user.name "oneticket-bot"');
  run('git config user.email "oneticket-bot@users.noreply.github.com"');

  if (ghToken) {
    run(`git remote set-url origin https://x-access-token:${ghToken}@github.com/${repo}.git`);
  }

  run('git fetch origin');

  const remoteBranches = runCapture('git branch -r');
  if (remoteBranches.includes(`origin/${featureBranch}`)) {
    console.log(`[agent-dispatch] Branche ${featureBranch} existe déjà.`);
  } else {
    console.log(`[agent-dispatch] Création de la branche ${featureBranch}...`);
    run(`git checkout -b ${featureBranch}`);
    run(`git push origin ${featureBranch}`);
    run(`git checkout -`); // retour sur la branche d'origine
  }

  // --- 3. Charger config + profil --------------------------------------
  const config  = loadConfig();
  const profile = loadProfile(role);

  // --- 4. Construire le prompt -----------------------------------------
  const prompt = buildPrompt({
    role,
    demande,
    issueNumber,
    issueTitle,
    issueBody,
    config,
    profile,
  });

  console.log(`[agent-dispatch] Prompt construit (${prompt.length} caractères).`);

  // --- 5. Dispatcher Agent Execute ------------------------------------
  await dispatchAgentExecute({
    issueNumber,
    branch: featureBranch,
    prompt,
    repo,
    token: ghToken,
  });

  console.log('[agent-dispatch] Dispatch terminé.');
}

main().catch(err => {
  console.error('[agent-dispatch] ERREUR :', err.message);
  process.exit(1);
});
