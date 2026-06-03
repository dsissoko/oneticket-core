# OneTicket Workflow Specification

| Field     | Value                                                                                                                                               |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Version   | 1.0.0                                                                                                                                               |
| Status    | ☑ draft  ☐ review  ☐ stable                                                                                                                         |
| Author    | @dsissoko                                                                                                                                           |
| Date      | 2026-06-03                                                                                                                                          |
| Changelog | 1.0.0 — target architecture spec for pipeline v2 — describes is_fanout_task, dispatch-fanout.mjs, on-fanout.yml, branch_base removal, create-direct-pr.mjs removal |

---

## 1. Vision

OneTicket is a GitHub-native multi-agent collaboration framework. It provides the orchestration model, the agent profiles, and the skill catalog that let a team and its agents build software together — from product intent to reviewable change.

Four macro-capabilities define the product:

**1. Task orchestration** — Certain agent roles have the ability to decompose a request into subtasks and assign them to specialized agents. Results are gathered, dependencies resolved, and the feature branch is ready for review.

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
| **Task decomposition** | Decomposer agents (e.g. `@leaddev`) break requests into a manifest DAG | ✅ v0.1.0 |
| **FAN-OUT execution** | Ready tasks dispatched in parallel to worker agents | ✅ v0.1.0 |
| **GATHER and merge** | Completed task branches merged sequentially, dependencies resolved | ✅ v0.1.0 |
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

## 10. Success Criteria

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
| **v0.5.0** — released | AppShell + Breakout apps, product-spec stable, pipeline doc aligned | GitHub-native pipeline fully operational end-to-end |
| **V1** — planned | Routing & handoff matrix, autonomous mode, full-stack skills, APM integration, deployment skills | Complete agentic team operating autonomously on bounded scenarios |
| **V2** — planned | Cloud runtime, persistent sandboxes, multi-sandbox fan-out, observability | Long-running agent sessions without GitHub Actions constraints |

> Macro-versions V1 and V2 are planning labels, not SemVer versions. Official releases follow semantic versioning — `v0.1.0`, `v0.2.0`, `v1.0.0`, etc. — carried by git tags. Documentation is a snapshot of the repository state at each tag.

---

## 13. Pipeline Architecture

Cette section présente uniquement les workflows GitHub structurants et les scripts principaux qu'ils utilisent.

### Entrées GitHub

```text
on-issue-comment.yml
  → ensure-issue-branch.mjs    (crée feature/issue-N si absente — idempotent)
  → check-prerequisites.mjs    (Gate 0 current_project, init-doc si structure documentaire absente)
  → build-context.mjs          (fetche historique commentaires, formate le contexte prompt)
  → agent-dispatch.mjs         (résout docs_path/app_path, construit prompt, label in progress, dispatche agent-execute.yml)

on-pr-comment.yml
  → build-context.mjs          (fetche historique commentaires PR, formate le contexte prompt)
  → agent-dispatch.mjs         (résout docs_path/app_path, construit prompt, dispatche agent-execute.yml)

on-pr-review-comment.yml
  → build-context.mjs          (fetche diff hunk, ligne, fichier, formate le contexte prompt)
  → agent-dispatch.mjs         (résout docs_path/app_path, construit prompt, dispatche agent-execute.yml)
```

### Exécution agentique

```text
agent-execute.yml
  → oneticket-install.mjs      (copie skills .oneticket/skills/ → .agents/skills/)
  → generate-config.mjs        (génère config opencode depuis config.yml → OPENCODE_CONFIG_CONTENT)
  → anomalyco/opencode         (exécute l'agent — seul step non déterministe)
  → retry-dispatch.mjs         (backoff exponentiel + jitter, label blocked à épuisement)
  → push déterministe de la branche de travail
  → dispatch-fanout.mjs        (si manifest présent — déclenche on-fanout.yml)
  → dispatch-gather.mjs        (si sous-branche task/* — déclenche on-gather.yml)
```

### Interface de `agent-execute.yml`

| Input | Type | Valorisé par | Description |
|---|---|---|---|
| `branch` | string | `agent-dispatch.mjs` ou `agent-launcher.mjs` | Branche de travail (`feature/issue-N` ou `task/issue-N-X`) |
| `issue_number` | string | `agent-dispatch.mjs` ou `agent-launcher.mjs` | Numéro d'issue GitHub |
| `is_fanout_task` | boolean | `agent-launcher.mjs` → `true`, `agent-dispatch.mjs` → `false` | Signal : task FAN-OUT ou invocation directe |
| `prompt` | string | `agent-dispatch.mjs` ou `agent-launcher.mjs` | Prompt système complet injecté dans anomalyco |
| `model` | string | `config.yml` via `agent-dispatch.mjs` | Modèle LLM à utiliser |
| `role` | string | `agent-dispatch.mjs` | Profil agent optionnel (dev, architect, analyst...) |
| `retry_count` | string | `retry-dispatch.mjs` | Nombre de tentatives courantes |
| `retry_max` | string | `config.yml` | Maximum de tentatives autorisées |

### Fan-out

```text
on-fanout.yml  (déclenché par dispatch-fanout.mjs via workflow_dispatch)
  inputs :
    issue_number  — numéro d'issue GitHub
  → launch-fanout.mjs          (setup git, checkout feature/issue-N, lit le manifest)
  → agent-launcher.mjs         (crée task/issue-N-X via API GitHub, dispatche N × agent-execute.yml par batch)
```

### Fan-in

```text
on-gather.yml  (déclenché par dispatch-gather.mjs via workflow_dispatch)
  inputs :
    task_branch  — ex: task/issue-42-A
    branch_base  — ex: feature/issue-42 (calculable depuis task_branch)
  → validate-task-branch.mjs   (guard cross-issue : task/issue-N-X → feature/issue-N uniquement)
  → orchestrate.mjs            (merge task/*, retry optimiste 5x, update manifest, barre progression, ferme task PR, supprime task branch, calcul DAG)
  → agent-launcher.mjs         (dispatche les tasks READY suivantes)
```

### Initialisation de projet

Ces opérations sont déterministes — jamais agentiques. Invoquées par le pipeline ou explicitement par l'utilisateur.

```text
check-prerequisites.mjs <docs_path>
  → appelé par on-issue-comment.yml avant chaque run agentique
  → Gate 0 : vérifie que current_project est défini — sinon notifie et stoppe
  → init-doc : vérifie que docs_path contient la structure standard
               si absente → copie .oneticket/templates/docs/ vers docs_path (idempotent)
  → extensible : d'autres pré-requis déterministes peuvent être ajoutés ici

init-template.mjs <template>
  → déclenché par l'utilisateur via @leaddev init-<template> (ex: @leaddev init-appshell)
  → copie apps/<template>/app/ vers apps/<current_project>/app/
  → personnalise les placeholders (package.json, index.html, écrans)
  → idempotent — si apps/<current_project>/app/ existe déjà, skip
  → templates disponibles : appshell (React+Vite), ...
  → note : la décision d'utiliser un template reste agentique
           (@leaddev détecte la stack et recommande le template adapté)
```

---

### 13.6 Script reference

### Scripts d'entrée

| Script | Contenu fonctionnel |
|---|---|
| `ensure-issue-branch.mjs` | Crée `feature/issue-N` si absente — idempotent |
| `check-prerequisites.mjs` | Gate 0 (`current_project`), init-doc si structure documentaire absente — extensible |
| `build-context.mjs` | Fetche l'historique des commentaires GitHub (max 10, tronqués à 500 chars), formate le bloc de contexte injecté dans le prompt |
| `agent-dispatch.mjs` | Résout `docs_path`/`app_path`/`current_project`, construit le prompt système (profil agent, contexte projet, contract), applique label `in progress`, dispatche `agent-execute.yml` |

### Scripts d'exécution agentique

| Script | Contenu fonctionnel |
|---|---|
| `oneticket-install.mjs` | Copie les skills `.oneticket/skills/` → `.agents/skills/` et `AGENTS.md` avant chaque run — opencode les découvre nativement |
| `generate-config.mjs` | Génère la config JSON opencode depuis `agent_config.<cli>` dans `config.yml` — injecté via `OPENCODE_CONFIG_CONTENT` |
| `retry-dispatch.mjs` | Re-dispatche `agent-execute.yml` avec backoff exponentiel + jitter (`2^n * 1000ms + [0,500ms]`) — applique label `blocked` à épuisement de `retry_max` |

### Scripts Fan-out

| Script | Contenu fonctionnel |
|---|---|
| `dispatch-fanout.mjs` | Envoie le signal `workflow_dispatch` vers `on-fanout.yml` quand un manifest est détecté |
| `launch-fanout.mjs` | Setup git, checkout `feature/issue-N`, lit le manifest, délègue à `agent-launcher.mjs` |
| `agent-launcher.mjs` | Identifie les tasks ready (DAG), marque `in_progress`, crée les branches `task/issue-N-X` via API GitHub, dispatche N × `agent-execute.yml` par batch de 4 avec délai anti-annulation (2s entre dispatches) |

### Scripts Fan-in

| Script | Contenu fonctionnel |
|---|---|
| `dispatch-gather.mjs` | Envoie le signal `workflow_dispatch` vers `on-gather.yml` depuis les sous-branches task/* |
| `validate-task-branch.mjs` | Guard cross-issue : vérifie que `task/issue-N-X` appartient bien à `feature/issue-N` — rejette tout mismatch de numéro d'issue |
| `orchestrate.mjs` | Merge `task/*` → `feature/issue-N` avec retry optimiste (5 tentatives, backoff exponentiel), marque task `done` ou `merge-failed`, poste barre de progression sur l'issue, ferme la task PR, supprime la task branch, calcul DAG, délègue à `agent-launcher.mjs` |

### Scripts d'initialisation

| Script | Contenu fonctionnel |
|---|---|
| `init-doc.mjs` | Copie `.oneticket/templates/docs/` vers `<docs_path>` — idempotent, ne réécrase pas les fichiers existants. Appelé par `check-prerequisites.mjs`, jamais par un agent |
| `init-template.mjs` | Copie `apps/<template>/app/` vers `apps/<current_project>/app/`, personnalise les placeholders — idempotent. Déclenché sur décision agentique confirmée par l'utilisateur |

### Scripts utilitaires (transverses)

| Script | Contenu fonctionnel |
|---|---|
| `constants.mjs` | Source de vérité des chemins réservés du framework — aucune dépendance |
| `config.mjs` | Lit et parse `.oneticket/config.yml`, expose `loadConfig()` |
| `utils.mjs` | Shell (`run`, `runWithRetry`), git (`setupGit`), manifest (`readManifest`, `writeManifest`), DAG (`areDependenciesSatisfied`), GitHub API (`dispatchWorkflow`, `applyLabel`, `removeLabel`, `createBranch`) — `createBranch(branchName, fromBranch, repo, token)` : POST /repos/{repo}/git/refs, idempotent |
| `print-config.mjs` | Wrapper CLI de `config.mjs` — permet aux workflows YAML de lire une valeur de config sans code inline |

---

### 13.7 Labels and signals

| Label | Posé par | Retiré par | Signification |
|---|---|---|---|
| `in progress` | `agent-dispatch.mjs` | `orchestrate.mjs` (quand tout DONE) | Un run agentique est en cours sur cette issue |
| `merge error` | `orchestrate.mjs` | Manuel | Une task branch n'a pas pu être mergée — intervention humaine requise |
| `blocked` | `retry-dispatch.mjs` | Manuel | L'agent a épuisé ses tentatives de retry |
| `ready for review` | — | — | Décision user — jamais posé automatiquement |

> La PR finale est une décision user — jamais créée automatiquement par le pipeline.

---

### 13.8 Robustness

- **`notify-failure`** — tous les workflows (`on-issue-comment`, `on-pr-comment`, `on-pr-review-comment`, `agent-execute`, `on-gather`) ont un job `notify-failure` qui poste un commentaire sur l'issue en cas d'échec définitif du workflow
- **Retry optimiste manifest** — `orchestrate.mjs` gère les conflits d'accès concurrent au manifest via reset hard + re-fetch + re-merge (5 tentatives max, `orchestrate_retry_max` dans `config.yml`)
- **Exclude sandbox artefacts** — `agent-execute.yml` injecte `.agents/`, `.opencode/`, `opencode.json` dans `.git/info/exclude` pour que l'agent ne les commite pas accidentellement
- **Guard cross-issue** — `validate-task-branch.mjs` empêche toute task branch de merger dans une feature branch d'une autre issue

---

### 13.9 Manifest structure

Le manifest est le contrat entre `@leaddev` et le pipeline d'exécution. Il est produit par l'agent et jamais modifié par un autre agent — uniquement par les scripts déterministes (`orchestrate.mjs`, `agent-launcher.mjs`).

### Format

```json
{
  "issue": 42,
  "tasks": [
    {
      "id": "A",
      "branch": "task/issue-42-A",
      "file": "src/screens/GameScreen.tsx",
      "content": "Instruction complète et autosuffisante pour l'agent exécuteur...",
      "role": "dev",
      "depends_on": [],
      "status": "pending"
    }
  ]
}
```

### Champs

| Champ | Type | Contrainte |
|---|---|---|
| `issue` | entier | Numéro d'issue GitHub exact |
| `tasks` | tableau | Non vide — max `max_tasks` (config.yml) |
| `id` | string | Lettre(s) majuscule(s) unique — A, B, C... |
| `branch` | string | Convention stricte : `task/issue-N-X` |
| `file` | string | Chemin relatif depuis la racine du repo — pas de `/` initial |
| `content` | string | Instruction autosuffisante — l'agent n'a pas d'autre contexte |
| `role` | string | Optionnel — `dev`, `architect`, `analyst`... |
| `depends_on` | tableau | Ids existants dans ce manifest — `[]` si aucune dépendance |
| `status` | string | `pending` \| `in_progress` \| `done` \| `merge-failed` |

> `branch_base` est absent du manifest — c'est un paramètre calculable depuis `issue_number`.

---

### 13.10 Configuration — `.oneticket/config.yml`

Source de vérité unique des paramètres du framework. Lue par `config.mjs` et injectée dans les scripts et les workflows.

| Paramètre | Rôle dans le pipeline |
|---|---|
| `current_project` | Détermine `docs_path` et `app_path` — vérifié par `check-prerequisites.mjs` (Gate 0) |
| `model` | Modèle LLM utilisé par anomalyco — extrait de `agent_config.<cli>.model` |
| `max_tasks` | Limite le nombre de tasks dans un manifest |
| `retry_max` | Nombre max de retries agent dans `retry-dispatch.mjs` |
| `orchestrate_retry_max` | Nombre max de retries optimistes dans `orchestrate.mjs` |
| `clear_session_cache` | Vide le cache de session opencode avant chaque run |
| `pr_base` | Branche cible des PRs finales (ex: `main`) |
| `oneticket_git_user_name` | Identité git du bot CI |
| `oneticket_git_user_email` | Email git du bot CI |

---

### 13.11 Macro view (Mermaid)

```mermaid
flowchart TD

    subgraph AMONT["Amont — Déclenchement"]
        ISSUE["on-issue-comment.yml"]
        PR["on-pr-comment.yml"]
        REVIEW["on-pr-review-comment.yml"]
    end

    subgraph EXEC_BOX["Exécution agentique"]
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

    EXEC -->|"Échec"| RETRY["Retry / Blocked"]
    RETRY -->|"retry_count < max"| EXEC

    EXEC -->|"Succès"| PUSH["Push déterministe"]

    PUSH --> ISFANOUT{"is_fanout_task ?"}

    ISFANOUT -->|"Oui — Task terminée"| GATHER
    ISFANOUT -->|"Non"| MANIFESTCHECK{"Manifest produit ?"}

    MANIFESTCHECK -->|"Oui — Manifest produit"| FANOUT
    MANIFESTCHECK -->|"Non — Run direct"| END_SIMPLE["FIN"]

    FANOUT -->|"N tasks"| EXEC

    GATHER -->|"merge OK + tasks ready"| FANOUT
    GATHER -->|"merge OK + tout done"| DONE["FIN — DAG terminé"]
    GATHER -->|"merge error"| ERROR["FIN — intervention requise"]
    GATHER -->|"merge OK + en attente"| WAIT["FIN — attente signals"]
```

---

### 13.12 Example — 3 sequential tasks A → B → C

Cet exemple illustre le cycle de vie complet d'un manifest avec 3 tâches séquentielles.

### Le manifest initial

`@leaddev` produit ce manifest sur `feature/issue-42` :

```json
{
  "issue": 42,
  "tasks": [
    {
      "id": "A",
      "branch": "task/issue-42-A",
      "file": "src/screens/GameScreen.tsx",
      "content": "Crée le composant GameScreen...",
      "role": "dev",
      "depends_on": [],
      "status": "pending"
    },
    {
      "id": "B",
      "branch": "task/issue-42-B",
      "file": "src/utils/collision.ts",
      "content": "Implémente le module de collision AABB...",
      "role": "dev",
      "depends_on": ["A"],
      "status": "pending"
    },
    {
      "id": "C",
      "branch": "task/issue-42-C",
      "file": "src/main.tsx",
      "content": "Ajoute la route /game dans main.tsx...",
      "role": "dev",
      "depends_on": ["B"],
      "status": "pending"
    }
  ]
}
```

---

### Étape 1 — `@leaddev` produit le manifest

**Workflow** : `on-issue-comment.yml` → `agent-execute.yml`

**Scripts** :
- `ensure-issue-branch.mjs` — crée `feature/issue-42` si absente
- `check-prerequisites.mjs` — Gate 0 + init-doc si absente
- `build-context.mjs` — construit le contexte GitHub
- `agent-dispatch.mjs` — dispatche `agent-execute.yml` avec `is_fanout_task: false`

`agent-execute.yml` tourne sur `feature/issue-42` :
- `anomalyco/opencode` produit et commite `manifest.json`
- push `feature/issue-42`
- `is_fanout_task: false` + manifest présent → **"Manifest produit"**
- `dispatch-fanout.mjs` → `on-fanout.yml`

---

### Étape 2 — FAN-OUT initial — lancement de A

**Workflow** : `on-fanout.yml`

**Scripts** :
- `launch-fanout.mjs` — setup git, checkout `feature/issue-42`, lit manifest
- `agent-launcher.mjs` :
  - calcul DAG : seule A est ready (`depends_on: []`)
  - manifest mis à jour :

```json
{ "id": "A", "status": "in_progress" }
{ "id": "B", "status": "pending" }
{ "id": "C", "status": "pending" }
```

  - crée `task/issue-42-A` via API GitHub
  - dispatche `agent-execute.yml` avec `is_fanout_task: true`, `branch: task/issue-42-A`

---

### Étape 3 — Task A s'exécute et termine

**Workflow** : `agent-execute.yml` sur `task/issue-42-A`

**Scripts** :
- `anomalyco/opencode` crée `src/screens/GameScreen.tsx`, commite
- push `task/issue-42-A`
- `is_fanout_task: true` → **"Task terminée"**
- `dispatch-gather.mjs` → `on-gather.yml`

---

### Étape 4 — GATHER de A — lancement de B

**Workflow** : `on-gather.yml`

**Scripts** :
- `validate-task-branch.mjs` — vérifie `task/issue-42-A` → `feature/issue-42` ✅
- `orchestrate.mjs` :
  - merge `task/issue-42-A` → `feature/issue-42` (retry optimiste 5x)
  - manifest mis à jour :

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "pending" }
{ "id": "C", "status": "pending" }
```

  - ferme task PR, supprime `task/issue-42-A`
  - poste barre de progression sur l'issue : `█░░  1/3 done`
  - calcul DAG : B est ready (`depends_on: ["A"]`, A=done)
  - `agent-launcher.mjs` :
    - manifest mis à jour :

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "in_progress" }
{ "id": "C", "status": "pending" }
```

    - crée `task/issue-42-B` via API GitHub
    - dispatche `agent-execute.yml` avec `is_fanout_task: true`, `branch: task/issue-42-B`

---

### Étape 5 — Task B s'exécute, GATHER, lancement de C

Même séquence que les étapes 3 et 4.

Manifest après GATHER de B :

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "done" }
{ "id": "C", "status": "in_progress" }
```

Barre de progression : `██░  2/3 done`

---

### Étape 6 — Task C s'exécute et termine — DAG complet

**Workflow** : `on-gather.yml`

**Scripts** :
- `orchestrate.mjs` :
  - merge `task/issue-42-C` → `feature/issue-42`
  - manifest final :

```json
{ "id": "A", "status": "done" }
{ "id": "B", "status": "done" }
{ "id": "C", "status": "done" }
```

  - barre de progression : `███  3/3 done`
  - `allDone = true` → **FIN — DAG terminé**
  - `feature/issue-42` contient le travail complet des 3 tasks
  - La PR vers `main` est une décision user

---

### 13.13 Required infrastructure

### Structure du repo

```
.oneticket/
  config.yml                  ← paramètres du framework (source de vérité)
  AGENTS.md                   ← définition de l'équipe agents
  agents/                     ← profils agents (*.agent.md)
  skills/                     ← skills oneticket (<name>/SKILL.md)
  tasks/                      ← manifests et workflow logs (issue-N/manifest.json)
  templates/
    docs/                     ← template de structure documentaire (copié par init-doc.mjs)

src/                          ← tous les scripts .mjs du framework
.github/
  workflows/                  ← tous les workflows GitHub Actions .yml
.gitattributes                ← règle merge=union pour workflow.md
apps/
  <project>/
    app/                      ← code source de l'application
    docs/                     ← documentation du projet (what/how/ship/run)
```

### Conventions de nommage des branches

| Convention | Format | Exemple |
|---|---|---|
| Branche d'issue | `feature/issue-N` | `feature/issue-42` |
| Branche de task | `task/issue-N-X` | `task/issue-42-A` |

Ces conventions sont **strictes** — `validate-task-branch.mjs` rejette tout écart et `agent-execute.yml` refuse de tourner sur toute branche qui ne correspond pas à ces formats.

### `.gitattributes`

Le fichier `.gitattributes` à la racine du repo doit contenir la règle suivante :

```
.oneticket/tasks/issue-*/workflow.md merge=union
```

`merge=union` garantit que les appends parallèles sur `workflow.md` (log de progression des tasks) ne créent jamais de conflit git — les lignes sont fusionnées automatiquement.

### `workflow.md`

Chaque dossier de tâche `.oneticket/tasks/issue-N/` contient un `workflow.md` qui sert de log append-only de la progression des tasks. Il est mis à jour par chaque agent à la fin de son run et protégé par `merge=union`.

Format d'une entrée :
```
2026-06-01 14:32 | A | apps/breakout/app/src/screens/GameScreen.tsx
```

### Secrets GitHub requis

Deux secrets doivent être configurés dans les settings du repo GitHub (`Settings → Secrets → Actions`) :

| Secret | Description | Droits requis |
|---|---|---|
| `ONETICKET_GH_PAT` | Personal Access Token GitHub du bot | `contents: write`, `issues: write`, `pull-requests: write`, `workflows: write` |
| `OPENCODE_API_KEY` | Clé API opencode / anomalyco | Accès au modèle LLM configuré dans `config.yml` |

Sans ces deux secrets, aucun workflow ne peut s'exécuter.

---

### 13.14 Architectural philosophy

OneTicket applique une séparation stricte entre les opérations agentiques et les opérations déterministes.

### Responsabilités des agents

Les agents sont autorisés à :

```text
- analyser un contexte
- produire du contenu
- modifier des fichiers
- créer un commit local
- publier une réponse GitHub
```

Les agents ne sont pas autorisés à :

```text
- créer des branches
- choisir une branche
- pousser du code
- merger des branches
- créer des Pull Requests
- modifier directement l'orchestration globale
```

### Responsabilités des scripts déterministes

Les scripts `.mjs` sont responsables de :

```text
- la gestion Git
- la gestion des branches
- les push
- les merges
- les manifests
- le calcul du DAG
- le fanout
- le fanin
- les retries
- les interactions GitHub API
```

Cette séparation garantit que l'orchestration reste prédictible, reproductible et contrôlée indépendamment du comportement du modèle d'IA.

### Décisions de conception

- **PR = décision user** — le pipeline ne crée jamais de PR automatiquement. `create-direct-pr.mjs` et `createFinalPR` sont supprimés dans la vision v2
- **Manifest = condition DAG** — c'est la présence du `manifest.json` qui conditionne le déclenchement du Fan-out, pas le nom de la branche
- **Branche toujours créée en amont** — `feature/issue-N` est garantie existante avant tout run agentique (`ensure-issue-branch.mjs`). Les branches `task/issue-N-X` sont créées par `agent-launcher.mjs` via API GitHub avant le dispatch
- **Initialisation déterministe** — `init-doc` et `init-template` sont des scripts déterministes, jamais délégués à un agent. La structure documentaire est garantie par `check-prerequisites.mjs` avant chaque run
- **Gate 0 déterministe** — la vérification de `current_project` est faite par `check-prerequisites.mjs`, jamais par un agent
- **Zéro code inline dans les yml** — toute logique métier est dans des scripts `.mjs`. Les workflows YAML ne contiennent que des appels à ces scripts
- **Décision de template = agentique** — la détection de la stack et la recommandation d'un template restent agentiques. Seule l'exécution de `init-template.mjs` est déterministe, déclenchée sur confirmation explicite de l'utilisateur (`@leaddev init-<template>`)
- **branch_base — paramètre calculable** — la branche parente d'une task est toujours `feature/issue-N`, calculée depuis `issue_number` : `"feature/issue-" + issue_number`. Elle n'est jamais stockée dans le manifest ni passée en paramètre entre workflows
- **switched=true — contrôle du push et des PRs** — le prompt injecte `FIRST ACTION: git checkout <branch>` en première ligne. anomalyco détecte le switch de branche (`switched=true`) et désactive automatiquement le push auto et la création de PR. Le pipeline reprend le contrôle après le run agent via les steps déterministes de `agent-execute.yml`

---

## 14. Parallel Task Execution Contract

OneTicket executes tasks in parallel via FAN-OUT — each task runs on its own isolated branch and produces files that are merged back into the feature branch by GATHER.

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

## 15. Decomposition and Quality Trade-offs

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

**Implementation — fine tasks, integration failure:**
A game implementation decomposed into one task per JS module produced individually correct files. At runtime, the ball had a radius of zero (not initialized by the module that owned the ball), physics ran during the menu phase (no shared phase guard), and the first game frame computed a large delta time after the menu delay — causing the ball to teleport outside the canvas. Five debug iterations were required to identify and fix the integration boundaries. The agents had no shared contract on initial state, lifecycle phases, or timing assumptions. Mitigation: skeleton-first task establishes the shared contract before any parallel implementation begins.

---

## 16. Merge Conflict Recovery

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

## 17. Glossary

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
