/**
 * validate-task-branch.mjs
 *
 * [CI UTILITY] Validates that a task branch belongs to the correct feature branch.
 * Ensures task/issue-N-X is only merged into feature/issue-N — never into another issue.
 *
 * Usage:
 *   node src/validate-task-branch.mjs <head_ref> <base_ref>
 *   node src/validate-task-branch.mjs task/issue-42-A feature/issue-42   → exit 0
 *   node src/validate-task-branch.mjs task/issue-42-A feature/issue-99   → exit 1
 *
 * Exit codes:
 *   0 — branches are coherent, issue numbers match
 *   1 — mismatch or invalid format
 */

const headRef = process.argv[2];
const baseRef = process.argv[3];

if (!headRef || !baseRef) {
  process.stderr.write('Usage: node src/validate-task-branch.mjs <head_ref> <base_ref>\n');
  process.exit(1);
}

const headMatch = headRef.match(/^task\/issue-(\d+)-([A-Za-z0-9]+)$/);
const baseMatch = baseRef.match(/^feature\/issue-(\d+)$/);

if (!headMatch) {
  process.stderr.write(`[validate-task-branch] Invalid head branch format: "${headRef}"\n`);
  process.stderr.write(`[validate-task-branch] Expected: task/issue-<N>-<ID>\n`);
  process.exit(1);
}

if (!baseMatch) {
  process.stderr.write(`[validate-task-branch] Invalid base branch format: "${baseRef}"\n`);
  process.stderr.write(`[validate-task-branch] Expected: feature/issue-<N>\n`);
  process.exit(1);
}

const issueHead = headMatch[1];
const issueBase = baseMatch[1];

if (issueHead !== issueBase) {
  process.stderr.write(
    `[validate-task-branch] SECURITY: issue mismatch!\n` +
    `[validate-task-branch]   head: ${headRef} (issue #${issueHead})\n` +
    `[validate-task-branch]   base: ${baseRef} (issue #${issueBase})\n` +
    `[validate-task-branch]   A task branch can only be merged into its own feature branch.\n`
  );
  process.exit(1);
}

const taskId = headMatch[2];
process.stdout.write(`[validate-task-branch] OK: task ${taskId} (issue #${issueHead}) → ${baseRef}\n`);
process.exit(0);
