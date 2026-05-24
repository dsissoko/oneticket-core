/**
 * retry-dispatch.mjs
 *
 * [DÉTERMINISTE] Re-dispatch de agent-execute.yml en cas d'échec anomalyco.
 * Appelé par agent-execute.yml step "Retry on agent failure".
 *
 * Utilise dispatchWorkflow() depuis utils.mjs — exactement le même mécanisme
 * que agent-launcher.mjs et agent-dispatch.mjs → API GitHub JSON → safe pour
 * tout contenu (code, caractères spéciaux, sauts de ligne, guillemets...).
 *
 * Raison d'existence : le re-dispatch bash via 'gh workflow run --field prompt="..."'
 * interprète les caractères spéciaux du prompt → exit 127 sur du contenu complexe.
 * Ce script résout définitivement ce problème.
 *
 * Variables d'environnement attendues (toutes passées depuis agent-execute.yml) :
 *   GITHUB_TOKEN, REPO, RETRY_COUNT, RETRY_MAX,
 *   ISSUE_NUMBER, BRANCH, BRANCH_BASE, ROLE, MODEL, PROMPT
 */

import { dispatchWorkflow } from './utils.mjs';

async function main() {
  const repo       = process.env.REPO;
  const token      = process.env.GITHUB_TOKEN;
  const retryCount = parseInt(process.env.RETRY_COUNT || '0', 10);
  const retryMax   = parseInt(process.env.RETRY_MAX   || '3', 10);

  if (!repo)  throw new Error('REPO manquant');
  if (!token) throw new Error('GITHUB_TOKEN manquant');

  if (retryCount >= retryMax) {
    console.error(`[retry-dispatch] Max retries atteint (${retryMax}). Échec définitif.`);
    process.exit(1);
  }

  const nextRetry = retryCount + 1;
  const delay     = Math.pow(2, nextRetry) * 1000 + Math.floor(Math.random() * 500);

  console.log(`[retry-dispatch] Agent a échoué. retry_count=${retryCount} / max=${retryMax}`);
  console.log(`[retry-dispatch] Attente ${delay}ms avant re-dispatch (tentative ${nextRetry}/${retryMax})...`);

  await new Promise(r => setTimeout(r, delay));

  await dispatchWorkflow('agent-execute.yml', {
    issue_number: process.env.ISSUE_NUMBER,
    branch:       process.env.BRANCH,
    branch_base:  process.env.BRANCH_BASE || '',
    prompt:       process.env.PROMPT,
    role:         process.env.ROLE        || '',
    model:        process.env.MODEL       || 'opencode/claude-haiku-4-5',
    retry_count:  String(nextRetry),
    retry_max:    String(retryMax),
  }, repo, token);

  console.log(`[retry-dispatch] Re-dispatch déclenché (tentative ${nextRetry}/${retryMax}). Ce run se termine proprement.`);
}

main().catch(err => {
  console.error('[retry-dispatch] ERREUR :', err.message);
  process.exit(1);
});
