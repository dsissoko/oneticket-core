# oneticket-core

GitHub-native autonomous multi-agent framework. Invoke agents by commenting `@role` on any issue — they decompose, execute, and deliver a PR, fully autonomously.


---

## How it works

```
@po build me a Breakout game in vanilla JS
      ↓
  PO decomposes into tasks → manifest
      ↓
  FAN-OUT: workers execute tasks in parallel
      ↓
  GATHER: results merge, dependencies resolved
      ↓
  PR created automatically (direct run or DAG complete)
```

All orchestration is deterministic code — zero LLM in the pipeline logic. LLMs only generate content.

---

## Quick start

### 1. Clone and configure

```bash
git clone https://github.com/dsissoko/oneticket-core.git my-project
cd my-project
```

Edit `.oneticket/config.yml` — the only file you need to configure:

```yaml
# Model used by all agents (opencode/zen models)
# agent_config.opencode.model is the source of truth

cli: opencode
retry_max: 3
orchestrate_retry_max: 5
oneticket_git_user_name: oneticket-bot
oneticket_git_user_email: oneticket-bot@users.noreply.github.com
pr_base: main

agent_config:
  opencode:
    $schema: "https://opencode.ai/config.json"
    model: opencode/claude-haiku-4-5   # ← change this to your preferred model
    share: "disabled"
    autoupdate: false
    disabled_providers: [openai, gemini, anthropic]
    provider:
      opencode:
        options:
          timeout: 900000
          chunkTimeout: 30000
```

### 2. Add GitHub secrets

| Secret | Description |
|---|---|
| `OPENCODE_API_KEY` | Your [opencode.ai/auth](https://opencode.ai/auth) API key |
| `ONETICKET_GH_PAT` | GitHub PAT with `contents:write`, `pull-requests:write`, `issues:write`, `actions:write` |

### 3. Add your agents

Place agent profiles in `.oneticket/agents/`. A profile is a markdown file with APM-compatible frontmatter:

```markdown
---
name: dev
description: Senior developer — implements tasks from specifications
model: opencode/minimax-m2.5
---
You are a senior developer...
```

A default set of agents is included out of the box: `@po`, `@leaddev`, `@dev`, `@architect`, `@qa`, `@analyst`.

### 4. Invoke an agent

Comment `@<role>` on any GitHub issue:

```
@po build a REST API with authentication and user management
```

```
@dev implement the login endpoint from docs/specs/auth.md
```

The framework handles the rest.

---

## Invoking agents

Comment `@<role>` on any GitHub issue. The pipeline detects the role and routes to the corresponding agent profile.

### Deterministic commands (framework)

| Command | Triggers | Effect |
|---|---|---|
| `@po init-doc` | Documentation initialization | Creates the doc structure in `apps/<current_project>/docs/` |
| `@leaddev init-<template>` | App initialization | Bootstraps the app from a template (e.g. `init-appshell`) |

### Agentic conventions (recommended)

| Role | Keyword pattern | Typical use |
|---|---|---|
| `@po create` | Create epic or user story | Requires doc structure already initialized |
| `@po update` | Update existing documentation | Requires existing doc file |
| `@po reverse-doc` | Generate documentation from code | Requires existing codebase |
| `@architect create` | Create architecture + C4 diagrams | Requires product spec |
| `@leaddev <request>` | Decompose into tasks, delegate to @dev | Requires initialized template |
| `@dev create` | Implement a feature | Requires user story from docs |
| `@dev update` | Improve existing feature | Requires existing code |
| `@qa validate` | Review code or documentation | Open PR with changes |

If the agent produces a manifest (DAG of tasks), FAN-OUT/GATHER pipeline executes automatically. If it answers a question directly, it posts a comment and stops.

---

## Adding agents

Create `.oneticket/agents/<role>.agent.md`:

```markdown
---
name: architect
description: Software architect — designs systems and produces ADRs
model: opencode/minimax-m2.5
---
You are a software architect...

## Responsibilities
- Design system architecture
- Produce Architecture Decision Records
- Identify risks and trade-offs

## Constraints
- Never push
- Never create PRs
- Work only on feature/issue-{issue_number}
```

Then invoke with `@architect design the database schema for this feature`.

---

## Pipeline internals

```
.oneticket/
  config.yml          ← single source of truth for all framework parameters
  agents/             ← agent profiles (.agent.md, APM-compatible)
  skills/             ← framework skills (manifest-generation)
  tasks/              ← manifests and task state (created at runtime)

.github/workflows/
  on-issue-comment.yml  ← detects @role, routes to agent-dispatch.mjs
  on-pr-comment.yml     ← detects @role on PR comments
  on-pr-review-comment.yml ← detects @role on inline review comments
  agent-execute.yml     ← single LLM invocation point (anomalyco/opencode)
  on-gather.yml         ← GATHER: merges task branches, routes or creates PR

src/
  constants.mjs         ← framework path constants
  config.mjs            ← loadConfig() — reads .oneticket/config.yml
  agent-dispatch.mjs    ← @role routing → prompt → dispatch
  agent-launcher.mjs    ← FAN-OUT: marks tasks in_progress, dispatches workers
  orchestrate.mjs       ← GATHER: merge, manifest update, routing
  launch-fanout.mjs     ← bootstraps FAN-OUT after manifest creation
  retry-dispatch.mjs    ← retry on anomalyco failure
  generate-config.mjs   ← generates OPENCODE_CONFIG_CONTENT at runtime
  print-config.mjs      ← reads config keys for use in workflows
  utils.mjs             ← shared helpers (git, manifest, dispatch)
```

---

## APM compatibility

Agent profiles use the [APM](https://github.com/microsoft/apm) `.agent.md` format. When you're ready to manage agents from a private repository:

1. Add `apm install` step in `.github/workflows/on-issue-comment.yml`
2. Add `apm install` step in `.github/workflows/agent-execute.yml`
3. Agents from your APM package will be available alongside the built-in ones

---

## Models

Any model available on [opencode.ai/zen](https://opencode.ai/zen) works out of the box — no additional API keys required.

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

---

## Roadmap

| Milestone | Goal |
|---|---|
| **v0.1.0** — released | GitHub-native pipeline fully operational end-to-end |
| **v0.5.0** — current | AppShell + Breakout apps delivered, product-spec stable, pipeline doc aligned |
| **V1** — planned | Routing & handoff matrix, autonomous mode, full-stack skills, APM integration |
| **V2** — planned | Cloud runtime, persistent sandboxes, multi-sandbox fan-out, observability |

> V1 and V2 are planning labels, not SemVer versions. Official releases follow semantic versioning carried by git tags.
