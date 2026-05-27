# Product Specification

## 1. Vision

OneTicket is a GitHub-native multi-agent collaboration framework. It provides the orchestration model, the agent profiles, and the skill catalog that let a team and its agents build software together — from product intent to reviewable change.

Four macro-capabilities define the product:

**1. Task orchestration** — Certain agent roles have the ability to decompose a request into subtasks and assign them to specialized agents. Results are gathered, dependencies resolved, and a pull request is produced automatically.

**2. Autonomous mode** — Agents operate within a declared workflow: each role knows where to route a request and what to hand off. Routing and handoff rules make agent-to-agent chaining explicit and controllable, in both interactive and autonomous modes.

**3. Documentation generation** — OneTicket covers the full software product lifecycle through structured documentation: product specification, architecture, epics, user stories, implementation slices, C4 diagrams, CI/CD, and operations. Documentation is the source of truth that agents read before acting.

**4. Skill and agent management** — Agent profiles and skills are the distributable unit of the product. Integration with APM (Microsoft Agent Package Manager) is planned to enable versioned skill distribution and agent identity management.

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
| **Task decomposition** | Decomposer agents (e.g. `@po`) break requests into a manifest DAG | ✅ v0.1.0 |
| **FAN-OUT execution** | Ready tasks dispatched in parallel to worker agents | ✅ v0.1.0 |
| **GATHER and merge** | Completed task branches merged sequentially, dependencies resolved, PR created | ✅ v0.1.0 |
| **Multi-trigger support** | Issue comments, PR comments, inline review comments | ✅ v0.1.0 |
| **Documentation generation** | Structured docs covering product, architecture, epics, US, slices, C4, ship | ✅ v0.1.0 |
| **Skill loading** | Agent profiles load domain-specific skills at runtime | ✅ v0.1.0 |
| **Routing and handoff** | Declared rules for agent-to-agent communication | 🔲 V1 |
| **Autonomous mode** | Agent-to-agent chaining without human intervention | 🔲 V1 |
| **Full-stack generation** | Backend, database, infrastructure generation via skills | 🔲 V1 |
| **APM integration** | Versioned skill and profile distribution via Microsoft APM | 🔲 V1 |
| **Cloud runtime** | Long-running agent sessions in isolated sandboxes | 🔲 V2 |

---

## 8. High-Level Workflows

**Workflow 1 — Task execution**
```
Developer comments @po <request> on a GitHub issue
  → agent-dispatch.mjs builds prompt + creates feature/issue-N
  → @po produces manifest.json (DAG of tasks)
  → FAN-OUT: ready tasks dispatched in parallel to worker agents
  → Each worker produces one file, commits, triggers GATHER
  → GATHER merges branch, resolves dependencies, dispatches next ready tasks
  → When all tasks done → PR feature/issue-N → main created automatically
```

**Workflow 2 — Documentation cycle**
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

**Workflow 4 — PR comment**
```
Developer comments @role <request> on a pull request
  → on-pr-comment.yml detects @role on PR
  → agent-dispatch.mjs builds prompt with PR context (title, body)
  → Agent responds via gh pr comment — no manifest, no FAN-OUT
```

**Workflow 5 — Inline PR review comment**
```
Developer comments @role <request> on a specific line in a PR diff
  → on-pr-review-comment.yml detects @role on review comment
  → agent-dispatch.mjs builds prompt with diff hunk + file + line context
  → Agent replies inline in the review thread via gh api in_reply_to
```

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

---

## 9. Business Rules

- Orchestration logic must live in deterministic code — LLMs never make control flow decisions
- Every agent invocation must start from a GitHub issue or a GitHub event
- OneTicket mimics agile team best practices — each subtask gets its own branch, work is merged progressively as tasks complete, the final output is a single reviewable PR
- Merge to `main` is an explicit human decision — the pipeline creates the PR, the human reviews and merges
- In autonomous mode (V1), automatic merge will be supported for bounded and validated scenarios
- An agent must never push directly to `main` — all changes go through feature branches and PRs
- `current_project` must be set in `config.yml` before any agent can be dispatched
- `docs_path` and `app_path` are always resolved deterministically by the dispatcher — agents never resolve them themselves
- One task = one file produced = one branch = one completion signal
- A manifest must be a valid JSON DAG — no cycles, no undefined dependencies
- Agent responses must always be posted as GitHub comments — no silent execution
- Skills contain declarative instructions only — no control flow logic
- Agent profiles define keyword-to-skill routing — the wording of a request determines which skills are referenced in the manifest content field; using the right keywords is critical to trigger the correct skill

---

## 10. Success Criteria

- `reply` test passes — agent responds to a direct question with a GitHub comment, no manifest produced
- `manifest` test passes — injected manifest triggers FAN-OUT, all tasks execute, PR created
- `decompose` test passes — agent decomposes a natural language request into the correct DAG, FAN-OUT executes, PR created
- `parallel` test passes — two simultaneous pipelines execute independently, no branch crossing
- Documentation cycle completes — Gates 1-4 produce valid `product-spec.md`, `architecture.md`, `epic-0-mvp/` without human-provided content being overwritten
- PR comment and inline review comment trigger the correct agent response channel
- No silent execution — every agent job ends with a GitHub comment
- Multi-project isolation — changing `current_project` switches the active project context; `apps/<current_project>/docs/` for documentation and `apps/<current_project>/app/` for source code are preserved per project. This design is architecturally sound but not yet validated in real multi-project conditions
- `current_project` as a global switch is a known limitation for concurrent multi-project work — open question for V1

---

## 11. Open Questions

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

## 12. Roadmap

| Milestone | Epics | Goal |
|---|---|---|
| **v0.1.0** — current | Agent invocation, FAN-OUT/GATHER, `@po` profile, skill loading, multi-trigger | GitHub-native pipeline fully operational end-to-end |
| **V1** — planned | Routing & handoff matrix, autonomous mode, full-stack skills, APM integration, deployment skills | Complete agentic team operating autonomously on bounded scenarios |
| **V2** — planned | Cloud runtime, persistent sandboxes, multi-sandbox fan-out, observability | Long-running agent sessions without GitHub Actions constraints |

> Macro-versions V1 and V2 are planning labels, not SemVer versions. Official releases follow semantic versioning — `v0.1.0`, `v0.2.0`, `v1.0.0`, etc. — carried by git tags. Documentation is a snapshot of the repository state at each tag.
