# OneTicket v1.0.0 — Implementation Followup

## Authoring rules

This document is a memory aid for humans — no details, no specs, no explanations.
One line per item. All detail lives in `product-spec.md`, `AGENTS.md`, or the code.

## Backlog

### Sprint 3 — Init + Skills
- `ensure-issue-branch.mjs` — extraire de agent-dispatch.mjs, brancher dans on-issue-comment.yml
- `check-prerequisites.mjs` — Gate 0 + init-doc, extraire de agent-dispatch.mjs
- `init-doc.mjs` — copie templates/docs/ vers docs_path, appelé par check-prerequisites.mjs
- `init-template.mjs` — nouveau script
- Skills v1.0.0 dans `oneticket-skills` via `write-a-skill`

## In Progress

## Done

- Sprint 2 — FAN-OUT / GATHER — validé E2E issues #1013, #1014
  - `dispatch-fanout.mjs` — détecte manifest, déclenche on-fanout.yml
  - `on-fanout.yml` — checkout main, délègue checkout feature/issue-N à launch-fanout.mjs
  - `agent-launcher.mjs` — prompt minimal, is_fanout_task, createBranch() via GitHub API
  - `launch-fanout.mjs` — setupGit + checkout feature/issue-N + check défensif après checkout
  - `dispatch-gather.mjs` — branch_base calculé depuis TASK_BRANCH
  - `on-gather.yml` — input branch_base supprimé, calculé dans extract
  - `validate-task-branch.mjs` — copie directe src.old
  - `orchestrate.mjs` — createFinalPR supprimé, allDone = commentaire + labels
  - `is_fanout_task` dans `agent-execute.yml` — guard étendu + step dispatch-gather + step dispatch-fanout
  - `createBranch()` dans `utils.mjs` — POST /repos/{repo}/git/refs, idempotent
  - `oneticket-manifest-generation` skill dans `oneticket-skills/.apm/skills/`

- Sprint 1 — pipeline stabilisé
  - `retry-dispatch.mjs`
  - `on-pr-comment.yml`
  - `on-pr-review-comment.yml`
  - Pin dépendances APM — `dsissoko/oneticket-skills#main`
  - `.agents/AGENTS.md` produit par `apm compile --target opencode --clean`
- Setup APM — `apm.yml` dans `.oneticket/`, copié à la racine par `oneticket-install.mjs`
- Install `write-a-skill` via APM
- `on-issue-comment.yml` — parse 2 niveaux (déterministe + agentique)
- `agent-execute.yml` — APM install + default_agent via OPENCODE_CONFIG_CONTENT
- `agent-dispatch.mjs` — Gate 0, branch creation, prompt minimaliste
- `oneticket-install.mjs` — copie skills + apm.yml + .apm/
- `generate-config.mjs` — default_agent activé
- Agent profiles dans `oneticket-skills/.apm/agents/` (6 profils)
- `oneticket-team.instructions.md` dans `.oneticket/.apm/instructions/`
- AGENTS.md migré vers APM instructions
- [`product-spec.md`](.oneticket/docs/what/product-spec.md) — precision pass + UX chapter
- Archive v0.5.0 code to `*.old`

## Decisions log

- `branch_base` supprimé en v1.0.0 — calculable depuis task_branch
- `is_fanout_task` remplace `branch_base` comme signal de routage dans agent-execute.yml
- PR = décision user — create-direct-pr.mjs et createFinalPR supprimés
- APM gère agents + instructions + skills — oneticket-install.mjs = pont de copie uniquement
- `.oneticket/.apm/` = primitives APM projet-spécifiques (instructions, etc.)
- `dsissoko/oneticket-skills` = repo partagé commun (agents + skills domaine)
- `oneticket-skills` pointé sur `#main` — pas de tag à chaque skill ajouté
- `on-fanout.yml` checkout main — launch-fanout.mjs gère le checkout feature/issue-N
- Skills dans `oneticket-skills/.apm/skills/` — pas dans `.oneticket/skills/` local
- `apm compile --target opencode --clean` requis après `apm install` — install seul ne recompile pas si lockfile unchanged

## Open questions

(none)
