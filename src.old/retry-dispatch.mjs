/**
 * retry-dispatch.mjs
 *
 * [DETERMINISTIC] Re-dispatches agent-execute.yml on anomalyco failure.
 * Called by agent-execute.yml step "Retry on agent failure".
 *
 * Expected environment variables (all passed from agent-execute.yml):
 *   GITHUB_TOKEN, REPO, RETRY_COUNT, RETRY_MAX,
 *   ISSUE_NUMBER, BRANCH, BRANCH_BASE, ROLE, MODEL, PROMPT
 *
 * MODEL: required — mandatory for the anomalyco action (required: true in action.yml).
 * Value sourced from agent_config.<cli>.model in .oneticket/config.yml.
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
    }
    process.exit(1);
  }

  const nextRetry = retryCount + 1;
  const delay     = Math.pow(2, nextRetry) * 1000 + Math.floor(Math.random() * 500);

  console.log(`[retry-dispatch] Agent failed. retry_count=${retryCount} / max=${retryMax}`);
  console.log(`[retry-dispatch] Waiting ${delay}ms before re-dispatch (attempt ${nextRetry}/${retryMax})...`);

  await new Promise(r => setTimeout(r, delay));

  await dispatchWorkflow('agent-execute.yml', {
    issue_number: process.env.ISSUE_NUMBER,
    branch:       process.env.BRANCH,
    branch_base:  process.env.BRANCH_BASE || '',
    prompt:       process.env.PROMPT,
    role:         process.env.ROLE        || '',
    model,
    retry_count:  String(nextRetry),
    retry_max:    String(retryMax),
  }, repo, token);

  console.log(`[retry-dispatch] Re-dispatch triggered (attempt ${nextRetry}/${retryMax}). This run exits cleanly.`);
}

main().catch(err => {
  console.error('[retry-dispatch] ERROR:', err.message);
  process.exit(1);
});
