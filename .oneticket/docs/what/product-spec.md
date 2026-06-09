# OneTicket Product Specification

| Field     | Value                                                                                                                                               |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Version   | 1.0.0                                                                                                                                               |
| Status    | ☑ draft  ☐ review  ☐ stable                                                                                                                         |
| Author    | @dsissoko                                                                                                                                           |
| Date      | 2026-06-03                                                                                                                                          |
| Changelog | 1.0.0 — target architecture spec for pipeline v2 — describes is_fanout_task, dispatch-fanout.mjs, on-fanout.yml, branch_base removal, create-direct-pr.mjs removal |

---

## 1. Vision

OneTicket — build apps with agents, right from your GitHub issues.

OneTicket is a GitHub-native framework that lets a team and its agents build software together — from product intent to working application. Comment on a GitHub issue, your agents decompose, implement, and deliver.

Five macro-capabilities define the product:

**1. App delivery** — Agents produce working applications delivered in `apps/<current_project>/app/`. Multi-app by design: each project lives in its own `apps/<project>/` folder with co-located documentation in `apps/<project>/docs/`. Until V1: frontend apps only, deployed to GitHub Pages. `appshell` is the reference React+Vite template — every new frontend app bootstraps from it. `breakout` is the first delivered app, built on AppShell.

**2. Task orchestration** — Certain agent roles decompose a request into a DAG of tasks and delegate to specialized agents. Results are gathered, dependencies resolved, and the feature branch is ready for review.

**3. Autonomous mode** — Agents operate within a declared workflow: each role knows where to route a request and what to hand off. Routing and handoff rules make agent-to-agent chaining explicit and controllable, in both interactive and autonomous modes.

**4. Documentation generation** — OneTicket covers the full software product lifecycle through structured documentation: product specification, architecture, epics, user stories, implementation sprints, ADRs, C4 diagrams, CI/CD, and operations. Documentation is the source of truth that agents read before acting.

**5. Skill and agent management** — Agent profiles and skills are the distributable unit of the product. Integration with APM (Microsoft Agent Package Manager) is planned to enable versioned skill distribution and agent identity management.

The core principle: orchestration logic lives in deterministic code. LLMs only generate content — they never make control flow decisions.

---

## 2. Users and Actors

| Persona | Description | Main need |
|---|---|---|
| **Tech lead / User** | Initializes the project, invokes agents, validates PRs | A workflow that is quickly usable, understandable, and controllable |
| **Entrepreneur** | Arrives with an idea, describes the project in natural language, never sees YAML | A working agent team from a single GitHub issue comment |
| **OneTicket editor** | Maintains profiles and skills, monitors usage, evolves the catalog | A reliable skill catalog and a robust agent team |
| **Agent @po** | Maintains product knowledge, epics, user stories | Find business context and produce actionable specs |
| **Agent @architect** | Maintains architecture knowledge and C4 diagrams | Structure technical decisions and their consequences |
| **Agent @dev** | Implements validated user stories | Work from explicit specs and decisions |
| **Agent @qa** | Reviews code, specs, and PRs | Verify quality before merge |
| **Agent @analyst** | Business analysis and domain modeling | Clarify the domain before product slicing |
| **Agent @help** | Onboarding, FAQ, framework guidance | Help the user operate OneTicket |

`@po`, `@architect`, and `@dev` form the core of the `v0.1.0` baseline.
The `@qa`, `@analyst`, and `@help` roles belong to the V1 trajectory.

---

## 3. Problems to Solve

- Agent invocations are prompt-based and stateless — no shared context, no role boundaries, no coordination between agents
- Task decomposition is manual — developers break down work themselves, assign it, track it
- There is no standard way to declare routing and handoff rules between agents
- Documentation is produced ad hoc — not structured, not reusable, not readable by agents
- Agent CLIs are not interchangeable — switching tools requires rewriting workflows
- Agent identity is fragile — no reliable way to distinguish agent responses from human responses
- Skills are scattered and unversioned — no standard format, no distribution mechanism, no catalog

---

## 4. Product Goals

- Provide a deterministic orchestration layer — zero LLM in pipeline control flow
- Provide basic patterns for agentic orchestration and communication
- Make documentation the source of truth — structured, agent-readable, covering the full product lifecycle
- Decouple agent profiles and skills from the agent CLI — configuration-driven, CLI-agnostic
- Distribute versioned skills and agent profiles via APM (Microsoft Agent Package Manager)
- Provide a GitHub-native runtime with zero infrastructure overhead for V1

---

## 5. Out of Scope

- Cloud runtime and persistent agent sandboxes (V2)
- Graphical UI for agent orchestration
- Deployment targets other than GitHub Pages — Vercel, Netlify, Cloudflare Pages are supported via workflow swap, not built-in
- Application backend for the GitHub App (V1 medium term)
- Full-stack application generation (backend, database, infrastructure) — current skills cover frontend generation only; full-stack coverage is a V1 skill roadmap item
- Multi-repository orchestration
- Agent billing and quota management (V2)

---

## 6. Business Concepts

| Concept | Definition |
|---|---|
| **Issue** | The unit of work — every agent invocation starts from a GitHub issue |
| **Manifest** | A JSON file describing a DAG of tasks with dependencies — produced by decomposer agents, consumed by the pipeline |
| **FAN-OUT** | Parallel dispatch of ready tasks to specialized worker agents |
| **GATHER** | Sequential merge of completed task branches into the feature branch, with dependency resolution and next-task routing |
| **FAN-IN** | Aggregation of parallel results into a single synthesized output — not yet implemented |
| **Agent profile** | A markdown file (`.agent.md`) declaring a role's identity, responsibilities, and skill loading rules |
| **Skill** | An instruction set encoding domain knowledge — loaded by agents at runtime to guide their behavior |
| **Role** | A named agent identity invokable via `@role` comment on a GitHub issue |
| **Routing** | The rule declaring which role handles which type of request |
| **Handoff** | The explicit transmission of context and intent from one agent to the next |
| **current_project** | The active project name in `config.yml` — drives path resolution for documentation and source code |
| **docs_path** | Resolved path to project documentation — `apps/<current_project>/docs` or `.oneticket/docs` for framework context |
| **app_path** | Resolved path to project source code — `apps/<current_project>/app` — internal structure is skill-defined |

---

## 7. Product Capabilities

| Capability | Description | Status |
|---|---|---|
| **Agent invocation** | Invoke any agent by commenting `@role` on a GitHub issue | ✅ v0.1.0 |
| **Task decomposition** | Decomposer agents (e.g. `@leaddev`) break requests into a manifest DAG | ✅ v0.1.0 |
| **FAN-OUT execution** | Ready tasks dispatched in parallel to worker agents | ✅ v0.1.0 |
| **GATHER and merge** | Completed task branches merged sequentially, dependencies resolved | ✅ v0.1.0 |
| **Multi-trigger support** | Issue comments, PR comments, inline review comments | ✅ v0.1.0 |
| **Documentation generation** | Structured docs covering product, architecture, epics, US, sprints, ADRs, C4, ship | ✅ v0.1.0 |
| **Skill loading** | Agent profiles load domain-specific skills at runtime | ✅ v0.1.0 |
| **Routing and handoff** | Declared rules for agent-to-agent communication | 🔲 V1 |
| **Autonomous mode** | Agent-to-agent chaining without human intervention | 🔲 V1 |
| **Full-stack generation** | Backend, database, infrastructure generation via skills | 🔲 V1 |
| **APM integration** | Versioned skill and profile distribution via Microsoft APM | 🔲 V1 |
| **Cloud runtime** | Long-running agent sessions in isolated sandboxes | 🔲 V2 |

---

## 8. User Experience

### 8.1 Core interaction model

- A GitHub issue is the unit of work — every agent invocation starts from one
- No Git, no branches, no YAML for the user
- One comment = one agent invocation

### 8.2 Invocation model

#### Deterministic commands

| Command | Triggers |
|---|---|
| `@po init-doc` | `init-doc.mjs` — initializes the documentation structure |
| `@leaddev init-<template>` | `init-template.mjs` — bootstraps the app from a template |

#### Agentic conventions (recommended, not enforced)

| Role | Convention | Prerequisite |
|---|---|---|
| `@po` | `@po create` — epic or user story | `init-doc` |
| `@po` | `@po update` — existing doc artifact | existing doc file |
| `@po` | `@po validate` — documentation PR | existing doc structure |
| `@po` | `@po fix` — doc inconsistency | identified problem |
| `@po` | `@po reverse-doc` — generate doc from code | existing codebase |
| `@analyst` | `@analyst create` — epic or user story draft | `init-doc` |
| `@analyst` | `@analyst update` — refine existing artifact | existing doc file |
| `@analyst` | `@analyst validate` — business conformance | existing doc file |
| `@analyst` | `@analyst fix` — doc error or inconsistency | identified problem |
| `@architect` | `@architect create` — architecture + C4 diagrams | `init-doc` |
| `@architect` | `@architect update` — existing technical artifact | existing technical file |
| `@architect` | `@architect validate` — technical feasibility | existing design |
| `@architect` | `@architect fix` — architecture problem | identified problem |
| `@leaddev` | `@leaddev <request>` — decompose into tasks, delegate to @dev | `init-template` |
| `@leaddev` | `@leaddev update` — refactor or optimize code | existing code |
| `@leaddev` | `@leaddev fix` — resolve merge conflict or technical issue | CI/CD detected problem |
| `@dev` | `@dev create` — implement a feature | initialized template + user story |
| `@dev` | `@dev update` — improve existing feature | existing code |
| `@dev` | `@dev fix` — fix a bug | identified bug |
| `@qa` | `@qa validate` — review PR (doc or code) | open PR |
| `@qa` | `@qa fix` — document and report a bug | identified bug |

The agent interprets the full comment body — wording drives skill selection.

### 8.3 Spec-First / Reverse-Doc

- **Spec-First** — documentation drives implementation (normal flow): specs and user stories are produced first, then code is generated from them.
- **Reverse-Doc** — `@po reverse-doc` generates structured documentation from existing code.

#### Documentation structure

OneTicket enforces an opinionated documentation structure covering the full product lifecycle.
Each project's docs live in `apps/<project>/docs/`, initialized from a template by `init-doc.mjs`
(`.oneticket/templates/docs/` → `apps/<project>/docs/`).

```
apps/<project>/docs/
  what/                         ← product intent
    product-spec.md
    epics/
      epic-N-<name>/
        epic.md
        user-stories/
          us-NNN-<name>.md
  how/                          ← technical decisions
    architecture.md
    c4/
      system-context.md
    sprints/
      sprint-N-<name>/
        sprint.md
    adr-NNN-<name>.md
  ship/                         ← delivery
  run/                          ← operations
```

An Astro static site is generated from this documentation via `link-docs.mjs`, which scans
`docs/` recursively, extracts page titles from H1 headings, and builds the site navigation.
The script is idempotent and regenerates the full site from scratch on every build.
The generated site is deployed to GitHub Pages alongside the app.

### 8.4 Deliverables

| Type | Format | Location |
|---|---|---|
| Documentation | Markdown | `apps/<project>/docs/` |
| App | Code | `apps/<project>/app/` |
| Doc site | Astro static site | GitHub Pages |

### 8.5 End-to-end scenario — Breakout

```
User creates issue: "Build a Breakout game"

User comments: @po create
  → epic + user stories produced in docs

User comments: @architect create
  → architecture.md + C4 diagrams produced

User comments: @leaddev init-appshell
  → app bootstrapped from AppShell template

User comments: @leaddev implement the Breakout game
  → tasks decomposed, @dev dispatched in parallel

GATHER: branches merged, feature/issue-N ready for review
Deployed on GitHub Pages
```

### 8.6 Prerequisite handling

- **Gate 0** — if `current_project` is not set in `config.yml`: clear error comment posted on the issue, pipeline stops, no agent invoked
- **init-doc** — if doc structure is absent: automatically triggered before the agentic run
- **init-template** — triggered on explicit `@leaddev init-<template>` command, confirmed by the user
- **Missing agentic prerequisite** — if an agentic convention is used but its prerequisite is not satisfied (e.g. `@analyst update` called but no doc file exists): the agent posts a clear error comment indicating which command to run first, and stops without producing output

---

## 9. High-Level Workflows

**Workflow 1 — Task execution**
```
Developer comments @leaddev <request> on a GitHub issue
  → ensure-issue-branch.mjs creates feature/issue-N
  → check-prerequisites.mjs — Gate 0 + init-doc
  → agent-dispatch.mjs builds prompt, dispatches agent-execute.yml
  → @leaddev produces manifest.json (DAG of tasks)
  → dispatch-fanout.mjs → on-fanout.yml
  → FAN-OUT: ready tasks dispatched in parallel to worker agents
  → Each worker produces one file, commits, triggers GATHER
  → GATHER merges branch, resolves dependencies, dispatches next ready tasks
  → When all tasks done → feature/issue-N is ready for review
```

**Workflow 2 — Documentation cycle**

*Doc initialization (deterministic)*
```
User comments: @po init-doc on a GitHub issue
  → ensure-issue-branch.mjs creates feature/issue-N
  → init-doc.mjs copies .oneticket/templates/docs/ → apps/<project>/docs/
  → Commit + push on feature/issue-N → PR created automatically
```

*Doc content (agentic)*
```
Developer comments @po <doc request> on a GitHub issue
  → @po loads oneticket-init-knowledge skill
  → Gates 1-4: product-spec → architecture → epic-0-mvp → confirmation
  → Each gate produces structured markdown in docs_path
  → Human validates each gate before proceeding
```

**Workflow 3 — Direct agent response**
```
Developer comments @po <question> on a GitHub issue
  → @po reads request context
  → Posts GitHub comment directly — no manifest, no FAN-OUT
```

**Workflow 4 — PR comment (fil général)**
```
Developer comments @role <request> in the PR Conversation tab
  → on-pr-comment.yml detects @role (issue_comment with issue.pull_request != null)
  → Resolves head.ref → extracts issue_number from feature/issue-N
  → agent-dispatch.mjs builds prompt with PR context (title, body)
  → Agent responds via gh api .../issues/{N}/comments — no manifest, no FAN-OUT
```

**Workflow 5 — PR review (inline diff + submit review)**

Four distinct UX cases, all routed through `on-pr-review.yml` via `pull_request_review: submitted`:

| Case | User action | Event emitted | Agent response |
|---|---|---|---|
| 5a | `@role` inline comment on diff — no pending review — click "Comment" | `pull_request_review` (auto-submitted) | Inline reply via `gh api .../pulls/{N}/comments --field in_reply_to` |
| 5b | Click "Add review comment" on diff (pending review exists) | **none** — no event until Submit | Handled at Submit (case 5c/5d) |
| 5c | Submit review — inline comments with `@role` as last comment in thread | `pull_request_review` | One agent per thread, inline reply via `in_reply_to` |
| 5d | Submit review — body starts with `@role` | `pull_request_review` | Agent responds in PR Conversation tab via `gh api .../issues/{N}/comments` |

Cases 5c and 5d are processed in parallel by `dispatch-review-agents.mjs`.

**Rules:**
- Only the **last comment of each thread** is checked for `@role` — earlier comments are context only
- If last comment does not start with `@` → thread is ignored silently
- `AGENTS.md` directive: for `pull_request_review_comment`, DO NOT use other command than `gh api .../pulls/{N}/comments --field in_reply_to`

**Workflow 6 — GitHub event-driven (V1)**
```
Any GitHub event — label added, PR merged, milestone closed, tag pushed, etc.
  → A dedicated workflow listens to the event
  → agent-dispatch.mjs builds prompt with event context
  → Agent acts accordingly — comment, commit, manifest, or documentation update

In V1, any GitHub Actions trigger (push, pull_request, release, label,
milestone, schedule, etc.) can become an agent invocation entry point
by adding a corresponding workflow file.
```

**Workflow 7 — App initialization (deterministic)**
```
User comments: @leaddev init-<template> on a GitHub issue
  → ensure-issue-branch.mjs creates feature/issue-N
  → init-template.mjs copies apps/<template>/app/ → apps/<project>/app/
  → Replaces template name placeholders with project name
  → Commit + push on feature/issue-N → PR created automatically
```

**Workflow 8 — Doc site generation and deployment**
```
On push to main or PR to main (paths: apps/**/docs/**, .oneticket/docs/**)
  → resolve-context: detect project from modified paths (independent of config.yml)
  → link-docs.mjs: DOC_SOURCE → doc-site/src/content/docs/
      README.md → index.md, frontmatter injection, cross-ref link fixing
  → Astro build → doc-site/dist/
  → App build (parallel, app projects only) → apps/<project>/app/dist/
  → GitHub Pages deploy:
      push to main → prod:    https://…/<slug>/docs/
      pull_request → preview: https://…/<slug>/pr/<N>/docs/ + sticky PR comment
```

---

## 10. Business Rules

- Orchestration logic must live in deterministic code — LLMs never make control flow decisions
- Every agent invocation must start from a GitHub issue or a GitHub event
- OneTicket mimics agile team best practices — each subtask gets its own branch, work is merged progressively as tasks complete, the final output is a single reviewable PR
- Merge to `main` is an explicit human decision — the human reviews and merges the feature branch PR
- In autonomous mode (V1), automatic merge will be supported for bounded and validated scenarios
- An agent must never push directly to `main` — all changes go through feature branches and PRs
- `current_project` must be set in `config.yml` before any agent can be dispatched
- `docs_path` and `app_path` are always resolved deterministically by the dispatcher — agents never resolve them themselves
- One task = one file produced = one branch = one completion signal
- A manifest must be a valid JSON DAG — no cycles, no undefined dependencies
- Agent responses must always be posted as GitHub comments — no silent execution
- Skills contain declarative instructions only — no control flow logic
- Agent profiles define keyword-to-skill routing — the wording of a request determines which skills are referenced in the manifest content field; using the right keywords is critical to trigger the correct skill. The semantic chain is: user request keywords → agent profile skill selection table → skill metadata (description:) → skill instructions loaded

---

## 11. Success Criteria

- `reply` test passes — agent responds to a direct question with a GitHub comment, no manifest produced
- `manifest` test passes — injected manifest triggers FAN-OUT, all tasks execute, feature branch ready for review
- `decompose` test passes — agent decomposes a natural language request into the correct DAG, FAN-OUT executes, feature branch ready for review
- `parallel` test passes — two simultaneous pipelines execute independently, no branch crossing
- Documentation cycle completes — Gates 1-4 produce valid `product-spec.md`, `architecture.md`, `epic-0-mvp/` without human-provided content being overwritten
- PR comment and inline review comment trigger the correct agent response channel
- No silent execution — every agent job ends with a GitHub comment
- Multi-project isolation — changing `current_project` switches the active project context; `apps/<current_project>/docs/` for documentation and `apps/<current_project>/app/` for source code are preserved per project. This design is architecturally sound but not yet validated in real multi-project conditions
- `current_project` as a global switch is a known limitation for concurrent multi-project work — open question for V1

---

## 12. Open Questions

| # | Question | Scope |
|---|---|---|
| 1 | Which scenarios make autonomous mode safe without intermediate human validation? | V1 |
| 2 | What format should the routing and handoff matrix use? | V1 |
| 3 | What minimal context should be injected per agent role and request origin? | V1 |
| 4 | Which agent CLIs should be officially supported beyond opencode? | V1 |
| 5 | Which complementary roles should be prioritized after `@po` — `@architect`, `@qa`, `@dev`? | V1 |
| 6 | How to handle concurrent `current_project` switches in multi-developer scenarios? | V1 |
| 7 | Should `apps/<current_project>/app/` structure be enforced by the framework or left to skills? | V1 |
| 8 | Do deployment skills exist for major cloud providers (AWS, GCP, Azure, Vercel, Fly.io)? What is their impact on oneticket — new agent roles, new skill format, infrastructure manifest? | V1 |
| 9 | What supervision UX is needed for autonomous and fan-out/fan-in runs? | V2 |
| 10 | Which cloud target for agentic sandboxes — E2B or equivalent? | V2 |
| 11 | Which full-stack skills should be prioritized — backend, database, infrastructure? | V1 |

---

## 13. Roadmap

| Milestone | Epics | Goal |
|---|---|---|
| **v0.5.0** — released | AppShell + Breakout apps, product-spec stable, pipeline doc aligned | GitHub-native pipeline fully operational end-to-end |
| **V1** — planned | Routing & handoff matrix, autonomous mode, full-stack skills, APM integration, deployment skills | Complete agentic team operating autonomously on bounded scenarios |
| **V2** — planned | Cloud runtime, persistent sandboxes, multi-sandbox fan-out, observability | Long-running agent sessions without GitHub Actions constraints |

> Macro-versions V1 and V2 are planning labels, not SemVer versions. Official releases follow semantic versioning — `v0.1.0`, `v0.2.0`, `v1.0.0`, etc. — carried by git tags. Documentation is a snapshot of the repository state at each tag.

---

## 14. Pipeline Architecture

### 14.1 Simplified workflow overview

This section presents only the structural GitHub workflows and the main scripts they use.

#### GitHub entry points

```text
on-issue-comment.yml
  → ensure-issue-branch.mjs    (creates feature/issue-N if absent — idempotent)
  → check-prerequisites.mjs    (Gate 0 current_project, init-doc if doc structure missing)
  → build-context.mjs          (fetches comment history, formats the prompt context block)
  → agent-dispatch.mjs         (resolves docs_path/app_path, builds prompt, sets in progress label, dispatches agent-execute.yml)

on-pr-comment.yml
  → build-context.mjs          (fetches PR comment history, formats the prompt context block)
  → agent-dispatch.mjs         (resolves docs_path/app_path, builds prompt, dispatches agent-execute.yml)

on-pr-review.yml
  → build-context.mjs          (fetches diff hunk, line, file, formats the prompt context block)
  → agent-dispatch.mjs         (resolves docs_path/app_path, builds prompt, dispatches agent-execute.yml)
```

#### Agentic execution

```text
agent-execute.yml
  → oneticket-install.mjs --apm-only  (copies .oneticket/apm.yml → apm.yml, .oneticket/.apm/ → .apm/)
  → apm install                        (installs external skills → .agents/skills/)
  → apm compile                        (compiles AGENTS.md from .apm/instructions/)
  → oneticket-install.mjs --skills-only (copies .oneticket/skills/ → .agents/skills/ — overrides APM skills by name)
  → generate-config.mjs               (generates opencode config from config.yml → OPENCODE_CONFIG_CONTENT)
  → anomalyco/opencode                 (runs the agent — only non-deterministic step)
  → notify-agent-failure.mjs          (if agent failed — posts comment + labels dev error on issue + PR)
  → retry-dispatch.mjs                (exponential backoff + jitter, sets blocked label on exhaustion)
  → deterministic push of the working branch
  → dispatch-fanout.mjs               (if manifest present — triggers on-fanout.yml)
  → dispatch-gather.mjs               (if is_fanout_task: true — triggers on-gather.yml)
```

### 14.2 `agent-execute.yml` interface

| Input | Type | Set by | Description |
|---|---|---|---|
| `branch` | string | `agent-dispatch.mjs` or `agent-launcher.mjs` | Working branch (`feature/issue-N` or `task/issue-N-X`) |
| `issue_number` | string | `agent-dispatch.mjs` or `agent-launcher.mjs` | GitHub issue number |
| `is_fanout_task` | boolean | `agent-launcher.mjs` → `true`, `agent-dispatch.mjs` → `false` | Signal: FAN-OUT task or direct invocation |
| `prompt` | string | `agent-dispatch.mjs` or `agent-launcher.mjs` | Full system prompt injected into anomalyco |
| `model` | string | `config.yml` via `agent-dispatch.mjs` | LLM model to use |
| `role` | string | `agent-dispatch.mjs` | Optional agent profile (dev, architect, analyst...) |
| `retry_count` | string | `retry-dispatch.mjs` | Current attempt count |
| `retry_max` | string | `config.yml` | Maximum allowed attempts |

### 14.3 Fan-out

```text
on-fanout.yml  (triggered by dispatch-fanout.mjs via workflow_dispatch)
  inputs:
    issue_number  — GitHub issue number
  → launch-fanout.mjs          (git setup, checkout feature/issue-N, reads the manifest)
  → agent-launcher.mjs         (creates task/issue-N-X via GitHub API, dispatches N × agent-execute.yml in batches)
```

### 14.4 Fan-in

```text
on-gather.yml  (triggered by dispatch-gather.mjs via workflow_dispatch)
  inputs:
    task_branch  — e.g. task/issue-42-A
    branch_base  — e.g. feature/issue-42 (computable from task_branch)
  → validate-task-branch.mjs   (cross-issue guard: task/issue-N-X → feature/issue-N only)
  → orchestrate.mjs            (merges task/*, optimistic retry 5x, updates manifest, progress bar, closes task PR, deletes task branch, DAG recalc)
  → agent-launcher.mjs         (dispatches next READY tasks)
```

### 14.5 Project initialization

These operations are deterministic — never agentic. Invoked by the pipeline before every agentic run or explicitly by the user.

```text
check-prerequisites.mjs <docs_path>
  → called by on-issue-comment.yml before every agentic run
  → Gate 0: verifies that current_project is defined — notifies and stops if missing
  → init-doc: verifies that docs_path contains the standard structure
               if absent → copies .oneticket/templates/docs/ to docs_path (idempotent)
  → extensible: additional deterministic prerequisites can be added here

init-template.mjs <template>
  → triggered by the user via @leaddev init-<template> (e.g. @leaddev init-appshell)
  → copies apps/<template>/app/ to apps/<current_project>/app/
  → customizes placeholders (package.json, index.html, screens)
  → idempotent — if apps/<current_project>/app/ already exists, skip
  → available templates: appshell (React+Vite), ...
  → note: the decision to use a template remains agentic
           (@leaddev detects the stack and recommends the appropriate template)
```

---

### 14.6 Script reference

#### Entry scripts

| Script | Functional content |
|---|---|
| `ensure-issue-branch.mjs` | Creates `feature/issue-N` if absent — idempotent |
| `check-prerequisites.mjs` | Gate 0 (`current_project`), init-doc if doc structure missing — extensible |
| `build-context.mjs` | Fetches GitHub comment history (max 10, truncated to 500 chars), formats the context block injected into the prompt |
| `agent-dispatch.mjs` | Resolves `docs_path`/`app_path`/`current_project`, builds the system prompt (agent profile, project context, contract), sets `in progress` label, dispatches `agent-execute.yml` |

#### Agentic execution scripts

| Script | Functional content |
|---|---|
| `oneticket-install.mjs` | Two-phase pre-run setup: `--apm-only` (before apm install) copies `.oneticket/apm.yml` → `apm.yml` and `.oneticket/.apm/` → `.apm/`; `--skills-only` (after apm compile) copies `.oneticket/skills/` → `.agents/skills/` — local skills override any same-named APM skill |
| `generate-config.mjs` | Generates the opencode JSON config from `agent_config.<cli>` in `config.yml` — injected via `OPENCODE_CONFIG_CONTENT` |
| `retry-dispatch.mjs` | Re-dispatches `agent-execute.yml` with exponential backoff + jitter (`2^n * 1000ms + [0,500ms]`) — sets `blocked` label on `retry_max` exhaustion |

#### Fan-out scripts

| Script | Functional content |
|---|---|
| `dispatch-fanout.mjs` | Sends the `workflow_dispatch` signal to `on-fanout.yml` when a manifest is detected |
| `launch-fanout.mjs` | Git setup, checkout `feature/issue-N`, reads the manifest, delegates to `agent-launcher.mjs` |
| `agent-launcher.mjs` | Identifies ready tasks (DAG), marks `in_progress`, creates `task/issue-N-X` branches via GitHub API, dispatches N × `agent-execute.yml` in batches of 4 with anti-cancellation delay (2s between dispatches) |

#### Fan-in scripts

| Script | Functional content |
|---|---|
| `dispatch-gather.mjs` | Sends the `workflow_dispatch` signal to `on-gather.yml` from task/* sub-branches |
| `validate-task-branch.mjs` | Cross-issue guard: verifies that `task/issue-N-X` belongs to `feature/issue-N` — rejects any issue number mismatch |
| `orchestrate.mjs` | Merges `task/*` → `feature/issue-N` with optimistic retry (5 attempts, exponential backoff), marks task `done` or `merge-failed`, posts progress bar on the issue, closes the task PR, deletes the task branch, recalculates DAG, delegates to `agent-launcher.mjs` |

#### Initialization scripts

| Script | Functional content |
|---|---|
| `init-doc.mjs` | Copies `.oneticket/templates/docs/` to `<docs_path>` — idempotent, never overwrites existing files. Called by `check-prerequisites.mjs`, never by an agent |
| `init-template.mjs` | Copies `apps/<template>/app/` to `apps/<current_project>/app/`, customizes placeholders — idempotent. Triggered on agentic decision confirmed by the user |

#### Utility scripts (cross-cutting)

| Script | Functional content |
|---|---|
| `constants.mjs` | Single source of truth for reserved framework paths — no dependencies |
| `config.mjs` | Reads and parses `.oneticket/config.yml`, exposes `loadConfig()` |
| `utils.mjs` | Shell (`run`, `runWithRetry`), git (`setupGit`), manifest (`readManifest`, `writeManifest`), DAG (`areDependenciesSatisfied`), GitHub API (`dispatchWorkflow`, `applyLabel`, `removeLabel`, `createBranch`) — `createBranch(branchName, fromBranch, repo, token)`: POST /repos/{repo}/git/refs, idempotent |
| `print-config.mjs` | CLI wrapper for `config.mjs` — allows YAML workflows to read a config value without inline code |

---

### 14.7 Labels and signals

| Label | Set by | Removed by | Meaning |
|---|---|---|---|
| `in progress` | `agent-dispatch.mjs` | `orchestrate.mjs` (when all DONE) | An agentic run is in progress on this issue |
| `merge error` | `orchestrate.mjs` | Manual | A task branch could not be merged — human intervention required |
| `blocked` | `retry-dispatch.mjs` | Manual | The agent has exhausted its retry attempts |
| `ready for review` | `create-pr.mjs` (cycled to retrigger deploy preview) | `agent-dispatch.mjs` (before direct run) | Signals the deploy preview workflow — cycled by the pipeline on FAN-OUT completion |

> The final PR is a user decision — never created automatically by the pipeline.

---

### 14.8 Robustness

- **`notify-failure`** — all workflows (`on-issue-comment`, `on-pr-comment`, `on-pr-review`, `agent-execute`, `on-gather`) have a `notify-failure` job that posts a comment on the issue when the workflow fails definitively. `notify-agent-failure.mjs` handles agent-specific failures (posts comment + applies `dev error` label on issue and PR)
- **Optimistic manifest retry** — `orchestrate.mjs` handles concurrent manifest access conflicts via hard reset + re-fetch + re-merge (max 5 attempts, `orchestrate_retry_max` in `config.yml`)
- **Exclude sandbox artefacts** — `agent-execute.yml` injects `.agents/`, `.opencode/`, `opencode.json` into `.git/info/exclude` so the agent does not accidentally commit them
- **Cross-issue guard** — `validate-task-branch.mjs` prevents any task branch from merging into a feature branch of a different issue

---

### 14.9 Manifest structure

The manifest is the contract between `@leaddev` and the execution pipeline. It is produced by the agent and never modified by another agent — only by deterministic scripts (`orchestrate.mjs`, `agent-launcher.mjs`).

#### Format

```json
{
  "issue": 42,
  "tasks": [
    {
      "id": "A",
      "branch": "task/issue-42-A",
      "file": "src/screens/GameScreen.tsx",
      "content": "Complete self-contained instruction for the executing agent...",
      "role": "dev",
      "depends_on": [],
      "status": "pending"
    }
  ]
}
```

#### Fields

| Field | Type | Constraint |
|---|---|---|
| `issue` | integer | Exact GitHub issue number |
| `tasks` | array | Non-empty — max `max_tasks` (config.yml) |
| `id` | string | Unique uppercase letter(s) — A, B, C... |
| `branch` | string | Strict convention: `task/issue-N-X` |
| `file` | string | Relative path from repo root — no leading `/` |
| `content` | string | Self-contained instruction — the agent has no other context |
| `role` | string | Optional — `dev`, `architect`, `analyst`... |
| `depends_on` | array | Ids existing in this manifest — `[]` if no dependency |
| `status` | string | `pending` \| `in_progress` \| `done` \| `merge-failed` |

> `branch_base` is absent from the manifest — it is a computable parameter from `issue_number`.

---

### 14.10 Configuration — `.oneticket/config.yml`

Single source of truth for framework parameters. Read by `config.mjs` and injected into scripts and workflows.

| Parameter | Role in the pipeline |
|---|---|
| `current_project` | Determines `docs_path` and `app_path` — verified by `check-prerequisites.mjs` (Gate 0) |
| `model` | LLM model used by anomalyco — extracted from `agent_config.<cli>.model` |
| `max_tasks` | Limits the number of tasks in a manifest |
| `retry_max` | Maximum agent retries in `retry-dispatch.mjs` |
| `orchestrate_retry_max` | Maximum optimistic retries in `orchestrate.mjs` |
| `clear_session_cache` | Clears the opencode session cache before each run |
| `pr_base` | Target branch for final PRs (e.g. `main`) |
| `oneticket_git_user_name` | Git identity of the CI bot |
| `oneticket_git_user_email` | Git email of the CI bot |

---

### 14.11 Agnetic pipeline

```mermaid
flowchart TD

    subgraph AMONT["Upstream — Triggering"]
        ISSUE["on-issue-comment.yml"]
        PR["on-pr-comment.yml"]
        REVIEW["on-pr-review.yml"]
    end

    subgraph EXEC_BOX["Agentic execution"]
        EXEC["agent-execute.yml"]
    end

    subgraph FANOUT_BOX["Fan-out"]
        FANOUT["on-fanout.yml"]
    end

    subgraph FANIN_BOX["Fan-in"]
        GATHER["on-gather.yml"]
    end

    ISSUE --> EXEC
    PR --> EXEC
    REVIEW --> EXEC

    EXEC -->|"Failure"| RETRY["Retry / Blocked"]
    RETRY -->|"retry_count < max"| EXEC

    EXEC -->|"Success"| PUSH["Deterministic push"]

    PUSH --> ISFANOUT{"is_fanout_task ?"}

    ISFANOUT -->|"Yes — Task complete"| GATHER
    ISFANOUT -->|"No"| MANIFESTCHECK{"Manifest produced ?"}

    MANIFESTCHECK -->|"Yes — Manifest produced"| FANOUT
    MANIFESTCHECK -->|"No — Direct run"| END_SIMPLE["END — feature/issue-N ready for review"]

    FANOUT -->|"N tasks"| EXEC

    GATHER -->|"merge OK + tasks ready"| FANOUT
    GATHER -->|"merge OK + all done"| DONE["END — DAG complete, feature/issue-N ready for review"]
    GATHER -->|"merge error"| ERROR["END — intervention required"]
    GATHER -->|"merge OK + waiting"| WAIT["END — waiting for signals"]
```

---

### 14.12 Example — 3 sequential tasks A → B → C

This example illustrates the complete lifecycle of a manifest with 3 sequential tasks.

#### Initial manifest

`@leaddev` produces this manifest on `feature/issue-42`:

```json
{
  "issue": 42,
  "tasks": [
    {
      "id": "A",
      "branch": "task/issue-42-A",
      "file": "src/screens/GameScreen.tsx",
      "content": "Create the GameScreen component...",
      "role": "dev",
      "depends_on": [],
      "status": "pending"
    },
    {
      "id": "B",
      "branch": "task/issue-42-B",
      "file": "src/utils/collision.ts",
      "content": "Implement the AABB collision module...",
      "role": "dev",
      "depends_on": ["A"],
      "status": "pending"
    },
    {
      "id": "C",
      "branch": "task/issue-42-C",
      "file": "src/main.tsx",
      "content": "Add the /game route in main.tsx...",
      "role": "dev",
      "depends_on": ["B"],
      "status": "pending"
    }
  ]
}
```

---

#### Step 1 — `@leaddev` produces the manifest

**Workflow**: `on-issue-comment.yml` → `agent-execute.yml`

**Scripts**:
- `ensure-issue-branch.mjs` — creates `feature/issue-42` if absent
- `check-prerequisites.mjs` — Gate 0 + init-doc if missing
- `build-context.mjs` — builds the GitHub context
- `agent-dispatch.mjs` — dispatches `agent-execute.yml` with `is_fanout_task: false`

`agent-execute.yml` runs on `feature/issue-42`:
- `anomalyco/opencode` produces and commits `manifest.json`
- pushes `feature/issue-42`
- `is_fanout_task: false` + manifest present → **"Manifest produced"**
- `dispatch-fanout.mjs` → `on-fanout.yml`

---

#### Step 2 — Initial FAN-OUT — launching A

**Workflow**: `on-fanout.yml`

**Scripts**:
- `launch-fanout.mjs` — git setup, checkout `feature/issue-42`, reads manifest
- `agent-launcher.mjs`:
  - DAG calculation: only A is ready (`depends_on: []`)
  - manifest updated:

```json
{ "id": "A", "status": "in_progress" }
{ "id": "B", "status": "pending" }
{ "id": "C", "status": "pending" }
```

  - creates `task/issue-42-A` via GitHub API
  - dispatches `agent-execute.yml` with `is_fanout_task: true`, `branch: task/issue-42-A`

---

#### Step 3 — Task A executes and completes

**Workflow**: `agent-execute.yml` on `task/issue-42-A`

**Scripts**:
- `anomalyco/opencode` creates `src/screens/GameScreen.tsx`, commits
- pushes `task/issue-42-A`
- `is_fanout_task: true` → **"Task complete"**
- `dispatch-gather.mjs` → `on-gather.yml`

---

#### Step 4 — GATHER of A — launching B

**Workflow**: `on-gather.yml`

**Scripts**:
- `validate-task-branch.mjs` — verifies `task/issue-42-A` → `feature/issue-42` ✅
- `orchestrate.mjs`:
  - merges `task/issue-42-A` → `feature/issue-42` (optimistic retry 5x)
  - manifest updated:

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "pending" }
{ "id": "C", "status": "pending" }
```

  - closes task PR, deletes `task/issue-42-A`
  - posts progress bar on the issue: `█░░  1/3 done`
  - DAG calculation: B is ready (`depends_on: ["A"]`, A=done)
  - `agent-launcher.mjs`:
    - manifest updated:

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "in_progress" }
{ "id": "C", "status": "pending" }
```

    - creates `task/issue-42-B` via GitHub API
    - dispatches `agent-execute.yml` with `is_fanout_task: true`, `branch: task/issue-42-B`

---

#### Step 5 — Task B executes, GATHER, launching C

Same sequence as steps 3 and 4.

Manifest after GATHER of B:

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "done" }
{ "id": "C", "status": "in_progress" }
```

Progress bar: `██░  2/3 done`

---

#### Step 6 — Task C executes and completes — DAG complete

**Workflow**: `on-gather.yml`

**Scripts**:
- `orchestrate.mjs`:
  - merges `task/issue-42-C` → `feature/issue-42`
  - final manifest:

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "done" }
{ "id": "C", "status": "done" }
```

  - progress bar: `███  3/3 done`
  - `allDone = true` → **END — DAG complete**
  - `feature/issue-42` contains the complete work of all 3 tasks
  - The PR to `main` is a user decision

---

### 14.13 Required infrastructure

#### Repository structure

```
.oneticket/
  config.yml                  ← framework parameters (source of truth)
  AGENTS.md                   ← agent team definition
  agents/                     ← agent profiles (*.agent.md)
  skills/                     ← oneticket skills (<name>/SKILL.md)
  tasks/                      ← manifests and workflow logs (issue-N/manifest.json)
  templates/
    docs/                     ← doc structure template (copied by init-doc.mjs)

src/                          ← all framework .mjs scripts
.github/
  workflows/                  ← all GitHub Actions .yml workflows
.gitattributes                ← merge=union rule for workflow.md
apps/
  <project>/
    app/                      ← application source code
    docs/                     ← project documentation (what/how/ship/run)
```

#### Branch naming conventions

| Convention | Format | Example |
|---|---|---|
| Issue branch | `feature/issue-N` | `feature/issue-42` |
| Task branch | `task/issue-N-X` | `task/issue-42-A` |

These conventions are **strict** — `validate-task-branch.mjs` rejects any deviation and `agent-execute.yml` refuses to run on any branch that does not match these formats.

#### `.gitattributes`

The `.gitattributes` file at the repo root must contain the following rule:

```
.oneticket/tasks/issue-*/workflow.md merge=union
```

`merge=union` guarantees that parallel appends to `workflow.md` (task progress log) never create a git conflict — lines are merged automatically.

#### `workflow.md`

Each `.oneticket/tasks/issue-N/` folder contains a `workflow.md` — append-only log of task progress, updated by each agent at the end of its run, protected by `merge=union`.

Entry format:
```
2026-06-01 14:32 | A | apps/breakout/app/src/screens/GameScreen.tsx
```

#### Required GitHub secrets

Two secrets must be configured in the GitHub repo settings (`Settings → Secrets → Actions`):

| Secret | Description | Required permissions |
|---|---|---|
| `ONETICKET_GH_PAT` | GitHub Personal Access Token for the bot | `contents: write`, `issues: write`, `pull-requests: write`, `workflows: write` |
| `OPENCODE_API_KEY` | opencode / anomalyco API key | Access to the LLM model configured in `config.yml` |

Without these two secrets, no workflow can execute.

---

### 14.14 Architectural philosophy

OneTicket enforces a strict separation between agentic operations and deterministic operations.

#### Agent responsibilities

Agents are allowed to:

```text
- analyze a context
- produce content
- modify files
- create a local commit
- publish a GitHub response
```

Agents are not allowed to:

```text
- create branches
- choose a branch
- push code
- merge branches
- create Pull Requests
- directly modify the global orchestration
```

#### Deterministic script responsibilities

`.mjs` scripts are responsible for:

```text
- git management
- branch management
- pushes
- merges
- manifests
- DAG calculation
- fanout
- fanin
- retries
- GitHub API interactions
```

This separation guarantees that orchestration remains predictable, reproducible, and controlled independently of AI model behavior.

#### Design decisions

- **PR = user decision** — the pipeline never creates a PR automatically. `create-direct-pr.mjs` and `createFinalPR` are removed in the v2 vision
- **Manifest = DAG condition** — the presence of `manifest.json` triggers Fan-out, not the branch name
- **Branch always created upstream** — `feature/issue-N` is guaranteed to exist before any agentic run (`ensure-issue-branch.mjs`). `task/issue-N-X` branches are created by `agent-launcher.mjs` via GitHub API before dispatch
- **Deterministic initialization** — `init-doc` and `init-template` are deterministic scripts, never delegated to an agent. Doc structure is guaranteed by `check-prerequisites.mjs` before each run
- **Gate 0 is deterministic** — `current_project` verification is done by `check-prerequisites.mjs`, never by an agent
- **Zero inline code in yml** — all business logic lives in `.mjs` scripts. YAML workflows only contain calls to these scripts
- **Template decision = agentic** — stack detection and template recommendation remain agentic. Only the execution of `init-template.mjs` is deterministic, triggered on explicit user confirmation (`@leaddev init-<template>`)
- **branch_base — computable parameter** — the parent branch of a task is always `feature/issue-N`, computed from `issue_number`: `"feature/issue-" + issue_number`. Never stored in the manifest or passed as a parameter between workflows
- **switched=true** — the prompt injects `FIRST ACTION: git checkout <branch>` as the first line. anomalyco detects the branch switch (`switched=true`) and automatically disables auto-push and PR creation. The pipeline resumes control after the agent run via the deterministic steps of `agent-execute.yml`

---

### 14.15 Doc site pipeline

```text
docs-site-github-pages.yml
  (triggered on push/PR to main — paths: apps/**/docs/**, .oneticket/docs/**)

  resolve-context
    → detects project from changed file paths (independent of config.yml)
    → computes DOC_SOURCE, slug, target folder, app path, URLs

  build-doc-site
    → link-docs.mjs (DOC_SOURCE → doc-site/src/content/docs/)
        README.md → index.md
        frontmatter injection (title from H1)
        cross-ref link fixing
        missing index.md generation
    → Astro build → doc-site/dist/

  build-app (parallel, app projects only)
    → npm run build in apps/<project>/app/ → dist/
    → VITE_BASE_PATH injected for correct GitHub Pages base URL

  deploy-preview (pull_request only)
    → JamesIves/github-pages-deploy-action → gh-pages/<slug>/pr/<N>/
    → sticky PR comment with doc and app preview URLs

  deploy-prod (push to main or tag)
    → JamesIves/github-pages-deploy-action → gh-pages/<slug>/
    → clean: true (removes stale files), preserves pr/ subfolder
```

#### URL structure

| Project | Doc URL | App URL |
|---|---|---|
| `framework` (oneticket-core) | `.../framework/docs/` | — |
| `<project>` | `.../<project>/docs/` | `.../<project>/app/` |
| PR preview | `.../<slug>/pr/<N>/docs/` | `.../<slug>/pr/<N>/app/` |

#### Doc site Mermaid

```mermaid
flowchart TD

    subgraph TRIGGERS["Upstream — Triggering (push/PR to main)"]
        PUSH_MAIN["push to main\napps/**/docs/** · .oneticket/docs/**"]
        PR_MAIN["pull_request to main\n(same paths)"]
        TAG["tag v*"]
    end

    subgraph RESOLVE["resolve-context"]
        CTX["Detect project from changed paths\nno config.yml dependency"]
    end

    subgraph BUILD["Build"]
        LINKDOCS["link-docs.mjs\nDOC_SOURCE → src/content/docs/"]
        ASTRO["Astro build\n→ doc-site/dist/"]
        APPBUILD["App build\napps/project/app/dist/\napp projects only"]
    end

    subgraph DEPLOY["Deploy — GitHub Pages"]
        PREVIEW["deploy-preview\ngh-pages/slug/pr/N/\n+ sticky PR comment"]
        PROD["deploy-prod\ngh-pages/slug/"]
    end

    PUSH_MAIN --> CTX
    PR_MAIN --> CTX
    TAG --> CTX

    CTX --> LINKDOCS
    CTX --> APPBUILD
    LINKDOCS --> ASTRO

    ASTRO --> PREVIEW
    ASTRO --> PROD
    APPBUILD --> PREVIEW
    APPBUILD --> PROD

    PR_MAIN -->|"preview only"| PREVIEW
    PUSH_MAIN & TAG -->|"prod only"| PROD
```

---

## 15. DAG Execution Contract

OneTicket orchestrates tasks via FAN-OUT — each task runs on its own isolated branch and produces files that are merged back into the feature branch by GATHER.

For deterministic merging to work, parallel tasks must respect one absolute rule:

> **No two tasks that run in parallel may produce or modify the same file.**

A violation causes an `add/add` merge conflict that cannot be resolved automatically and requires human intervention. This is not a recoverable error — it is a design flaw in the manifest.

### Why this matters

Git merge strategy for `add/add` conflicts has no automatic resolution — both versions are equally valid, and only a human can decide which to keep. In a FAN-OUT pipeline, this blocks GATHER and stalls the entire issue.

### Known patterns for conflict-free parallel decomposition

Three patterns are documented in multi-agent coding research and validated in OneTicket:

#### Pattern 1 — Skeleton-first (recommended for greenfield implementation)

A single sequential task with no `depends_on` creates all files as empty stubs (class declarations, empty functions, module exports — no logic). All parallel tasks then fill their own module with real logic, without creating new files.

```
Task A  (skeleton, depends_on: [])           → creates ALL empty files
    ↓
Tasks B, C, D, E  (parallel, depends_on: [A]) → each fills ONE file with real logic
    ↓
Task F  (integration, depends_on: [B,C,D,E]) → verifies everything assembles
```

**Use when:** starting from scratch, no existing codebase.

**Reference:** [DevSwarm — branch isolation pattern](https://github.com/devswarm-ai/devswarm)

#### Pattern 2 — Strict file ownership per task

Each task declares exactly which files it owns. The manifest makes ownership explicit. No two parallel tasks may declare the same file in their scope.

```json
{ "id": "B", "file": "app/js/gameState.js", "depends_on": ["A"], ... }
{ "id": "C", "file": "app/js/physics.js",   "depends_on": ["A"], ... }
{ "id": "D", "file": "app/js/renderer.js",  "depends_on": ["A"], ... }
```

**Use when:** decomposing by module with clear boundaries, each module maps to one file.

**Reference:** [MetaGPT — role-based file assignment](https://github.com/geekan/MetaGPT), [ChatDev — atomic task assignment](https://github.com/OpenBMB/ChatDev)

#### Pattern 3 — Sequential dependency chain

Tasks that share files are chained sequentially with explicit `depends_on`. No parallelism — simpler but slower.

```
Task A → Task B (depends_on: [A]) → Task C (depends_on: [B])
```

**Use when:** file boundaries cannot be separated cleanly, or the implementation is inherently sequential.

### Rule for `@leaddev`

`@leaddev` **must use Pattern 1 or Pattern 2** when producing implementation manifests.

- Pattern 1 is preferred for new projects or when the file structure is not yet established.
- Pattern 2 is preferred when the architecture defines clear module boundaries.
- Pattern 3 is acceptable only when file coupling makes parallel execution impossible.

A manifest where parallel tasks produce the same file is invalid and will cause a merge conflict at GATHER.

---

## 16. Decomposition and Quality Trade-offs

Operating a multi-agent pipeline requires navigating two fundamental tensions. Understanding them allows conscious, deliberate configuration — not trial and error.

### The Cost Triangle

Every pipeline run sits inside a triangle with three competing forces:

```
         Agentic cost
        (tokens, CI runs)
              /\
             /  \
            /    \
           /______\
    LLM quality    Human cost
    (model choice)  (review, debug, correction)
```

- **Reducing agentic cost** (cheaper model, fewer tasks) increases human cost — the agent produces more imprecisions, inconsistencies, and structural errors that require human correction.
- **Increasing LLM quality** (more capable model) reduces human cost but increases agentic cost.
- **The framework acts as a quality multiplier** — robust skills, guided templates, and deterministic guards reduce human cost independently of the model. A well-designed framework shifts the entire triangle toward lower human cost at any given model tier.

There is no universally optimal configuration. The right balance depends on the project phase, the acceptable level of human involvement, and the budget allocated to agent runs.

### The Decomposition Triangle

Task granularity introduces a second tension:

```
         Decomposition granularity
         (number of tasks, task scope)
                  /\
                 /  \
                /    \
               /______\
   Unit errors        Integration risks
   (per-task quality)  (merge, incoherence,
                        runtime dysfunction)
```

- **Coarse decomposition** (few large tasks, one agent handles many files) — unit errors are higher because the agent has more surface to cover and more decisions to make. Integration risks are lower because fewer merges occur and the agent maintains its own coherence.
- **Fine decomposition** (many small tasks, one agent per file) — unit errors are lower because each agent has a narrow, focused scope. Integration risks are higher: merge conflicts, interface mismatches, and runtime incoherence between independently produced modules.

### Combined implications

The two triangles are not independent. A fine-grained decomposition amplifies the impact of LLM quality: with a capable model, fine decomposition produces clean, coherent modules that integrate well; with a weaker model, the same fine decomposition produces modules that are individually correct but fail at integration boundaries.

Key principles:

- **Documentation phase** — fine decomposition is safer. Documentation files are largely independent; integration risk is low; a file produced by one agent does not need to call functions defined in another.
- **Implementation phase** — decomposition granularity must be matched to the integration strategy. The skeleton-first pattern (§14) is the recommended mitigation: a single task establishes the shared structure, then fine-grained tasks fill independent modules.
- **Model choice is a project-level decision** — it should be made explicitly, not by default. A cheaper model with a more robust framework configuration can outperform a capable model with a poorly structured decomposition.
- **Human cost is never zero** — the framework reduces it, it does not eliminate it. Planning for a human validation pass is part of the delivery process, not a sign of framework failure.

### Observed examples

These examples illustrate the trade-offs in practice. They are not exceptional failures — they are the expected behavior of any multi-agent system operating at this granularity.

**Documentation — coarse task, unit error:**
A single task asked to produce all implementation slices for a project generated duplicate slices (two slices sharing the same sequence number, different names, e.g. `slice-1-entry-crud` and `slice-1-entry-data-model`). The agent had too much freedom within one task and produced redundant artifacts requiring manual cleanup. Mitigation: one task per slice, explicit naming in the manifest.

**Documentation — fine tasks, integration success:**
When the manifest explicitly named each slice as a separate task, each agent produced a coherent slice file. No duplicates. Cross-references were handled by a dedicated final task. The documentation was complete and navigable on the first pass.

**Sprint planning — @po overloaded:**
A sprint created in a single `@po` task that included goal, US selection, cross-references, AND Technical Notes produced an inconsistent document — the Technical Notes mixed business requirements with technical decisions, and cross-references were incomplete. Mitigation: split into two sequential tasks — `@po` creates the sprint shell and cross-references, `@architect` completes Technical Notes in a second task that depends on the first.

**Sprint planning — two-phase ownership, clean result:**
When `@po` created the sprint shell (goal + US selection + cross-references) and `@architect` completed `## Technical Notes` in a dependent task, the sprint document was coherent and actionable. `@leaddev` could read the sprint and produce a valid manifest without ambiguity. Cross-references were complete and bidirectional across epics, US, and sprint.

**Implementation — fine tasks, integration failure:**
A game implementation decomposed into one task per JS module produced individually correct files. At runtime, the ball had a radius of zero (not initialized by the module that owned the ball), physics ran during the menu phase (no shared phase guard), and the first game frame computed a large delta time after the menu delay — causing the ball to teleport outside the canvas. Five debug iterations were required to identify and fix the integration boundaries. The agents had no shared contract on initial state, lifecycle phases, or timing assumptions. Mitigation: skeleton-first task establishes the shared contract before any parallel implementation begins.

---

## 17. Merge Conflict Recovery

Merge conflicts are a **normal and expected** operational event in a FAN-OUT/GATHER pipeline — not an anomaly or a framework failure. They are the mechanical consequence of running parallel branches that share configuration files.

### Structural cause

In any multi-agent implementation pipeline, certain files are inherently shared across tasks:

- **Dependency manifests**: `package.json`, `package-lock.json`, `requirements.txt`, `Cargo.toml`
- **Build configuration**: `vite.config.ts`, `tsconfig.json`, `webpack.config.js`
- **Test setup**: `vitest.setup.ts`, `jest.setup.ts`, `conftest.py`

Each agent modifies these files independently on its own branch, without knowledge of what other branches have done. When GATHER merges these branches sequentially into the feature branch, the second and subsequent merges encounter conflicts on these shared files.

This is not a design flaw — it is the price of parallelism. The mitigation is not to eliminate it but to make recovery fast and reproducible.

### Recovery principles

1. **The manifest is the source of truth** — always verify manifest status against actual branch state before any recovery action. A manifest that says `done` for a branch that still exists open is a sign of corrupted state.

2. **Orchestrate is idempotent** — `orchestrate.mjs` can be safely re-triggered on a task already marked `done`. It exits cleanly without side effects. Use this property to resume a stalled pipeline after manual recovery.

3. **Merge in order of lag** — merge branches from least behind to most behind (fewest commits behind the feature branch first). Each successful merge reduces the conflict surface for subsequent branches.

4. **Always use `--ours` on shared config files** — the feature branch version of `package.json`, `tsconfig.json`, and build config files is authoritative. Individual task branches only add new source files; their config changes are either redundant or incomplete relative to the accumulated feature branch state.

5. **Never commit build artifacts** — `dist/`, `test-results/`, `playwright-report/`, `*.tsbuildinfo`, `*.js` compiled from `*.ts` config files must never be tracked. A missing or incomplete `.gitignore` is the root cause; fix it in the stack bootstrap task before any implementation task runs.

### Pipeline resume after manual recovery

After manual conflict resolution and manifest correction, resume the pipeline by triggering `Workflow Gather` (GitHub Actions UI) with:

- `task_branch`: the last task successfully merged (use idempotence — pick any `done` task)
- `branch_base`: the feature branch

`orchestrate.mjs` will detect the task as already `done`, skip the merge, read the manifest, identify ready tasks, and dispatch them.

> See the full step-by-step procedure in [Runbook — Merge Conflict Recovery](../runbooks/merge-recovery.md).

---

## 18. Glossary

| Term | Definition |
|---|---|
| **Issue** | The unit of work — every agent invocation starts from a GitHub issue |
| **DAG** | Directed Acyclic Graph. In OneTicket, the DAG is the dependency graph between tasks in a manifest. It determines execution order: a task can only start when all its dependencies (`depends_on`) are in `done` state. DAG calculation is done by `areDependenciesSatisfied()` in `utils.mjs`. |
| **Manifest** | JSON file produced by `@leaddev` describing the task graph to execute. Stored in `.oneticket/tasks/issue-N/manifest.json`. Contains the issue number and the list of tasks with their dependencies, statuses, and instructions. |
| **FAN-OUT** | Dispatch of N tasks in parallel from a manifest. Triggered by `on-fanout.yml` on initial launch, then re-triggered by `orchestrate.mjs` each time new tasks are unblocked by the DAG. |
| **FAN-IN** | Collection of a task completion signal and integration of its result into the issue branch. Handled by `on-gather.yml` → `orchestrate.mjs`. |
| **GATHER** | Signal sent by a completed task to trigger FAN-IN. Sent via `dispatch-gather.mjs` → `workflow_dispatch` → `on-gather.yml`. |
| **Feature branch** | Main issue branch. Format: `feature/issue-N`. Created by `ensure-issue-branch.mjs` on first invocation on the issue. Receives all task branch merges. |
| **Task branch** | Working branch created for each task in a manifest. Format: `task/issue-N-X`. Created by `agent-launcher.mjs` via GitHub API before dispatch, merged into `feature/issue-N` after completion by `orchestrate.mjs`, then deleted. |
| **Agent profile** | A markdown file (`.agent.md`) declaring a role's identity, responsibilities, and skill loading rules |
| **Skill** | An instruction set encoding domain knowledge — loaded by agents at runtime to guide their behavior |
| **Role** | A named agent identity invokable via `@role` comment on a GitHub issue |
| **Routing** | The rule declaring which role handles which type of request |
| **Handoff** | The explicit transmission of context and intent from one agent to the next |
| **Direct run** | Execution of an agent on `feature/issue-N` without producing a manifest — comment reply, fix, doc, review. No FAN-OUT triggered. The feature branch is left ready for the user to open a PR. |
| **is_fanout_task** | Boolean parameter passed to `agent-execute.yml`. `true` if the task comes from a FAN-OUT (set by `agent-launcher.mjs`), `false` for direct invocation (set by `agent-dispatch.mjs`). |
| **switched=true** | Internal anomalyco mechanism: when the agent's first action is a `git checkout`, anomalyco disables automatic push and PR creation, letting the pipeline resume control via the deterministic steps of `agent-execute.yml`. |
| **Gate 0** | Deterministic check performed by `check-prerequisites.mjs` before any agentic run: `current_project` defined and doc structure present. If Gate 0 fails, the pipeline stops without invoking an agent. |
| **Optimistic lock** | Concurrent manifest access conflict handling in `orchestrate.mjs`: on non-fast-forward push, hard reset + re-fetch + re-merge up to `orchestrate_retry_max` attempts. |
| **current_project** | Parameter in `config.yml` that determines which project agents work on. Determines `docs_path` (`apps/<project>/docs`) and `app_path` (`apps/<project>/app`). |
| **docs_path** | Resolved path to project documentation — `apps/<current_project>/docs` or `.oneticket/docs` for framework context |
| **app_path** | Resolved path to project source code — `apps/<current_project>/app` — internal structure is skill-defined |
| **merge=union** | Git strategy applied to `workflow.md` — guarantees that parallel task appends never create a git conflict. |
