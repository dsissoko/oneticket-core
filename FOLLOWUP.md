# OneTicket v1.0.0 — Implementation Followup

## Authoring rules

This document is a memory aid for humans — no details, no specs, no explanations.
One line per item. All detail lives in `product-spec.md`, `AGENTS.md`, or the code.

## Backlog

### Sprint 4 — Init template + Skills
- `init-template.mjs` — nouveau script
- Skills v1.0.0 dans `oneticket-skills` via `write-a-skill`

## In Progress

### À valider (livré, non testé en propre)
- `ensure-issue-branch.mjs` — validé partiellement sur #1015 (✅ step passé)
- `check-prerequisites.mjs` — validé partiellement sur #1015 (✅ step passé)
- `init-doc.mjs` — non encore déclenché (docs déjà présents sur breakout)
- `create-pr.mjs` — validé sur #1015 (✅ PR #1016 créée), crash ISSUE_NUMBER fixé
- `orchestrate.mjs` — allDone + createPR() — en cours de validation sur #1019

## Done

- Sprint 3 — Init + PR automatique
  - `ensure-issue-branch.mjs` — extrait de agent-dispatch.mjs, branché dans on-issue-comment.yml
  - `check-prerequisites.mjs` — Gate 0 + init-doc, erreur explicite si templates absents
  - `init-doc.mjs` — copie templates/docs/ vers docs_path, idempotent
  - `agent-dispatch.mjs` — Gate 0 et création branche supprimés, responsabilité unique
  - `create-pr.mjs` — PR créée automatiquement dès que fichiers pushés sur feature/issue-N
  - `orchestrate.mjs` — allDone appelle createPR() avec manifest
  - `agent-execute.yml` — step Create PR après push
  - `retry-dispatch.mjs` — is_fanout_task passé dans le re-dispatch
  - fix: create-pr.mjs main() conditionné à exécution directe (fileURLToPath)
  - fix: ISSUE_NUMBER missing dans orchestrate.mjs → createPR() appelée en module

- Sprint 2 — FAN-OUT / GATHER — validé E2E issues #1013, #1014
  - `dispatch-fanout.mjs` — détecte manifest, déclenche on-fanout.yml
  - `on-fanout.yml` — checkout main, délègue checkout feature/issue-N à launch-fanout.mjs
  - `agent-launcher.mjs` — prompt minimal, is_fanout_task, createBranch() via GitHub API
  - `launch-fanout.mjs` — setupGit + checkout feature/issue-N + check défensif après checkout
  - `dispatch-gather.mjs` — branch_base calculé depuis TASK_BRANCH
  - `on-gather.yml` — input branch_base supprimé, calculé dans extract
  - `validate-task-branch.mjs` — copie directe src.old
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
- PR créée automatiquement par le pipeline dès que fichiers pushés sur feature/issue-N — merge = décision humaine
- Direct run → PR créée par `create-pr.mjs` dans `agent-execute.yml`
- FAN-OUT → PR créée par `orchestrate.mjs` à allDone (après dernier merge intermédiaire réussi)
- `create-pr.mjs` exporté comme module ET exécutable standalone (fileURLToPath guard)
- APM gère agents + instructions + skills — oneticket-install.mjs = pont de copie uniquement
- `.oneticket/.apm/` = primitives APM projet-spécifiques (instructions, etc.)
- `dsissoko/oneticket-skills` = repo partagé commun (agents + skills domaine)
- `oneticket-skills` pointé sur `#main` — pas de tag à chaque skill ajouté
- `on-fanout.yml` checkout main — launch-fanout.mjs gère le checkout feature/issue-N
- Skills dans `oneticket-skills/.apm/skills/` — pas dans `.oneticket/skills/` local
- `apm compile --target opencode --clean` requis après `apm install` — install seul ne recompile pas si lockfile unchanged
- `check-prerequisites.mjs` — si `.oneticket/templates/docs/` absent → erreur explicite (site vide en prod sinon)

## Open questions

(none)
