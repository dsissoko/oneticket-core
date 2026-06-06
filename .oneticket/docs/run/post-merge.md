---
weight: 2
title: "Post-Merge Cleanup"
---

# Post-Merge Cleanup — After a Feature PR Merges

## General principle

After a `feature/issue-N` PR is merged into `main`, the pipeline leaves residual artifacts — task branches, labels, and the task directory — that must be cleaned up before starting a new ticket. Most of this is handled automatically by `cleanup_on_success`, but some steps require manual action, especially after a merge-conflict recovery.

---

## When to use this runbook

- A `feature/issue-N` PR has just been merged into `main`
- Before starting a new ticket on the same repo
- After a merge-conflict recovery (follow-up to [Merge Conflict Recovery](./merge-recovery.md))

---

## Step 1 — Verify the manifest

Confirm all tasks are `done` before declaring the issue complete.

```bash
gh api "repos/{owner}/{repo}/contents/.oneticket/tasks/issue-{N}/manifest.json?ref=main" \
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

Expected output: only `done` tasks. Any `pending`, `in_progress`, or `merge-failed` task means the pipeline did not complete cleanly — investigate before continuing.

> If `cleanup_on_success: true` already deleted the directory, skip to Step 2.

---

## Step 2 — Verify cleanup_on_success

If `cleanup_on_success: true` in `.oneticket/config.yml`, the orchestrator deletes `.oneticket/tasks/issue-N/` automatically on `allDone`. Confirm it is gone:

```bash
gh api "repos/{owner}/{repo}/contents/.oneticket/tasks/issue-{N}?ref=main" 2>&1 | grep -q '404' && echo "cleaned" || echo "still present"
```

If still present (e.g. `cleanup_on_success: false` or pipeline interrupted), delete manually:

```bash
git fetch origin
git checkout main
git pull origin main
git rm -r .oneticket/tasks/issue-{N}/
git commit -m "chore: remove task directory issue-{N} — post-merge cleanup"
git push origin main
```

---

## Step 3 — Delete residual task branches

Task branches (`task/issue-N-*`) should have been deleted by the pipeline on successful merge. Check and clean up any remaining ones:

```bash
gh api "repos/{owner}/{repo}/git/matching-refs/heads/task/issue-{N}-" \
  --jq '.[].ref' | sed 's|refs/heads/||'
```

Delete each remaining branch:

```bash
for branch in $(gh api "repos/{owner}/{repo}/git/matching-refs/heads/task/issue-{N}-" --jq '.[].ref | ltrimstr("refs/heads/")'); do
  gh api "repos/{owner}/{repo}/git/refs/heads/$branch" -X DELETE
  echo "deleted $branch"
done
```

---

## Step 4 — Delete the feature branch

```bash
# Remote
git push origin --delete feature/issue-{N}

# Local (if checked out)
git branch -d feature/issue-{N}
```

If the branch was already deleted by GitHub on merge (auto-delete enabled), the remote delete will fail silently — that is expected.

---

## Step 5 — Verify issue labels and state

The issue should be closed with no active pipeline labels:

```bash
gh issue view {N} --repo {owner}/{repo} --json state,labels --jq '{state,labels:[.labels[].name]}'
```

Expected: `state: CLOSED`, labels list contains no `merge error`, `dev error`, `in progress`, or `ready for review`.

Remove any orphaned labels:

```bash
gh issue edit {N} --repo {owner}/{repo} --remove-label "merge error"
gh issue edit {N} --repo {owner}/{repo} --remove-label "dev error"
gh issue edit {N} --repo {owner}/{repo} --remove-label "in progress"
gh issue edit {N} --repo {owner}/{repo} --remove-label "ready for review"
```

---

## Step 6 — Sync local

```bash
git fetch --prune
git pull origin main
```

`--prune` removes any stale remote-tracking refs that were not cleaned up in Steps 3–4.

---

## What not to do

- **Never merge if the issue still has `dev error` or `merge error`** — the pipeline is in an inconsistent state. Resolve the error first, or the next ticket may inherit a broken manifest.
- **Never delete `feature/issue-N` before the PR is merged** — all task branches target this branch; deleting it loses the aggregated work.
- **Never skip Step 1** — merging with `pending` tasks in the manifest means the pipeline considers the issue unfinished and may re-dispatch tasks on the next trigger.

---

## Known issues

| Symptom | Cause | Fix |
|---|---|---|
| `.oneticket/tasks/issue-N/` still on `main` after merge | `cleanup_on_success: false` or pipeline interrupted before `allDone` | Delete manually — Step 2 |
| `task/issue-N-*` branches still present | Merge-conflict recovery deleted task branches before pipeline could clean them | Delete via `gh api DELETE` — Step 3 |
| Label `in progress` still on closed issue | Pipeline interrupted before label removal | Remove manually — Step 5 |
| `git push origin --delete feature/issue-N` fails with "remote ref does not exist" | GitHub auto-deleted the branch on merge | Expected — ignore |
| Local branch `feature/issue-N` shows `[gone]` in `git branch -vv` | Remote deleted, local not pruned | `git branch -d feature/issue-{N}` |

---

## Canonical example

No recorded example yet — add one when this runbook is first applied in the field.
