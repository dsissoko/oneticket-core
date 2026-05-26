# US-004 — Project Context Isolation

## Story

As a tech lead,
I want to set `current_project` in `config.yml` and have all agents work in an isolated project context,
so that documentation and source code paths are consistent and projects do not interfere with each other.

## Status

✅ Done — delivered in `v0.1.0`

## Expected Behavior

- `current_project` in `.oneticket/config.yml` drives all path resolution
- Three states:
  - Absent → config error, agent notified, pipeline stops
  - Empty → framework context: `docs_path = .oneticket/docs`, no `app_path`
  - Set (`myapp`) → application context: `docs_path = apps/myapp/docs`, `app_path = apps/myapp/app`
- `docs_path` and `app_path` are injected in `## Project context` of every agent prompt
- Agents never compute these paths — they read them directly from the prompt
- Gate 0 in `agent-dispatch.mjs` enforces this before any branch is created

## Acceptance Criteria

**Given** `current_project` is absent from `config.yml`,
**When** an agent is invoked,
**Then** the pipeline stops, a configuration error comment is posted on the issue, no branch is created.

**Given** `current_project` is empty in `config.yml`,
**When** an agent is invoked,
**Then** Gate 0 posts a guidance comment and stops — no branch, no agent dispatch.

**Given** `current_project: breakout` in `config.yml`,
**When** an agent is invoked,
**Then** the prompt contains `docs_path: apps/breakout/docs` and `app_path: apps/breakout/app`.

**Given** two projects `breakout` and `myapp` have been initialized,
**When** `current_project` is switched from `breakout` to `myapp`,
**Then** `apps/breakout/docs/` and `apps/breakout/app/` are preserved and unmodified.

## Related Slices

- [Slice 1 — From GitHub comment to agent prompt](../../../how/slices/slice-1-dispatch.md)
