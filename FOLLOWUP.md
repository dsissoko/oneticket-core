# OneTicket v1.0.0 — Implementation Followup

## Authoring rules

This document is a memory aid for humans — no details, no specs, no explanations.
One line per item. All detail lives in `product-spec.md`, `AGENTS.md`, or the code.

## Backlog

### Sprint 4 — Skills + Optimisations
- Skills v1.0.0 dans `oneticket-skills` via `write-a-skill`
- Optimisation : vérifier existence profil agent avant dispatch — éviter 3 retries sur "default agent not found"
- Refactoring : extraire `postComment()` vers `utils.mjs` — dupliqué dans `init-doc.mjs` + `init-template.mjs`

## In Progress

### Doc site + GitHub Pages deploy
- `docs-site-github-pages.yml` — copier depuis `.old/`, aucune adaptation v1.0.0 nécessaire
- Valider deploy preview sur PR + deploy prod sur merge main

## Done

- Sprint 3 — Init + PR automatique + commandes déterministes — validé E2E #1019, #1021, #1025, #1027
  - `ensure-issue-branch.mjs` — validé #1025 ✅
  - `check-prerequisites.mjs` — Gate 0 validé #1025, init-doc déclenché ✅
  - `init-doc.mjs` — mode library (check-prerequisites) + mode command (@po init-doc) — validé #1027 ✅
  - `@po init-doc` — implémenté et validé #1027 ✅
  - `init-template.mjs` — livré, ensure-issue-branch + createPR ajoutés, non testé
  - `@leaddev init-<template>` — implémenté, non testé
  - `create-pr.mjs` — validé #1021 (FAN-OUT allDone) + #1027 (direct run) ✅
  - `agent-dispatch.mjs` — Gate 0 et création branche supprimés, responsabilité unique
  - fix: PR non créée au push manifest — manifest check dans create-pr.mjs ✅
  - fix: create-pr.mjs main() conditionné fileURLToPath ✅
  - fix: Gate 0 exit 0 — condition gérée, pas erreur pipeline ✅
  - fix: retry-dispatch.mjs — is_fanout_task passé dans re-dispatch ✅
  - fix: init-doc.mjs — duplication branche supprimée, délégué à ensure-issue-branch.mjs ✅
  - `.oneticket/docs/what/oneticket-brief.md` — supprimé (contenu absorbé par product-spec.md)

- Sprint 2 — FAN-OUT / GATHER — validé E2E issues #1013, #1014
  - `dispatch-fanout.mjs` — détecte manifest, déclenche on-fanout.yml
  - `on-fanout.yml` — checkout main, délègue checkout feature/issue-N à launch-fanout.mjs
  - `agent-launcher.mjs` — prompt minimal, is_fanout_task, createBranch() via GitHub API
  - `launch-fanout.mjs` — setupGit + checkout feature/issue-N + check défensif après checkout
  - `dispatch-gather.mjs` — branch_base calculé depuis TASK_BRANCH
  - `on-gather.yml` — input branch_base supprimé, calculé dans extract
  - `validate-task-branch.mjs` — copie directe src.old
  - `orchestrate.mjs` — createFinalPR supprimé, allDone = createPR()
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
- FAN-OUT → PR créée au premier merge réussi — body mis à jour à allDone avec liste des tâches
- `@po init-doc` et `@leaddev init-<template>` → commandes déterministes, pas agentiques
- `init-doc.mjs` — dual mode : library (args CLI) + command (env vars, git, PR, commentaire)
- `create-pr.mjs` exporté comme module ET exécutable standalone (fileURLToPath guard)
- Format réponse agent : `**[Agent: @role]**` → premier char `*` → pas de re-déclenchement `on-issue-comment.yml`
- `autonomous_mode: true` → risque boucle (`@agent` commentaire) — non activé en v1.0.0
- Gate 0 exit 0 — erreur config gérée proprement, pas failure pipeline
- label `blocked` appliqué à retry_max exhaustion — signal correct même sur erreur de config (profil inexistant)
- `current_project` — passé à `spaceinvaders`
- Templates manquants exit 1 — erreur repo inattendue, mérite notify-failure
- APM gère agents + instructions + skills — oneticket-install.mjs = pont de copie uniquement
- `.oneticket/.apm/` = primitives APM projet-spécifiques (instructions, etc.)
- `dsissoko/oneticket-skills` = repo partagé commun (agents + skills domaine)
- `oneticket-skills` pointé sur `#main` — pas de tag à chaque skill ajouté
- `on-fanout.yml` checkout main — launch-fanout.mjs gère le checkout feature/issue-N
- Skills dans `oneticket-skills/.apm/skills/` — pas dans `.oneticket/skills/` local
- `apm compile --target opencode --clean` requis après `apm install` — install seul ne recompile pas si lockfile unchanged
- `check-prerequisites.mjs` — si `.oneticket/templates/docs/` absent → erreur explicite (site vide en prod sinon)

## Open questions

- `autonomous_mode: true` — gérer le risque de boucle avant activation
- `open_question` : `init-template.mjs` — tester sur une issue monjournal avec `@leaddev init-appshell`
