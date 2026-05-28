# Epic 0 — GitHub-Native Agent Pipeline

## Goal

Deliver a fully operational GitHub-native multi-agent pipeline where a developer can invoke an agent by commenting `@role` on a GitHub issue, have the agent decompose the request into parallel tasks, execute them autonomously, and receive a pull request — with zero manual orchestration.

## Business Value

Eliminates manual task decomposition, branch management, and PR creation. A single comment triggers a fully autonomous pipeline that delivers a reviewable change, mimicking agile team best practices with one branch per subtask and progressive merging.

## Scope

- Agent invocation via `@role` comment on GitHub issues, PR comments, and inline review comments
- Deterministic prompt construction with resolved project context (`docs_path`, `app_path`)
- Gate 0 — `current_project` validation before any agent dispatch
- `@po` agent — direct response and manifest-based decomposition
- FAN-OUT — parallel task dispatch to worker agents
- GATHER — sequential branch merge, DAG resolution, final PR creation
- Retry mechanism on agent failure
- Framework skills (`oneticket-manifest-generation`, `oneticket-init-knowledge`, and 8 others)
- Documentation structure initialization (`init-doc.mjs`)
- Runtime skill installation (`oneticket-install.mjs`)
- `current_project` as global context switch — `docs_path` and `app_path` resolved deterministically

## Status

✅ Done — delivered in `v0.1.0`

## Related User Stories

- [US-001 — Direct agent response](user-stories/us-001-direct-agent-response.md)
- [US-002 — Task decomposition and FAN-OUT/GATHER pipeline](user-stories/us-002-fanout-gather-pipeline.md)
- [US-003 — Multi-trigger support](user-stories/us-003-multi-trigger.md)
- [US-004 — Project context isolation](user-stories/us-004-project-context.md)
- [US-005 — Agent profile and skill extension](user-stories/us-005-agent-profile-skills.md)
- [US-006 — Issue lifecycle labels](user-stories/us-006-issue-lifecycle-labels.md)

## Related Slices

- [Slice 1 — From GitHub comment to agent prompt](../../how/slices/slice-1-dispatch.md)
- [Slice 2 — From manifest to parallel task execution](../../how/slices/slice-2-fanout.md)
- [Slice 3 — From completed task to final PR](../../how/slices/slice-3-gather.md)
