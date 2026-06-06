---
weight: 1
title: "Merge Conflict Recovery"
---

# Runbook — Merge Conflict Recovery

## General principle

Merge conflicts in a FAN-OUT/GATHER pipeline are **normal and expected** — not a framework failure. They occur when parallel task branches independently modify shared files (`package.json`, `tsconfig.json`, `vite.config.ts`, test setup files).

When a task fails to merge, the pipeline stalls. Recovery means **doing the work of the failed tasks yourself**, then resuming the pipeline correctly.

---

## When to use this runbook

- One or more tasks have status `merge-failed` in the manifest
- The pipeline is stalled — no new tasks are being dispatched
- Pending tasks remain blocked because their dependencies never completed

---

## Step 1 — Read the manifest

```bash
gh api "repos/{owner}/{repo}/contents/.oneticket/tasks/issue-{N}/manifest.json?ref=feature/issue-{N}" \
  --jq '.content' | base64 -d | python3 -c "
import json,sys
m=json.load(sys.stdin)
by_status={}
for t in m['tasks']:
    by_status.setdefault(t['status'],[]).append(t['id'])
for s,ids in sorted(by_status.items()):
    print(f'{s:15} ({len(ids):2}) : {\", \".join(ids)}')
"
```

Identify all tasks in `merge-failed`, `in_progress`, and `pending` states.

---

## Step 2 — Check build artifacts

Before anything else, check that agents haven't committed build artifacts:

```bash
git ls-files apps/{app}/dist/
git ls-files apps/{app}/test-results/
git ls-files apps/{app}/vite.config.js apps/{app}/vite.config.d.ts
```

Remove if present:

```bash
git rm -r apps/{app}/dist/ apps/{app}/test-results/ 2>/dev/null || true
git rm apps/{app}/vite.config.js apps/{app}/vite.config.d.ts 2>/dev/null || true
git commit -m "chore: remove build artifacts — should never have been committed"
git push origin feature/issue-{N}
```

> Root cause: incomplete `.gitignore` + agent used `git add -A`.

---

## Step 3 — Apply the failed tasks manually

Recovery = substituting yourself for the failed tasks. You apply their work directly on `feature/issue-{N}`.

```bash
git fetch origin
git checkout feature/issue-{N}
git pull origin feature/issue-{N}
```

For each `merge-failed` task, inspect what the task branch contains:

```bash
git diff origin/feature/issue-{N}...origin/task/issue-{N}-{ID} --name-only
```

Then either cherry-pick the task branch content or apply the changes manually. Commit with a clear message:

```bash
git commit -m "fix: apply task {ID} manually — merge-failed recovery"
```

Repeat for each failed task. Then push:

```bash
git push origin feature/issue-{N}
```

---

## Step 4 — Update the manifest

Mark all substituted tasks as `done`:

```bash
# Edit .oneticket/tasks/issue-{N}/manifest.json
# Change "status": "merge-failed" → "status": "done" for each substituted task
git add .oneticket/tasks/issue-{N}/manifest.json
git commit -m "chore: mark tasks {IDs} as done — manual recovery"
git push origin feature/issue-{N}
```

Also reset any phantom `in_progress` tasks (empty branches, never executed) to `pending`:

```bash
node -e "
const fs = require('fs');
const path = '.oneticket/tasks/issue-{N}/manifest.json';
const m = JSON.parse(fs.readFileSync(path, 'utf8'));
for (const t of m.tasks) {
  if (t.status === 'in_progress') t.status = 'pending';
}
fs.writeFileSync(path, JSON.stringify(m, null, 2) + '\n');
console.log('manifest updated');
"
git add .oneticket/tasks/issue-{N}/manifest.json
git commit -m "fix: reset phantom in_progress tasks to pending"
git push origin feature/issue-{N}
```

---

## Step 5 — Clean up stale branches and PRs

Close the PRs of failed tasks and delete their branches — they have no value now:

```bash
for task in {TASK_IDS}; do
  PR=$(gh pr list --repo {owner}/{repo} --head "task/issue-{N}-$task" --json number --jq '.[0].number')
  [ -n "$PR" ] && gh pr close $PR --repo {owner}/{repo}
  gh api repos/{owner}/{repo}/git/refs/heads/task/issue-{N}-$task -X DELETE
done
```

---

## Step 6 — Resume the pipeline

Two cases depending on what remains after recovery.

### Case A — No tasks remaining (substituted tasks were the last ones)

The pipeline is complete. Trigger the final PR directly:

```bash
gh workflow run on-gather.yml \
  --repo {owner}/{repo} \
  --field task_branch=task/issue-{N}-{ANY_DONE_TASK} \
  --field branch_base=feature/issue-{N}
```

The orchestrator detects idempotence (all tasks `done`), skips merges, and creates the final PR.

### Case B — Dependent tasks still need to run (general case)

The substituted tasks have dependents that are still `pending`. The orchestrator must traverse the dependency graph to unblock them.

**First**, temporarily set the substituted tasks back to `pending` in the manifest (the task branches were deleted in Step 5 — recreate minimal ones):

```bash
for task in {SUBSTITUTED_IDS}; do
  git checkout -b task/issue-{N}-$task origin/feature/issue-{N}
  git push origin task/issue-{N}-$task
done
```

**Then** trigger one `on-gather` per substituted task, in dependency order:

```bash
gh workflow run on-gather.yml \
  --repo {owner}/{repo} \
  --field task_branch=task/issue-{N}-{ID} \
  --field branch_base=feature/issue-{N}
```

The orchestrator merges the (now empty) task branch, marks it `done`, and dispatches the dependent tasks. Repeat for each substituted task.

> **How to choose Case A vs Case B:** After applying the failed tasks manually, check the manifest. If no task has `status: pending` or `status: in_progress` → Case A. Otherwise → Case B.

Once the pipeline completes and the final PR is merged, follow [Post-Merge Cleanup](./post-merge.md) to remove residual branches and labels.

---

## What not to do

- **Never ask an agent to execute the recovery** — agents cannot run git commands on the remote. They will simulate and produce a false success report, corrupting the manifest.
- **Never push directly on `feature/issue-N` without updating the manifest** — the pipeline will not resume automatically. A push on `feature/*` does not trigger `on-gather.yml`.
- **Never trust an agent's "done" report without verifying** — confirm with `gh api compare` that the branch is actually merged (ahead: 0 or branch deleted).

---

## Known issues and fixes

| Symptom | Cause | Fix |
|---|---|---|
| Pipeline stalls after idempotence — no FAN-OUT | Orchestrator exits early, dependent tasks not dispatched | Case B: recreate minimal task branches, trigger on-gather per substituted task |
| `agent-execute` triggered after manual push on `feature/*` | Push on feature branch triggers wrong workflow | Guard in `agent-execute.yml` rejects non-`task/*` branches |
| Manifest says `done` but branch still open | Agent updated manifest text without running git | Verify with `compare` API — merge manually and close PR |
| Build artifacts in repo (`dist/`, `test-results/`) | Incomplete `.gitignore` + `git add -A` | Remove with `git rm`, complete `.gitignore` |
| Duplicate config files (`vite.config.js`, `vite.config.d.ts`) | TypeScript compiled config files committed | Remove with `git rm`, add to `.gitignore` |

---

## Canonical examples

**Issue #766 — monjournal (May 2026) — Case B**
- 5 tasks `merge-failed` (E, I, J, O, S) — conflicts on `package.json`, `package-lock.json`, `vite.config.ts`
- Tasks J and O committed `dist/` artifacts
- Task I was never actually merged despite being marked `done` by an agent
- Tasks F and K were `in_progress` with empty branches (never executed)
- Recovery: artifacts removed, tasks merged manually, manifest corrected, pipeline resumed via Workflow Gather

**Issue #929 — AppShell v2 (May 2026) — Case A**
- 3 tasks `merge-failed` (A, M, N) — last tasks of the pipeline, no dependents
- Applied manually on `feature/issue-929`, manifest updated to `done`
- Task branches closed and deleted
- Final PR created via `on-gather` on any already-done task (idempotence → `allDone` → PR)
