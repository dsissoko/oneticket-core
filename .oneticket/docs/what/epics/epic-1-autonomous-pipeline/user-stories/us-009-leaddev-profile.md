# US-009 — @leaddev Profile — Implementation Decomposition

## Story

As a team using OneTicket, I want a `@leaddev` agent that reads the knowledge base and decomposes the implementation work into manifest tasks delegated to `@dev`, so that implementation is planned and executed without human orchestration.

## Expected Behavior

### @leaddev identity

- `@leaddev` is the technical lead responsible for implementation planning
- It reads `docs_path` — architecture, C4, sprints, US — as its primary context
- It decomposes implementation into a manifest, delegating tasks to `@dev`
- It does NOT implement code directly — it plans and orchestrates
- It does NOT delegate to `@architect` or `@qa` — only to `@dev`

### @leaddev workflow

1. Read the active sprint under `docs_path/how/sprints/` — selected user stories + Technical Notes
2. Read `docs_path/how/architecture.md` — technical boundaries and components
3. Read all US under `docs_path/what/epics/` — acceptance criteria
4. Decompose into a manifest with one task per user story in the sprint (or sub-tasks if a US is complex)
5. Each task `role: dev` — delegate to `@dev`
6. Dependencies between tasks follow user story dependencies
7. Commit the manifest with `feat: decompose issue #N`

### Difference with @po

| | `@po` | `@leaddev` |
|---|---|---|
| Domain | Product — epics, US, sprints, doc | Technical — implementation planning |
| Delegates to | `analyst`, `architect` | `dev` only |
| Reads | Issue body, product-spec | docs_path/how/sprints/ + architecture |
| Produces | Doc manifest | Implementation manifest |

### Difference with @dev

| | `@leaddev` | `@dev` |
|---|---|---|
| Role | Plans and decomposes | Executes a single task |
| Produces | Manifest | Code file(s) |
| Scope | Full sprint implementation | One user story or sub-task |

## Acceptance Criteria

**Given** a new implementation issue with `@leaddev` invoked,
**When** `@leaddev` runs,
**Then** it reads the active sprint from `docs_path/how/sprints/` and produces a manifest with `role: dev` tasks.

**Given** a manifest produced by `@leaddev`,
**When** the FAN-OUT pipeline runs,
**Then** each task is dispatched to `@dev` with the full dev profile and the sprint content as instruction.

**Given** `@leaddev` invoked without a sprint in `docs_path/how/sprints/`,
**When** `@leaddev` runs,
**Then** it posts a comment indicating the sprint is missing and asks `@po` to create it first.

## Key Files

- `.oneticket/agents/leaddev.agent.md`
- `src/agent-dispatch.mjs` — profile loading
- `src/agent-launcher.mjs` — role dispatch
