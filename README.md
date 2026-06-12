# oneticket-core

GitHub-native autonomous multi-agent framework. Invoke agents by commenting `@role` on any issue — they decompose, execute, and deliver a PR, fully autonomously.

**v1 scope** — OneTicket currently generates and deploys **Node.js frontend apps** to GitHub Pages, alongside their structured documentation. Both are live on every PR. No backend, no other stack — that's on the roadmap.

---

## How it works

```
@po build me a Breakout game in vanilla JS
      ↓
  @po decomposes into tasks → manifest
      ↓
  FAN-OUT: tasks execute sequentially by default (add --parallel for FAN-OUT)
      ↓
  GATHER: results merge, dependencies resolved
      ↓
  PR created automatically
```

All orchestration is deterministic code — zero LLM in the pipeline logic. LLMs only generate content. Agent behavior is guided by 50+ skills available via [dsissoko/oneticket-skills](https://github.com/dsissoko/oneticket-skills) — architecture, [C4](https://c4model.com), epics, user stories, frontend stack, testing, and more.

### What's in the PR

Every PR contains two artifacts, both instantly accessible via a live preview:

**Structured documentation** — four sections, generated and kept in sync with the code:
- `what/` — product vision, epics, user stories
- `how/` — architecture, [C4 diagrams](https://c4model.com/diagrams), implementation sprints, ADRs
- `ship/` — CI/CD, deployment
- `run/` — operational runbooks

**A deployable frontend app** — built and pushed to GitHub Pages on every PR.

The pipeline posts two live URLs directly in the PR comment:

```
📖 Doc preview:  https://dsissoko.github.io/oneticket-core/{project}/pr/{N}/docs/
🚀 App preview:  https://dsissoko.github.io/oneticket-core/{project}/pr/{N}/app/
```

**Live examples** — all built by OneTicket:

| Project | Doc | App | Models | External debug |
|---|---|---|---|---|
| MonJournal — *personal journal, tags, timeline, surprise* | [docs](https://dsissoko.github.io/oneticket-core/monjournal/docs/) | [app](https://dsissoko.github.io/oneticket-core/monjournal/app/) | claude-haiku-4-5 | — |
| Breakout — *classic arcade, vanilla JS, no dependencies* | [docs](https://dsissoko.github.io/oneticket-core/breakout/docs/) | [app](https://dsissoko.github.io/oneticket-core/breakout/app/) | claude-haiku-4-5 | — |
| SpaceInvaders — *retro shooter, ECS architecture* | [docs](https://dsissoko.github.io/oneticket-core/spaceinvaders/docs/) | [app](https://dsissoko.github.io/oneticket-core/spaceinvaders/app/) | qwen3.6-plus, claude-haiku-4-5 | — |
| AppShell — *the reusable scaffold, bootstrap any project with `@leaddev init-appshell`* | [docs](https://dsissoko.github.io/oneticket-core/appshell/docs/) | [app](https://dsissoko.github.io/oneticket-core/appshell/app/) | claude-haiku-4-5 | — |
| Flashcards — *17 themes: world capitals, solfège, multiplications, conjugations and more* | [docs](https://dsissoko.github.io/oneticket-core/flashcards/docs/) | [app](https://dsissoko.github.io/oneticket-core/flashcards/app/) | minimax-m2.5, claude-haiku-4-5, claude-sonnet-4-6 | ✋ |
| OneTicket — *partially built by itself* | [docs](https://dsissoko.github.io/oneticket-core/framework/docs/) | — | claude-haiku-4-5, claude-sonnet-4-6 | ✋ |

> ✋ *External debug — required human or stronger model intervention to fix issues*

---

## Prerequisites

- **opencode.ai account** — Agent runs are powered by [anomalyco/opencode](https://github.com/anomalyco/opencode) — a remarkably capable agentic CLI that executes tasks directly in the CI sandbox. A generic CLI option is planned for a future release. Get your API key at [opencode.ai/auth](https://opencode.ai/auth). A free model (MiniMax) is available, but a higher-quality model is recommended — expect to build a full app for under $10.
- **GitHub PAT** — scopes: `contents:write`, `pull-requests:write`, `issues:write`, `actions:write`
- **GitHub Pages** — must be enabled on your repository

---

## Quick start

### 1. Create your repository

Click **[Use this template](https://github.com/dsissoko/oneticket-core)** to create your own repository, then edit `.oneticket/config.yml` directly on GitHub and set your project name:

```yaml
current_project: my-app   # ← your project name
```

Your live URLs will be:

```
📖 Doc (prod):        https://<user>.github.io/<repo>/my-app/docs/
🚀 App (prod):        https://<user>.github.io/<repo>/my-app/app/

📖 Doc (PR preview):  https://<user>.github.io/<repo>/my-app/pr/{N}/docs/
🚀 App (PR preview):  https://<user>.github.io/<repo>/my-app/pr/{N}/app/
```

> One repository is enough for all your projects — just change `current_project` to switch context and start working on a new app.

### 2. Meet the prerequisites

In your repository **Settings → Secrets and variables → Actions**, add:

1. `OPENCODE_API_KEY` — your API key from [opencode.ai/auth](https://opencode.ai/auth)
2. `ONETICKET_GH_PAT` — a GitHub PAT with scopes `contents:write`, `pull-requests:write`, `issues:write`, `actions:write` — create one in your profile **Settings → Developer settings → Personal access tokens** ([github.com/settings](https://github.com/settings))
3. (Optional but recommended) Enable automatic branch deletion — **Settings → General → Pull Requests → Automatically delete head branches** — keeps your repository clean as feature and task branches accumulate fast.

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

This creates the documentation structure and triggers the first deploy, which creates the `gh-pages` branch.

Once it completes, enable GitHub Pages — **Settings → Pages → Source → Deploy from a branch → gh-pages / root**

Then re-trigger the doc site by removing then re-adding the `ready for review` label on the PR created by `@po init-doc`.

The framework handles the rest.

---

## Commands

| Command | What it does |
|---|---|
| `@po init-doc` | Initializes the documentation structure (`what/`, `how/`, `ship/`, `run/`) |
| `@po <describe your product>` | Generates product-spec, epics, user stories |
| `@po plan-sprint` | Plans a sprint — selects US from backlog, creates sprint.md + GitHub Milestone |
| `@po close-sprint` | Closes a sprint — velocity summary, closes GitHub Milestone |
| `@architect create` | Generates architecture.md, [C4 diagrams](https://c4model.com/diagrams) — also completes Technical Notes in sprints and authors ADRs |
| `@leaddev init-<template>` | Bootstraps the app from a template (e.g. `@leaddev init-appshell`) |
| `@leaddev <implement request>` | Decomposes into tasks, executes sequentially by default — delivers a PR. Add `--parallel` to enable FAN-OUT parallel execution (faster, but merge conflicts possible) |
| `@dev <request>` | Implements directly on the feature branch (no decomposition) |
| `@qa validate` | Reviews a PR — code quality, spec conformance, test coverage |
| `@po reverse-doc <scope>` | Synchronizes documentation with existing code |

Any `@role` comment on a GitHub issue or PR triggers the pipeline.
If the agent produces a manifest → tasks execute and a PR is delivered automatically.
If it answers a question → it posts a comment and stops.

---

## Happy Path

### From scratch — 4 tickets

#### Ticket 1 — Full documentation *(one-shot)*
Comment: `@po init-doc` then `@po <vision>`
→ FAN-OUT manifest: product-spec, epics, US, architecture, C4 — delivered in one pass.
Iterate with `@po update` / `@architect update` / `@analyst update` as needed. Merge when ready.

#### Ticket 2 — Sprint Planning *(each sprint)*
Comment: `@po plan-sprint`
→ sprint.md created with selected US + cross-references + GitHub Milestone.
Comment: `@architect` (on same issue)
→ `## Technical Notes` completed in sprint.md.
Merge when ready.

#### Ticket 3 — Sprint Execution *(each sprint)*
Comment: `@leaddev init-<template>` (optional — first Sprint Execution only)
→ PR opened with app scaffold. Merge before proceeding.
Comment: `@leaddev implement`
→ Reads `docs/how/sprints/sprint-N/sprint.md` — tasks execute sequentially by default — PR opened when all tasks complete.
Add `--parallel` to enable FAN-OUT/GATHER for faster execution.
Iterate with `@dev fix` or `@qa validate` comments on the PR. Merge → app in production.

#### Ticket 4 — Sprint Review *(each sprint)*
Comment: `@po close-sprint`
→ Velocity summary posted, GitHub Milestone closed.

> Issues 2→3→4 repeat each sprint.

---

### From existing code — 2 tickets

#### Ticket 1 — Initialize and generate documentation from code
Comment: `@po reverse-doc <describe what to document>`
→ PR opened with inferred product-spec, epics, user stories, architecture, C4 diagrams, sprints.

#### Ticket 2 — Refine documentation
Comment: `@po update <what to refine>`
→ PR opened with targeted updates.
Iterate until documentation reflects the codebase accurately. Merge when ready.

> Once your documentation reflects the codebase accurately, you are set to go to **Ticket 2 — Sprint Planning**.

---

## Customize OneTicket

OneTicket is designed to be fully customizable. Here are the main axes:

| What | Where |
|---|---|
| **Project config** — model, retries, project name, git identity | `.oneticket/config.yml` |
| **Agent profiles** — built-in profiles (po, architect, leaddev, dev, qa, analyst) are managed via APM — do not modify them directly. Add custom agents by dropping a new `<role>.agent.md` in `.oneticket/agents/` | `.oneticket/agents/<role>.agent.md` |
| **Add custom skills** — domain knowledge loaded by agents at runtime | 1. **APM catalog** (versioned, shared): add repo in `.oneticket/apm.yml` → `dependencies.apm` — installed into `.agents/skills/` at runtime<br>2. **Local** (private, takes precedence): drop `<name>/SKILL.md` in `.oneticket/skills/` — copied into `.agents/skills/` before APM, overrides any same-named external skill |
| **Agent instructions** — shared cross-agent rules (team, routing, mode) | `.oneticket/.apm/instructions/*.instructions.md` |
| **Documentation template** — base structure copied by `init-doc` | `.oneticket/templates/docs/` |
| **App templates** — scaffold copied by `@leaddev init-<template>` | `apps/<template>/app/` |
| **Pipeline parameters** — max tasks, retry policy, cleanup | `.oneticket/config.yml` |
| **Doc site** — Astro Starlight, rendered from `apps/<project>/docs/` | `doc-site/` |
| **Deployment** — change build stack or deploy target | Replace `build-app` job in `docs-site-github-pages.yml` for a different stack — add a parallel `deploy-*.yml` workflow to target Vercel, Railway, or any VPS without touching the existing workflow |

---

## Merge conflicts

By default, `@leaddev implement` runs tasks sequentially — no merge conflicts possible.

Add `--parallel` to enable FAN-OUT parallel execution (faster, but merge conflicts possible when two tasks modify the same file). If that happens, the pipeline stops cleanly and labels the issue `merge error` — nothing is lost.

Recovery: see the [Merge Conflict Recovery runbook](.oneticket/docs/run/merge-recovery.md).

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
  oneticket-install.mjs      ← pre-run setup: --apm-only (before apm install) copies apm.yml + .apm/ — --skills-only (after apm compile) copies local skills, overrides APM skills by name
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

Full list: `https://opencode.ai/zen/v1/models`

### Tested models

| Model | Manifest generation | Notes |
|---|---|---|
| `opencode/claude-sonnet-4-6` | ✅ | Current — recommended |
| `opencode/claude-haiku-4-5` | ✅ | Validated in prod, lighter |
| `opencode/qwen3.6-plus` | ✅ | Validated in prod |
| `opencode/minimax-m2.5` | ✅ | Validated in prod |
| `opencode/deepseek-v4-pro` | ❌ | Loops indefinitely on manifest generation, never writes the file |
| `opencode/qwen3.6-plus-free` | ⚠️ | Intermittent — model sometimes unavailable or too slow (upstream idle timeout) |
| `opencode/nemotron-3-ultra-free` | ⚠️ | Intermittent — upstream idle timeout exceeded (~6min), prefer paid model |

---

## Roadmap

| Milestone | Goal |
|---|---|
| **v0.1.0** — released | GitHub-native pipeline fully operational end-to-end |
| **v0.5.0** — released | AppShell + Breakout delivered, product-spec stable, pipeline doc aligned |
| **v0.6.0** — released | reverse-doc, label flow, 50 skills catalog, MonJournal app delivered, APM integration live |
| **v0.7.0** — current | Sprints replace slices, rogue branch prevention, sequential execution by default (`--parallel` opt-in), `@role` restricted to collaborators |
| **V1** — planned | Routing & handoff matrix, autonomous mode, full-stack skills |
| **V2** — planned | Cloud runtime, persistent sandboxes, multi-sandbox fan-out, observability |

> V1 and V2 are planning labels, not SemVer versions. Official releases follow semantic versioning carried by git tags.
