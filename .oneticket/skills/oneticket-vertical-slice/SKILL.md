---
name: oneticket-vertical-slice
description: Derive and document vertical implementation slices from epics, user stories and architecture. Writes to how/slices/ in the project docs_path.
compatibility: opencode
---

# Vertical Slice

Derive and document vertical implementation slices from the product and architecture knowledge available in `docs_path`.

A slice covers one end-to-end feature from user input to observable output, crossing all technical layers involved. A slice is never a technical layer alone. For a frontend project, a slice could be "ball physics and wall collision" — covering physics engine, collision detection, canvas rendering and game loop for that specific behavior.

The set of slices you produce must cover all user stories of the epic — every US must appear in at least one slice.

## What is a Slice

A vertical slice is a small, testable, end-to-end implementation unit that:
- Crosses all technical layers (frontend, backend, API, data, etc.)
- Delivers observable value independently
- Maps to one or more user stories
- Is sized to be close to a PR in scope

A slice is NOT:
- A horizontal technical layer ("build the API", "build the UI")
- A task decomposition
- A copy of a user story

## When to Use This Skill

Use this skill when:
- Epics and user stories are defined in `what/epics/`
- Architecture is defined in `how/architecture.md`
- You need to plan the implementation incrementally

## Output Location

Write slices to `<docs_path>/how/slices/slice-N-<name>/slice.md`.

Use the template at `.oneticket/templates/slice.md`.

`docs_path` is always provided in the prompt — never resolve it yourself.

## Naming Convention

- Directory: `slice-N-<kebab-name>` — zero-padded number + kebab-case name
- Examples: `slice-1-user-login`, `slice-2-dashboard`, `slice-3-export`

## Mandatory Sequence

Slices can only be derived after the following artifacts exist and are complete.
**This sequence is strict — do not skip or reorder steps.**

```
1. Epics        what/epics/epic-N-<name>/epic.md          ← functional scope
2. User Stories what/epics/epic-N-<name>/user-stories/    ← expected behaviors
3. Architecture how/architecture.md                        ← technical boundaries
4. C4 diagrams  how/c4/                                    ← component map (if available)
        ↓
5. Slices       how/slices/slice-N-<name>/slice.md         ← implementation units
```

If epics or user stories are missing → stop, create them first using `oneticket-user-story`.
If architecture is missing → stop, create it first using `oneticket-c4`.
Only once all prerequisites are present → proceed to derive slices.

## Process

### Step 1 — Read epics and user stories

Read ALL files under `<docs_path>/what/epics/` :
- Each `epic.md` — business scope and goals
- Each `user-stories/us-NNN-<name>.md` — expected behaviors and acceptance criteria

Do not proceed until every epic and user story has been read.

### Step 2 — Read architecture

Read `<docs_path>/how/architecture.md` — technical components, boundaries, interfaces.
Read `<docs_path>/how/c4/` — C4 diagrams if available.

Do not derive slices before understanding the technical boundaries.

### Step 3 — Identify slice boundaries

For each user story or group of related user stories:
1. Identify which technical components are involved (from architecture)
2. Determine the end-to-end flow (from API to data to UI)
3. Define the smallest deliverable increment that is testable

### Step 4 — Write the slice

Use the template at `.oneticket/templates/slice.md`.

## Sizing Guidelines

A well-sized slice:
- Can be implemented in 1-5 days
- Has clear acceptance criteria derived from its user stories
- Can be tested end-to-end independently
- Corresponds roughly to a PR

If a slice feels too large — split it using the `oneticket-user-story-splitting` skill logic applied at the implementation level.

## Rules

- Never overwrite an existing slice — check before writing
- Never create a slice without reading the architecture first
- `docs_path` is always provided in the prompt — never resolve it yourself
- Slices derive from what/epics/ — never invent content not backed by a user story
- Every user story must be referenced in at least one slice
- A slice can cover multiple related user stories — some slices are transversal
- A slice without any related user story is invalid
- H1 must be descriptive: `# Slice N — <name>` — never use generic `# Slice`
