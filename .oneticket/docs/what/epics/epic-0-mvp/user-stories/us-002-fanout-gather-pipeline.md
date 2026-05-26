# US-002 — Task Decomposition and FAN-OUT/GATHER Pipeline

## Story

As a developer,
I want to invoke `@po` on a GitHub issue with a work request,
so that the agent decomposes it into parallel tasks, executes them autonomously, and delivers a pull request.

## Status

✅ Done — delivered in `v0.1.0`

## Expected Behavior

- Commenting `@po <request>` triggers the dispatch pipeline
- `@po` loads `oneticket-manifest-generation` skill and produces `manifest.json` — a valid JSON DAG
- `launch-fanout.mjs` detects the manifest and bootstraps FAN-OUT
- `agent-launcher.mjs` dispatches one `agent-execute.yml` per ready task in parallel
- Each worker produces one file, commits on `task/issue-N-X`, triggers GATHER
- `orchestrate.mjs` merges each completed branch into `feature/issue-N`, resolves dependencies, dispatches newly ready tasks
- When all tasks are `done`, a PR `feature/issue-N → main` is created automatically

## Acceptance Criteria

**Given** a GitHub issue with a decomposable work request,
**When** a developer comments `@po decompose this request`,
**Then** a valid `manifest.json` is committed on `feature/issue-N` with correct DAG structure (no cycles, all `depends_on` ids exist).

**Given** a valid manifest with tasks A, B (parallel) and C (depends on A+B),
**When** FAN-OUT is triggered,
**Then** A and B are dispatched simultaneously and C is dispatched only after both A and B are `done`.

**Given** all tasks are completed,
**When** GATHER processes the last task,
**Then** a PR `feature/issue-N → main` is created with all task files present.

**Given** two simultaneous pipelines on issues N and M,
**When** both run in parallel,
**Then** branches, manifests, and PRs for N and M never cross.

## Related Slices

- [Slice 1 — From GitHub comment to agent prompt](../../../how/slices/slice-1-dispatch.md)
- [Slice 2 — From manifest to parallel task execution](../../../how/slices/slice-2-fanout.md)
- [Slice 3 — From completed task to final PR](../../../how/slices/slice-3-gather.md)
