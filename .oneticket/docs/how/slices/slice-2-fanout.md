# Slice 2 — From Manifest to Parallel Task Execution

## Goal

Execute all tasks in a manifest JSON DAG in parallel where possible, respecting declared dependencies, with each task producing one file on its own branch.

## Status

✅ Done — delivered in `v0.1.0`

## Related Epics

- [Epic 0 — GitHub-Native Agent Pipeline](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Task decomposition and FAN-OUT/GATHER pipeline](../../what/epics/epic-0-mvp/user-stories/us-002-fanout-gather-pipeline.md)

## Impacted Components

- `src/launch-fanout.mjs` — FAN-OUT bootstrap
- `src/agent-launcher.mjs` — FAN-OUT executor
- `src/utils.mjs` — `areDependenciesSatisfied()`, `readManifest()`, `writeManifest()`
- `.github/workflows/agent-execute.yml` — worker execution
- `.oneticket/tasks/issue-N/manifest.json` — DAG state

## Interfaces

**manifest.json contract:**
```json
{
  "issue": 42,
  "branch_base": "feature/issue-42",
  "tasks": [
    {
      "id": "A",
      "branch": "task/issue-42-A",
      "file": "apps/myapp/app/src/components/Login.vue",
      "content": "Full autosufficient instruction for the worker agent",
      "depends_on": [],
      "status": "pending"
    }
  ]
}
```

**Task status transitions:** `pending` → `in_progress` → `done`

## Sequence Flow

```
agent-execute.yml (PO job)
    └── agent commits manifest.json on feature/issue-N
            │
            ▼
    [DETERMINISTIC] Launch FAN-OUT if manifest present
            │
            ▼
launch-fanout.mjs
    ├── reads manifest.json
    ├── finds tasks with status=pending
    └── calls launchReadyTasks()
            │
            ▼
agent-launcher.mjs — launchReadyTasks()
    ├── for each task: areDependenciesSatisfied(task, manifest)
    ├── marks ready tasks → in_progress
    ├── commits + pushes manifest (optimistic git lock, retry up to orchestrate_retry_max)
    └── dispatches one agent-execute.yml per ready task (parallel)
            │
            ▼ (N parallel runners)
agent-execute.yml (worker job, branch_base = feature/issue-N)
    ├── Checkout branch_base
    ├── Create task/issue-N-X branch
    ├── Clear opencode session cache
    ├── Install OneTicket skills
    ├── Run agent with task content as prompt
    │       └── agent produces one file + commits
    ├── Push task/issue-N-X
    ├── Open PR task/issue-N-X → feature/issue-N (completion signal)
    └── Trigger GATHER via dispatch-gather.mjs
```

## Data Changes

- `manifest.json` task status: `pending` → `in_progress` (committed by agent-launcher)
- One new file per task (committed by worker agent on `task/issue-N-X`)
- One task PR opened per completed task (cosmetic signal for GATHER)

## Observability Impact

- Manifest state transitions are committed in git — traceable via `git log`
- Each worker run is a visible GitHub Actions run with full logs
- Retry on worker failure posts a comment on the issue after `retry_max` attempts
