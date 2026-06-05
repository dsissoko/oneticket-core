/**
 * retry-dispatch.mjs
 *
 * [DETERMINISTIC] Re-dispatches agent-execute.yml on anomalyco failure.
 * Called by agent-execute.yml step "Retry on agent failure".
 *
 * Env vars: GITHUB_TOKEN, REPO, RETRY_COUNT, RETRY_MAX,
 *           ISSUE_NUMBER, BRANCH, ROLE, MODEL, PROMPT
 *
 * branch_base removed in v1.0.0 — not passed between workflows.
 */

import { dispatchWorkflow, applyLabel } from './utils.mjs';

async function main() {
  const repo       = process.env.REPO;
  const token      = process.env.GITHUB_TOKEN;
  const retryCount = parseInt(process.env.RETRY_COUNT || '0', 10);
  const retryMax   = parseInt(process.env.RETRY_MAX   || '3', 10);
  const model      = process.env.MODEL;

  if (!repo)  throw new Error('REPO missing');
  if (!token) throw new Error('GITHUB_TOKEN missing');
  if (!model) throw new Error('MODEL missing');

  if (retryCount >= retryMax) {
    console.error(`[retry-dispatch] Max retries reached (${retryMax}). Definitive failure.`);
    const issueNumber = process.env.ISSUE_NUMBER;
    if (issueNumber) {
      await applyLabel('blocked', issueNumber, repo, token, 'retry-dispatch');
      await removeLabel('in progress', issueNumber, repo, token, 'retry-dispatch');
    }
    process.exit(1);
  }

  const nextRetry = retryCount + 1;
  const delay     = Math.pow(2, nextRetry) * 1000 + Math.floor(Math.random() * 500);

  console.log(`[retry-dispatch] Agent failed. retry_count=${retryCount} / max=${retryMax}`);
  console.log(`[retry-dispatch] Waiting ${delay}ms before re-dispatch (attempt ${nextRetry}/${retryMax})...`);

  await new Promise(r => setTimeout(r, delay));

  await dispatchWorkflow('agent-execute.yml', {
    issue_number:   process.env.ISSUE_NUMBER,
    branch:         process.env.BRANCH,
    prompt:         process.env.PROMPT,
    role:           process.env.ROLE           || '',
    is_fanout_task: process.env.IS_FANOUT_TASK || 'false',
    model,
    retry_count:    String(nextRetry),
    retry_max:      String(retryMax),
  }, repo, token);

  console.log(`[retry-dispatch] Re-dispatch triggered (attempt ${nextRetry}/${retryMax}). This run exits cleanly.`);
}

main().catch(err => {
  console.error('[retry-dispatch] ERROR:', err.message);
  process.exit(1);
});
