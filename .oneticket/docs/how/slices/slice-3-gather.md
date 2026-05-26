# Slice 3 — From Completed Task to Final PR

## Goal

Merge each completed task branch into the feature branch, resolve DAG dependencies, dispatch newly ready tasks, and create the final PR when all tasks are done.

## Status

✅ Done — delivered in `v0.1.0`

## Related Epics

- [Epic 0 — GitHub-Native Agent Pipeline](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Task decomposition and FAN-OUT/GATHER pipeline](../../what/epics/epic-0-mvp/user-stories/us-002-fanout-gather-pipeline.md)

## Impacted Components

- `src/orchestrate.mjs` — GATHER logic
- `src/dispatch-gather.mjs` — triggers on-gather.yml
- `src/agent-launcher.mjs` — re-triggered for newly ready tasks
- `src/utils.mjs` — `mergeTaskBranch()`, `writeManifest()`, `areDependenciesSatisfied()`
- `.github/workflows/on-gather.yml` — GATHER trigger
- `.github/workflows/agent-execute.yml` — push + dispatch-gather steps

## Interfaces

**on-gather.yml inputs:**
```
TASK_BRANCH   — task/issue-N-X (completed task branch)
BRANCH_BASE   — feature/issue-N (target branch)
```

**GitHub PR created when all tasks done:**
```
head:  feature/issue-N
base:  main (from config.yml pr_base)
title: feat: complete all tasks for issue #N
```

## Sequence Flow

```
agent-execute.yml (worker job)
    ├── Push task/issue-N-X
    └── dispatch-gather.mjs
            └── dispatches on-gather.yml (workflow_dispatch)
                    │
                    ▼
            on-gather.yml
                    └── orchestrate.mjs
                            ├── git merge task/issue-N-X → feature/issue-N
                            ├── git push feature/issue-N
                            ├── manifest: mark task X → done
                            ├── commit + push manifest
                            │
                            ├── [ROUTE A] pending tasks with satisfied deps?
                            │       └── agent-launcher.mjs → new FAN-OUT
                            │
                            ├── [ROUTE B] all tasks done?
                            │       └── gh pr create feature/issue-N → main
                            │
                            └── [ROUTE C] tasks still in_progress, none newly ready
                                    └── wait for next GATHER signal
```

## Data Changes

- `manifest.json` task status: `in_progress` → `done` (committed by orchestrate)
- `feature/issue-N` branch updated with merged task file
- Final PR created: `feature/issue-N → main`
- Task branch `task/issue-N-X` closed (PR closed by orchestrate after merge)

## Observability Impact

- Each GATHER run is a visible GitHub Actions workflow run
- Manifest final state (`all done`) is committed and auditable in git
- Final PR is the human-visible deliverable — contains all task files + manifest + workflow.md
- Failed merges (non-fast-forward) are retried up to `orchestrate_retry_max` with exponential backoff
