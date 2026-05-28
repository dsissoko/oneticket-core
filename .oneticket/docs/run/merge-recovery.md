# Runbook — Merge Conflict Recovery

## General principle

Merge conflicts in a FAN-OUT/GATHER pipeline are **normal and expected** — not a framework failure. They occur when parallel task branches independently modify shared configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, test setup files).

The recovery procedure is always the same: **verify the manifest against the actual branch state, resolve conflicts manually in order of lag, correct the manifest, and resume via Workflow Gather.**

> **Reference:** [product-spec §15](../what/product-spec.md#15-merge-conflict-recovery) for the structural explanation.

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

## Step 2 — Check branch lag

For each `merge-failed` task, check how far behind it is:

```bash
gh api "repos/{owner}/{repo}/compare/feature/issue-{N}...task/issue-{N}-{ID}" \
  --jq '{ahead: .ahead_by, behind: .behind_by, files: [.files[].filename]}'
```

Note:
- `behind` — how many commits the task branch lags behind the feature branch. Merge **least behind first**.
- `files` — look for `package.json`, `tsconfig.json`, `vite.config.ts`, `dist/`, `test-results/`

**Also check for phantom branches** — branches marked `in_progress` in the manifest with `ahead: 0, behind: 0` are empty and were never executed. Reset them to `pending`.

---

## Step 3 — Checkout locally

```bash
git fetch origin
git checkout -b feature/issue-{N} origin/feature/issue-{N}
```

---

## Step 4 — Remove build artifacts

Check first:

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
```

> Root cause: incomplete `.gitignore` + agent used `git add -A`. Fix `.gitignore` before resuming (see issue #785 — `oneticket-gitignore` skill).

---

## Step 5 — Merge task branches in order

Merge from **least behind** to **most behind**.

```bash
git merge --no-ff origin/task/issue-{N}-{ID} -m "chore: merge task {ID} into feature/issue-{N}"
```

**On conflict with shared config files** — always take `--ours` (feature branch is authoritative):

```bash
git checkout --ours apps/{app}/package.json
git checkout --ours apps/{app}/package-lock.json
git checkout --ours apps/{app}/tsconfig.json
git checkout --ours apps/{app}/vitest.config.ts
git add -A
git commit -m "chore: merge task {ID} into feature/issue-{N}"
```

**On conflict with test setup files** (e.g. `vitest.setup.ts`) — inspect both versions and keep the most complete:

```bash
git diff apps/{app}/vitest.setup.ts  # inspect conflict markers
# Manually resolve, then:
git add apps/{app}/vitest.setup.ts
git commit -m "chore: merge task {ID} into feature/issue-{N}"
```

**Abort if needed:**

```bash
git merge --abort
git reset --hard origin/feature/issue-{N}
```

---

## Step 6 — Fix the manifest

After all merges, correct any status inconsistencies.

**Reset phantom `in_progress` tasks to `pending`:**

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
git commit -m "fix: correct manifest status after manual merge recovery"
```

---

## Step 7 — Push

```bash
git push origin feature/issue-{N}
```

---

## Step 8 — Clean up stale branches and PRs

Close and unlabel PRs of tasks now merged:

```bash
for pr in {PR_NUMBERS}; do
  gh pr edit $pr --repo {owner}/{repo} --remove-label "merge error"
  gh pr close $pr --repo {owner}/{repo}
done
```

Delete stale branches:

```bash
for id in {TASK_IDS}; do
  gh api repos/{owner}/{repo}/git/refs/heads/task/issue-{N}-$id -X DELETE
done
```

---

## Step 9 — Resume the pipeline

Trigger **Workflow Gather** from the GitHub Actions UI or CLI:

```bash
gh workflow run on-gather.yml \
  --repo {owner}/{repo} \
  --field task_branch=task/issue-{N}-{ANY_DONE_TASK} \
  --field branch_base=feature/issue-{N}
```

Use any task already marked `done` — `orchestrate.mjs` detects idempotence, skips the merge, reads the manifest, identifies ready tasks, and dispatches them automatically.

> **Important:** if `orchestrate.mjs` exits on idempotence without dispatching (no ready tasks found), verify the manifest `depends_on` chains — all blockers of the pending tasks must be `done`.

---

## What not to do

- **Never ask an agent to execute the recovery** — agents cannot run git commands on the remote. They will simulate the execution and produce a false success report, corrupting the manifest.
- **Never push directly on `feature/issue-N`** — this triggers `agent-execute` with an incoherent context (3 retries, spurious `blocked` label). The guard in `agent-execute.yml` (PR #784) now rejects non-`task/*` branches.
- **Never trust an agent's "done" report without verifying** — always confirm with `gh api compare` that the branch is actually merged (ahead: 0 or branch deleted).

---

## Known issues and fixes

| Symptom | Cause | Fix |
|---|---|---|
| Pipeline stalls after idempotence — no FAN-OUT | Ready tasks not detected after idempotence exit | Verify manifest: all `depends_on` of pending tasks must be `done` |
| `agent-execute` triggered after manual push on `feature/*` | Agent pushed on feature branch, not task branch | Guard in `agent-execute.yml` rejects invalid branches (PR #784) |
| Manifest says `done` but branch still open | Agent updated manifest text without running git | Verify with `compare` API — merge manually and close PR |
| Build artifacts in repo (`dist/`, `test-results/`) | Incomplete `.gitignore` + `git add -A` | Remove with `git rm`, complete `.gitignore` (issue #785) |
| Duplicate config files (`vite.config.js`, `vite.config.d.ts`) | TypeScript compiled config files committed | Remove with `git rm`, add to `.gitignore` |

---

## Canonical example

Issue #766 — monjournal implementation (May 2026)

- 5 tasks in `merge-failed` (E, I, J, O, S) — all conflicting on `package.json`, `package-lock.json`, `vite.config.ts`
- Tasks J and O committed `dist/` artifacts
- Task I was never actually merged despite being marked `done` by an agent
- Tasks F and K were marked `in_progress` with empty branches (never executed)
- Recovery: artifacts removed, task I merged manually, manifest corrected, pipeline resumed via Workflow Gather
