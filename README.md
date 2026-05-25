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
    model: opencode/minimax-m2.5   # ← change this to your preferred model
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

A default `@po` (Product Owner) agent is included out of the box.

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

Any comment starting with `@<role>` on a GitHub issue triggers the pipeline.

| Comment | What happens |
|---|---|
| `@po <request>` | PO analyzes, decomposes into tasks, triggers FAN-OUT |
| `@dev <request>` | Dev implements directly on the feature branch |
| `@<any role> <request>` | Routes to the corresponding agent profile |

If the agent produces a manifest, the FAN-OUT/GATHER pipeline starts automatically. If it answers a question, it posts a comment and stops.

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
  agent-execute.yml     ← single LLM invocation point (anomalyco/opencode)
  on-task-push.yml      ← GATHER: merges task branches, routes or creates PR

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

### V1 — GitHub-native runtime (current)

oneticket-core runs entirely inside GitHub Actions. Every agent invocation, task execution, and merge is a GitHub Actions workflow run. The infrastructure is free, transparent, and requires zero setup beyond a repository.

**Constraints of V1:**
- Execution time limited by GitHub Actions runner timeouts
- No persistent context between agent runs
- Parallel tasks limited by Actions concurrency
- Cold start on every invocation (~30s)

### V2 — Cloud runtime (planned)

V2 will run agent sessions in dedicated cloud sandboxes (E2B or equivalent).

**What V2 unlocks:**
- Long-running agent sessions without timeout constraints
- Persistent context and file system across steps
- Richer execution environments (databases, services, browsers)
- Faster cold starts and lower latency
- More autonomous multi-agent workflows

The oneticket-core concepts remain identical across runtimes — agents, profiles, skills, manifests, FAN-OUT/GATHER. Only the execution layer changes.
