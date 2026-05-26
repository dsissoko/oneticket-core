---
name: oneticket-init-knowledge
description: Initialize and validate the mandatory knowledge base before any documentation or development cycle. Enforces sequential human-gated validation of product-spec.md, architecture.md, and epic-0-mvp.
compatibility: opencode
---

# oneticket-init-knowledge

Initialize and validate the complete product knowledge base before any documentation, architecture, or development work can begin.

This skill is the **guardian of the mandatory sequence**. No slice, no C4 diagram, no epic breakdown can happen without these artifacts being valid.

`docs_path` is always provided in the prompt — never resolve it yourself.

---

## Mandatory Artifacts

| Artifact | Path | Required before |
|---|---|---|
| Product specification | `<docs_path>/what/product-spec.md` | Everything |
| Architecture | `<docs_path>/how/architecture.md` | Slices, C4, implementation |
| Epic MVP | `<docs_path>/what/epics/epic-0-mvp/epic.md` | Any development cycle |
| MVP User Stories | `<docs_path>/what/epics/epic-0-mvp/user-stories/` | Any development cycle |

---

## Gate Sequence

**This sequence is strict and cannot be skipped or reordered.**
Each gate ends with a HARD STOP — the agent posts a comment and waits for explicit human validation before proceeding to the next gate.

```
Gate 0 → framework or applicatif ?  → HARD STOP if applicatif (human sets current_project)
Gate 1 → product-spec.md valid ?    → HARD STOP → human validates
Gate 2 → architecture.md valid ?    → HARD STOP → human validates
Gate 3 → epic-0-mvp valid ?         → HARD STOP → human validates
Gate 4 → confirmation + handoff
```

---

## Gate 0 — Framework or Application Project ?

### Analysis

Read `## Project context` from the prompt — it is always present and deterministically resolved.

```
## Project context
docs_path: <resolved path>
project: <oneticket (framework)> or <name (application project)>
```

- If `project` contains `(framework)` → framework context — continue to Gate 1 without stopping
- If `project` contains `(application project)` → application context — see below

**No inference needed — the answer is in the prompt.**

### If framework context

`docs_path` already points to `.oneticket/docs/` — continue to Gate 1 without stopping.

### If application context

Post this exact comment:

```
This request concerns an application project, not the OneTicket framework.

To proceed, please set `current_project` in `.oneticket/config.yml`:

current_project: <your-project-name>   # e.g. breakout, my-app, ecommerce

Once done, reply to this comment to continue.
```

**HARD STOP** — do not proceed until the human explicitly confirms that `current_project` has been set.

**Important rules:**
- Never modify `config.yml` yourself — this is the human's responsibility
- Once the human confirms → continue to Gate 1
- `docs_path` will have been updated by the framework before the next agent invocation

---

## Gate 1 — Product Specification

### Check

Read `<docs_path>/what/product-spec.md`.

**Valid if ALL of these sections are present and non-empty:**
- `## 1. Vision` — concrete problem statement, real users
- `## 7. Product Capabilities` — at least one capability defined

**Invalid if:**
- File does not exist
- File exists but sections are empty or contain only placeholder text

### If invalid — Bootstrap Questions

Post this exact question set in one comment:

```
Before proceeding, I need to understand the product.

1. What is the product name?
2. What problem does it solve, and for whom? (2-3 sentences)
3. What are the 2-3 main capabilities for V1?
4. Who are the main users or actors?
5. Any business rules or constraints to note from the start?
```

Wait for human answer. Do not proceed to Gate 2 until this gate is explicitly validated.

### If valid or once answers received

Create or complete `<docs_path>/what/product-spec.md` using template `.oneticket/templates/product-spec.md`.
Never copy placeholder text — only real content from human answers.
Never overwrite existing valid content.

Post a summary of what was created/updated and ask:
> "Gate 1 complete — product-spec.md is valid. Reply to proceed to architecture."

**HARD STOP.**

---

## Gate 2 — Architecture

### Check

Read `<docs_path>/how/architecture.md`.

**Valid if ALL of these sections are present and non-empty:**
- `## 1. Architecture Principles` — at least one principle defined
- `## 5. Key Components` — at least one component defined

**Invalid if:**
- File does not exist
- File exists but sections are empty or contain only placeholder text

### If invalid — Bootstrap Questions

Post this exact question set in one comment:

```
Before proceeding, I need to understand the technical architecture.

1. What is the technical stack? (languages, frameworks, persistence layer)
2. What are the main system components?
3. What are the key interfaces or integration points?
4. Any technical constraints or non-functional requirements?
```

Wait for human answer. Do not proceed to Gate 3 until this gate is explicitly validated.

### If valid or once answers received

Create or complete `<docs_path>/how/architecture.md` using template `.oneticket/templates/architecture.md`.
Never copy placeholder text — only real content from human answers.
Never overwrite existing valid content.

Post a summary of what was created/updated and ask:
> "Gate 2 complete — architecture.md is valid. Reply to proceed to epic MVP."

**HARD STOP.**

---

## Gate 3 — Epic MVP

### Check

Verify:
- `<docs_path>/what/epics/epic-0-mvp/epic.md` exists and `## Goal` is non-empty
- `<docs_path>/what/epics/epic-0-mvp/user-stories/` contains at least one `us-001-*.md`

**Invalid if:**
- Directory does not exist
- `epic.md` is missing or empty
- No user stories exist

### If invalid — Bootstrap Questions

Read `<docs_path>/what/product-spec.md` first to extract MVP scope.

Post this question set in one comment:

```
Before proceeding, I need to define the MVP epic.

Based on product-spec.md, here is my proposed MVP scope:
<propose 2-3 sentences from product-spec.md ## 7. Product Capabilities>

1. Does this MVP scope look correct?
2. What are the 2-3 most important user stories for this MVP?
   (Format: "As a <user>, I want to <action>, so that <outcome>")
```

Wait for human answer. Do not proceed to Gate 4 until this gate is explicitly validated.

### If valid or once answers received

Create `<docs_path>/what/epics/epic-0-mvp/epic.md` using template `.oneticket/templates/epic.md`.
Create user stories using template `.oneticket/templates/us.md` and skill `oneticket-user-story`.
File naming: `us-001-<kebab-name>.md`, `us-002-<kebab-name>.md`, etc.
Never overwrite existing valid content.

Post a summary of what was created and ask:
> "Gate 3 complete — epic-0-mvp is valid. Reply to proceed."

**HARD STOP.**

---

## Gate 4 — Confirmation and Handoff

Post a final summary:

```
Knowledge base is complete and valid.

✅ what/product-spec.md
✅ how/architecture.md
✅ what/epics/epic-0-mvp/ (<N> user stories)

Next steps:
- To break down more epics → oneticket-epic-breakdown
- To document architecture → oneticket-c4
- To derive implementation slices → oneticket-vertical-slice
```

---

## Rules

- Never overwrite a valid file — always check before writing
- Never invent product or technical content — only what the human explicitly provided
- Never skip a gate — the sequence is mandatory
- Never proceed after a HARD STOP without explicit human validation
- Never modify `config.yml` — only the human can set `current_project`
- `docs_path` is always provided in the prompt — never resolve it yourself
- Mark open questions explicitly rather than leaving them blank
