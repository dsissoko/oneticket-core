# oneticket-core

GitHub-native autonomous multi-agent framework. Invoke agents by commenting `@role` on any issue — they decompose, execute, and deliver a PR, fully autonomously.

---

## How it works

```
@po build me a Breakout game in vanilla JS
      ↓
  @po decomposes into tasks → manifest
      ↓
  FAN-OUT: workers execute tasks in parallel
      ↓
  GATHER: results merge, dependencies resolved
      ↓
  PR created automatically
```

All orchestration is deterministic code — zero LLM in the pipeline logic. LLMs only generate content.

---

## Quick start

### 1. Clone and configure

```bash
git clone https://github.com/dsissoko/oneticket-core.git my-project
cd my-project
```

Edit `.oneticket/config.yml`:

```yaml
current_project: my-app          # ← your project name (required — Gate 0)
cli: opencode
retry_max: 3
orchestrate_retry_max: 5
pr_base: main
oneticket_git_user_name: oneticket-bot
oneticket_git_user_email: oneticket-bot@users.noreply.github.com

agent_config:
  opencode:
    $schema: "https://opencode.ai/config.json"
    model: opencode/claude-haiku-4-5   # ← your preferred model
    share: "disabled"
    autoupdate: false
    disabled_providers: [openai, gemini, anthropic]
    provider:
      opencode:
        options:
          timeout: 900000
          chunkTimeout: 30000
```

### 2. Prerequisites

Two secrets are required:

- **opencode.ai account** — credits required for parallel agent runs. Get your API key at [opencode.ai/auth](https://opencode.ai/auth).
- **GitHub PAT** — required because the native `GITHUB_TOKEN` does not trigger downstream workflows. Scopes: `contents:write`, `pull-requests:write`, `issues:write`, `actions:write`.

| Secret | Value |
|---|---|
| `OPENCODE_API_KEY` | Your opencode.ai API key |
| `ONETICKET_GH_PAT` | Your GitHub PAT |

### 3. (Optional) Customize your OneTicket repository

OneTicket is designed to be customized. A few common starting points:

- **Agent behavior** — edit `.oneticket/.apm/instructions/*.instructions.md` to change how agents respond, route, or collaborate
- **Skills** — add a skill catalog in `.oneticket/apm.yml`, or drop a local skill in `.oneticket/skills/<name>/SKILL.md` to override any APM skill by name
- **Model and pipeline** — tune `model`, `retry_max`, `max_tasks`, `autonomous_mode` in `.oneticket/config.yml`

See [Customize OneTicket](#customize-oneticket) for the full list of options.

### 4. Create an issue and invoke an agent

```
@po init-doc
```

The framework handles the rest.

---

## Commands

Use these in order when starting a new project from scratch:

| Command | What it does |
|---|---|
| `@po init-doc` | Initializes the documentation structure (`what/`, `how/`, `ship/`, `run/`) |
| `@po <describe your product>` | Generates product-spec, epics, user stories |
| `@architect create` | Generates architecture.md, C4 diagrams, implementation slices |
| `@leaddev init-<template>` | Bootstraps the app from a template (e.g. `@leaddev init-appshell`) |
| `@leaddev <implement request>` | Decomposes into tasks, triggers FAN-OUT, delivers a PR |
| `@dev <request>` | Implements directly on the feature branch (no decomposition) |
| `@qa validate` | Reviews a PR — code quality, spec conformance, test coverage |
| `@po reverse-doc <scope>` | Synchronizes documentation with existing code |

Any `@role` comment on a GitHub issue or PR triggers the pipeline.
If the agent produces a manifest → FAN-OUT/GATHER starts automatically.
If it answers a question → it posts a comment and stops.

---

## Happy Path

### From scratch — 4 tickets

#### Ticket 1 — Initialize documentation
Comment: `@po init-doc`
→ PR opened with the documentation structure.
Iterate with `@po update` comments if needed. Merge when ready.

#### Ticket 2 — Generate product knowledge and architecture
Comment: `@po <describe your product, its users, and main features>`
→ PR opened with product-spec, epics, user stories, architecture, C4 diagrams, slices.
Iterate with `@po update` comments on the ticket or PR. Merge when ready.

#### Ticket 3 — Bootstrap the app scaffold (optional)
Comment: `@leaddev init-<template>`
→ PR opened with the app scaffold.
Merge before proceeding — Ticket 4 builds on this.

#### Ticket 4 — Implement the app
Comment: `@leaddev implement the app following the slices in docs/how/slices/`
→ PR opened when all tasks complete (FAN-OUT/GATHER).
Iterate with `@dev fix` or `@qa validate` comments on the PR. Merge → app in production.

---

### From existing code — 2 tickets

#### Ticket 1 — Initialize and generate documentation from code
Comment: `@po reverse-doc <describe what to document>`
→ PR opened with inferred product-spec, epics, user stories, architecture, C4 diagrams, slices.

#### Ticket 2 — Refine documentation
Comment: `@po update <what to refine>`
→ PR opened with targeted updates.
Iterate until documentation reflects the codebase accurately. Merge when ready.

---

## Customize OneTicket

OneTicket is designed to be fully customizable. Here are the main axes:

| What | Where |
|---|---|
| **Project config** — model, retries, project name, git identity | `.oneticket/config.yml` |
| **Agent profiles** — role identity, responsibilities, skill routing | `.oneticket/agents/<role>.agent.md` |
| **Add custom skills** — domain knowledge loaded by agents at runtime | 1. **APM catalog** (versioned, shared): add repo in `.oneticket/apm.yml` → `dependencies.apm` — installed into `.agents/skills/` at runtime<br>2. **Local** (private, takes precedence): drop `<name>/SKILL.md` in `.oneticket/skills/` — copied into `.agents/skills/` before APM, overrides any same-named external skill |
| **Agent instructions** — shared cross-agent rules (team, routing, mode) | `.oneticket/.apm/instructions/*.instructions.md` |
| **Documentation template** — base structure copied by `init-doc` | `.oneticket/templates/docs/` |
| **App templates** — scaffold copied by `@leaddev init-<template>` | `apps/<template>/app/` |
| **Pipeline parameters** — max tasks, retry policy, cleanup | `.oneticket/config.yml` |
| **Doc site** — Astro Starlight, rendered from `apps/<project>/docs/` | `doc-site/` |

---

## Pipeline internals

```
.oneticket/
  config.yml            ← single source of truth for all framework parameters
  agents/               ← local agent profiles (.agent.md)
  skills/               ← local framework skills
  apm.yml               ← APM dependencies (oneticket-skills catalog)
  templates/docs/       ← documentation structure template (init-doc)
  tasks/                ← manifests and task state (runtime only)

.github/workflows/
  on-issue-comment.yml       ← detects @role on issues, routes to agent-dispatch.mjs
  on-pr-comment.yml          ← detects @role on PR comments
  on-pr-review.yml           ← detects @role on PR review submission
  agent-execute.yml          ← single LLM invocation point (anomalyco/opencode)
  on-fanout.yml              ← FAN-OUT: dispatches ready tasks in parallel
  on-gather.yml              ← GATHER: merges task branches, routes or creates PR
  docs-site-github-pages.yml ← builds and deploys doc site + app to GitHub Pages
  release-please.yml         ← automated changelog and version bump

src/
  agent-dispatch.mjs         ← @role routing → prompt construction → dispatch
  agent-launcher.mjs         ← FAN-OUT: marks tasks in_progress, dispatches workers
  orchestrate.mjs            ← GATHER: merge, manifest update, PR management
  launch-fanout.mjs          ← bootstraps FAN-OUT after manifest creation
  dispatch-fanout.mjs        ← triggers on-fanout.yml when manifest detected
  dispatch-gather.mjs        ← triggers on-gather.yml from task branches
  dispatch-review-agents.mjs ← dispatches agents for PR review threads
  create-pr.mjs              ← PR creation, label cycling, deploy retrigger
  check-prerequisites.mjs    ← Gate 0 (current_project) + init-doc if missing
  ensure-issue-branch.mjs    ← creates feature/issue-N if absent (idempotent)
  init-doc.mjs               ← copies doc template to docs_path (idempotent)
  init-template.mjs          ← copies app template to apps/<project>/app/
  notify-agent-failure.mjs   ← posts failure comment + labels on agent error
  retry-dispatch.mjs         ← exponential backoff retry on agent failure
  build-context.mjs          ← fetches comment history for prompt context
  generate-config.mjs        ← generates OPENCODE_CONFIG_CONTENT at runtime
  utils.mjs                  ← shared helpers (git, manifest, labels, dispatch)
  config.mjs                 ← loadConfig() — reads .oneticket/config.yml
  constants.mjs              ← framework path constants
```

---

## Models

Any model available on [opencode.ai/zen](https://opencode.ai/zen) works out of the box.

| Model | ID |
|---|---|
| MiniMax M2.5 | `opencode/minimax-m2.5` |
| Claude Haiku 4.5 | `opencode/claude-haiku-4-5` |
| Claude Sonnet 4.5 | `opencode/claude-sonnet-4-5` |
| Kimi K2.5 | `opencode/kimi-k2.5` |
| GPT 5.4 Mini | `opencode/gpt-5.4-mini` |

Full list: `https://opencode.ai/zen/v1/models`

---

## Requirements

- GitHub repository with Actions enabled
- [opencode.ai](https://opencode.ai) account (free tier available)
- GitHub PAT with repo + actions write permissions
- Read access to [dsissoko/oneticket-skills](https://github.com/dsissoko/oneticket-skills)

---

## Roadmap

| Milestone | Goal |
|---|---|
| **v0.1.0** — released | GitHub-native pipeline fully operational end-to-end |
| **v0.5.0** — released | AppShell + Breakout delivered, product-spec stable, pipeline doc aligned |
| **v0.6.0** — current | reverse-doc, label flow, 50 skills catalog, MonJournal app delivered |
| **V1** — planned | Routing & handoff matrix, autonomous mode, full-stack skills, APM integration |
| **V2** — planned | Cloud runtime, persistent sandboxes, multi-sandbox fan-out, observability |

> V1 and V2 are planning labels, not SemVer versions. Official releases follow semantic versioning carried by git tags.
