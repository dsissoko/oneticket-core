# Architecture

| Field     | Value |
|-----------|-------|
| Version   | 1.0.0 |
| Status    | ☑ draft  ☐ review  ☐ stable |
| Author    | @dsissoko |
| Date      | 2026-06-09 |
| Changelog | 1.0.0 — initial architecture — deterministic pipeline, FAN-OUT/GATHER, skill-based agents, sprint replaces slice as implementation planning unit |

---

## 1. Architecture Principles

- **Deterministic orchestration** — all pipeline control flow lives in code; LLMs only generate content, never make routing or sequencing decisions
- **Knowledge-first** — agents read `product-spec.md`, `architecture.md`, and specs before acting; context is explicitly built before every invocation
- **Role-first** — each agent is bounded by a profile (`.agent.md`) and explicit responsibilities; roles never overlap
- **Skill-based** — reusable behaviors are factored into skills; a profile without its skills has no value
- **Runtime-agnostic** — OneTicket concepts (agents, profiles, skills, routing, handoff) do not depend on a single runtime; V1 uses GitHub Actions, V2 targets cloud sandboxes
- **Reviewable by design** — agentic work converges toward a single reviewable PR; merge to `main` is always a human decision
- **Agent CLI agnostic** — the active CLI is driven by `config.yml`; switching CLIs requires only a configuration change
- **Stack-aware** — agents detect the project stack from `architecture.md` and load appropriate skills dynamically (V1 planned)
- **Documentation close to the app** — technical documentation is published alongside the developed application

---

## 2. System Overview

OneTicket runs entirely inside GitHub. GitHub provides the execution substrate: events, workflow runners, job sandboxes, artifacts, secrets, and the GitHub API.

```text
Developer
    │
    ▼
GitHub Issue / PR comment  (@role <request>)
    │
    ▼
GitHub Actions trigger  (on-issue-comment.yml / on-pr-comment.yml / on-pr-review-comment.yml)
    │
    ▼
agent-dispatch.mjs  [deterministic]
    ├── parses @role
    ├── loads agent profile (.agent.md)
    ├── resolves docs_path, app_path from current_project
    ├── builds system prompt (## Agent contract + ## Project context)
    └── dispatches agent-execute.yml
                │
                ▼
        agent-execute.yml  [LLM invocation — opencode/anomalyco]
                ├── agent reads profile + loads skills
                ├── produces manifest.json  OR  posts GitHub comment
                └── commits + pushes
                │
                ▼
        launch-fanout.mjs  [deterministic — if manifest present]
                │
                ▼
        agent-launcher.mjs  [deterministic — FAN-OUT]
                ├── marks ready tasks in_progress
                └── dispatches N × agent-execute.yml in parallel
                            │
                            ▼ (each task)
                    agent-execute.yml  [LLM — worker]
                            ├── produces one file
                            └── commits + triggers GATHER
                            │
                            ▼
                    orchestrate.mjs  [deterministic — GATHER]
                            ├── merges task branch into feature/issue-N
                            ├── marks task done in manifest
                            ├── dispatches next ready tasks (FAN-OUT)
                            └── when all done → creates final PR
```

---

## 3. Architectural Style

- **Event-driven** — every agent invocation is triggered by a GitHub event (`issue_comment`, `pull_request_review_comment`, `workflow_dispatch`)
- **Pipeline DAG** — task execution follows a directed acyclic graph declared in `manifest.json`; dependencies are resolved deterministically
- **GitOps** — all state lives in git; manifest status (`pending` → `in_progress` → `done`) is committed; branches are the unit of work isolation
- **Immutable tasks** — one task = one branch = one file = one completion signal; tasks never modify each other's output

---

## 4. Main Technical Boundaries

| Boundary | Description |
|---|---|
| **Deterministic / Agentic** | The hard boundary: orchestration code never calls LLMs; LLM invocations happen only in `agent-execute.yml` |
| **Framework / Application** | `.oneticket/` is the framework space; `apps/<current_project>/` is the application space |
| **CI / Local** | The pipeline runs on GitHub Actions runners; local development uses `astro dev` for doc preview and direct script execution |
| **V1 / V2** | V1 is GitHub-native (current); V2 introduces cloud sandboxes — the agent model is identical, only the runtime changes |

---

## 5. Key Components

| Component | File | Role |
|---|---|---|
| **agent-dispatch** | `src/agent-dispatch.mjs` | Entry point — parses `@role`, resolves project context, builds system prompt, dispatches agent-execute |
| **agent-execute** | `.github/workflows/agent-execute.yml` | Single LLM invocation point — runs opencode/anomalyco with the built prompt |
| **launch-fanout** | `src/launch-fanout.mjs` | Bootstraps FAN-OUT after manifest creation |
| **agent-launcher** | `src/agent-launcher.mjs` | FAN-OUT — marks tasks in_progress, dispatches N parallel workers |
| **orchestrate** | `src/orchestrate.mjs` | GATHER — merges task branches, resolves dependencies, creates final PR |
| **dispatch-gather** | `src/dispatch-gather.mjs` | Triggers `on-gather.yml` after each task completion |
| **config** | `src/config.mjs` | `loadConfig()` — reads `.oneticket/config.yml`, single source of truth |
| **utils** | `src/utils.mjs` | Shared helpers — git, manifest read/write, dependency check, workflow dispatch |
| **init-doc** | `src/init-doc.mjs` | Initializes `docs_path` structure from templates — idempotent |
| **generate-config** | `src/generate-config.mjs` | Generates `OPENCODE_CONFIG_CONTENT` at runtime from `config.yml` |

---

## 6. Key Interfaces

### agent-dispatch.mjs — environment contract

| Variable | Direction | Description |
|---|---|---|
| `COMMENT_BODY` | in | Raw comment text — contains `@role` + request |
| `ISSUE_NUMBER` | in | GitHub issue number |
| `REPO` | in | `owner/repo` |
| `GITHUB_TOKEN` | in | PAT with contents/issues/PR/actions write |
| `CONTEXT_BLOCK` | in | Base64-encoded context built by the trigger workflow |
| `ORIGIN_TYPE` | in | `issue_comment` / `pull_request_comment` / `pull_request_review_comment` |
| `PR_NUMBER` | in | PR number (PR triggers only) |
| `REPLY_TO_COMMENT_ID` | in | Comment ID for inline reply (review comment trigger only) |

### System prompt — `## Project context` injected into every agent

```
issue_number: <N>
repo: owner/repo
docs_path: apps/<current_project>/docs  (or .oneticket/docs)
app_path:   apps/<current_project>/app  (application context only)
current_project: <name>
```

### manifest.json — DAG contract

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

---

## 7. Data Architecture

| Artifact | Location | Format | Owner |
|---|---|---|---|
| Framework config | `.oneticket/config.yml` | YAML | Human |
| Agent profile | `.oneticket/agents/<role>.agent.md` | Markdown + YAML frontmatter | Human / APM |
| Skills | `.oneticket/skills/<name>/SKILL.md` | Markdown | Human / APM |
| Task manifest | `.oneticket/tasks/issue-<N>/manifest.json` | JSON DAG | @po agent |
| Documentation | `.oneticket/docs/` or `apps/<current_project>/docs/` | Markdown | Agents + human |
| Application source | `apps/<current_project>/app/` | Skill-defined | Worker agents |
| Static doc site | `doc-site-static/` | HTML/CSS/JS | CI build artifact |

---

## 8. Security Architecture

| Secret | Usage | Scope |
|---|---|---|
| `OPENCODE_API_KEY` | Authenticates opencode/anomalyco LLM calls | GitHub Actions secret |
| `ONETICKET_GH_PAT` | GitHub API — branch creation, PR creation, issue comments, workflow dispatch | GitHub Actions secret |

- The PAT requires: `contents:write`, `issues:write`, `pull-requests:write`, `actions:write`
- No secrets are written to disk during CI runs — `OPENCODE_CONFIG_CONTENT` is injected as an environment variable
- `agent-execute.yml` runs with `id-token: write` for future OIDC support

---

## 9. Deployment Strategy

| Target | Trigger | URL pattern |
|---|---|---|
| GitHub Pages — production | Push to `main` or tag `v*` | `https://<owner>.github.io/<repo>/<current_project>/docs/` |
| GitHub Pages — preview | Pull request touching `docs/**` or `doc-site/**` | `https://<owner>.github.io/<repo>/<current_project>/pr/<N>/docs/` |

- Static site generated by Astro + Starlight from `docs_path`
- `doc-site-static/` is a CI artifact — never committed to the repository
- Deployment target is swappable (Vercel, Netlify, Cloudflare Pages) by replacing the deploy job in `docs-site-github-pages.yml`

---

## 10. Observability Strategy

- All agent runs are visible as GitHub Actions workflow runs — full logs, inputs, outputs
- Agent responses are posted as GitHub issue/PR comments — auditable, human-readable
- Manifest state (`pending` / `in_progress` / `done`) is committed in git — task progress is traceable via `git log`
- Failed runs post a GitHub comment on the issue with the Actions run URL
- Retry mechanism (up to `retry_max` attempts) with exponential backoff on agent failure

---

## 11. Related C4 Views

- `how/c4/c1-system-context.md` — System context: oneticket-core, developer, GitHub, LLM providers
- `how/c4/c2-containers.md` — Containers: workflows, scripts, opencode CLI, GitHub API, gh-pages
- `how/c4/c3-components.md` — Components: agent-dispatch, launch-fanout, orchestrate, agent-launcher

---

## 12. Related Implementation Slices

- `how/slices/slice-1-dispatch.md` — From GitHub comment to agent prompt
- `how/slices/slice-2-fanout.md` — From manifest to parallel task execution
- `how/slices/slice-3-gather.md` — From completed task to final PR

---

## 13. Technical Constraints

- Node.js >= 20 (ESM modules) — migration to Node 24 planned before GitHub deprecation (June 2026)
- GitHub Actions runner timeout: 6 minutes per job — limits agent session length in V1
- GitHub Actions concurrency: parallel tasks are bounded by Actions plan limits
- `js-yaml` is the only runtime dependency — intentional minimalism
- `anomalyco/opencode` pinned at `v1.15.10` — explicit version control on the LLM invocation action
- `current_project` is a global switch — concurrent multi-project work by multiple developers is not yet supported

---

## 14. Open Questions

| # | Question | Scope |
|---|---|---|
| 1 | Which agent CLIs should have a native runner beyond opencode? | V1 |
| 2 | How should stack detection from `architecture.md` be implemented? | V1 |
| 3 | Should `apps/<current_project>/app/` internal structure be enforced or left to skills? | V1 |
| 4 | How to support concurrent `current_project` switching in multi-developer scenarios? | V1 |
| 5 | Is E2B the right cloud sandbox target for V2, or should Daytona/other options be compared? | V2 |
| 6 | How should agent context persist across multiple cloud sandbox calls? | V2 |
| 7 | What permission and quota model should govern cloud sandbox runs? | V2 |

---

## 15. Architecture Decisions

| Decision | Rationale | Scope |
|---|---|---|
| Orchestration logic in deterministic code only | LLM decisions are non-reproducible — pipeline reliability requires deterministic control flow | All |
| GitHub Actions as V1 runtime | Zero infrastructure overhead, free tier, native GitHub API access, transparent audit trail | V1 |
| Single `manifest.json` DAG per issue | Explicit dependency graph enables parallel execution and ordered GATHER without LLM involvement | V1 |
| `current_project` as global context switch | Single source of truth for path resolution — avoids per-agent configuration drift | V1 |
| `docs_path` and `app_path` resolved in dispatcher | Agents never compute paths — eliminates a class of hallucination errors | V1 |
| Routing/handoff matrix carried by skills | Allows the same knowledge to work in interactive mode (recommendations) and autonomous mode (chained calls) | V1 |
| `OPENCODE_CONFIG_CONTENT` env var injection | No config files written to disk — clean sandbox, no state leakage between runs | V1 |
| `doc-site-static/` as CI artifact only | Keeps the repository lean — generated output has no value in git history | V1 |
| V2 targets isolated cloud sandboxes | GitHub Actions timeout (6min) and cold start (~30s) are structural limits for long-running agentic sessions | V2 |
