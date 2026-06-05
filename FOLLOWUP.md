# OneTicket v1.0.0 — Implementation Followup
<!-- last updated: 2026-06-05 -->

## Authoring rules

This document is a memory aid for humans — no details, no specs, no explanations.
One line per item. All detail lives in `product-spec.md`, `AGENTS.md`, or the code.

## Backlog

### Sprint 4 — Skills + Optimisations
- Skills v1.0.0 dans `oneticket-skills` via `write-a-skill`
- Optimisation : vérifier existence profil agent avant dispatch — éviter 3 retries sur "default agent not found"
- Refactoring : extraire `postComment()` vers `utils.mjs` — dupliqué dans `init-doc.mjs` + `init-template.mjs`

### Rétrodoc framework — runbooks
- Vérifier cohérence `merge-recovery.md` avec pipeline v1.0.0 (branch_base supprimé, PR au 1er merge)
- Créer `setup.md` — runbook setup initial OneTicket :
  - Secrets GitHub : `ONETICKET_GH_PAT` + `OPENCODE_API_KEY`
  - `config.yml` : current_project, model, max_tasks, pr_base
  - Paramétrage auto-delete head branches : GitHub Settings → General → Pull Requests
- Créer `post-merge.md` — runbook post-merge propre (suppression branche feature, fermeture issue)

### init-template — refactoring placeholders
- Remplacer la logique de casse (KNOWN_COMPOUNDS, toTitleCase, PascalCase) par un remplacement strict `templateName` → `current_project`
- Corriger le template `appshell` : remplacer toutes les variantes de casse (`AppShell`, `Appshell`) par `appshell` lowercase dans tous les fichiers
- `replaceInFile` réduit à `content.replaceAll(templateName, projectName)` — aucune logique de casse
- `buildPrompt` pull_request_review_comment : renforcer "DO NOT use other command" si le comportement se reproduit après tests supplémentaires

### Merge conflict barrel files — fix skill + issue-1040
- `oneticket-scaffold-appshell` — skill unifié créé (absorbe `oneticket-appshell` + `oneticket-init-appshell`) ✅
- File Ownership Matrix enrichie : `index.ts` + `Header.tsx` = Integration Task uniquement ✅
- Issue #1040 — PR #1042 close, branche supprimée, relance sur nouvelle issue #1043 avec prompt corrigé
- Issue #1044 — enhancement : task-X-status.txt signal files (remplacement agent writes manifest) — backlog sprint 4

## In Progress

### PR #1039 — MonJournal doc init
- Branche `feature/issue-1036` — doc générée, code applicatif supprimé, AGENTS.md supprimé
- À merger quand doc validée

## Done

### Session 2026-06-04 — PR triggers + review pipeline
- `on-pr-comment.yml` — fix `head.ref` → `issue_number` via API, guard pattern `feature/issue-N` ✅
- `on-pr-review.yml` — nouveau workflow (remplace `on-pr-review-comment.yml`) — `pull_request_review: submitted` ✅
- `dispatch-review-agents.mjs` — N agents parallèles : threads inline + body submit review ✅
- `agent-dispatch.mjs` — exports `buildPrompt`, `parseComment`, `resolveProjectContext` + `COMMENT_PATH/LINE/DIFF_HUNK` dans prompt ✅
- fix: directive inline `DO NOT use other command` dans `buildPrompt` + `oneticket-team.instructions.md` ✅
- fix: `agent-execute.yml` — retry élargi : `failure() && steps.run-agent.outcome != 'success'` (couvre crashes pre-opencode) ✅
- fix: `dispatch-fanout.mjs` — guard `allDone` : skip FAN-OUT si manifest déjà terminé ✅
- fix: `orchestrate.mjs` — `cleanup_on_success` : supprime `.oneticket/tasks/issue-N/` après allDone ✅
- fix: `AGENTS.md` dans `.git/info/exclude` CI + supprimé de `feature/issue-1036` ✅
- nettoyage one-shot `.oneticket/tasks/` — 10 dossiers anciens supprimés sur main ✅
- `us-003-multi-trigger.md` — réécriture complète : 4 cas UX, routing logic, AC ✅
- `product-spec.md` — workflows 4 et 5 mis à jour (tableau 4 sous-cas review) ✅
- `config.yml` — `cleanup_on_success: true` + `current_project: monjournal` ✅
- Validé E2E : issue comment ✅, PR conversation ✅, inline "Comment" ✅, submit review N threads + body ✅

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

- Sprint 2 — FAN-OUT / GATHER — validé E2E issues #1013, #1014
  - `dispatch-fanout.mjs`, `on-fanout.yml`, `agent-launcher.mjs`, `launch-fanout.mjs`
  - `dispatch-gather.mjs`, `on-gather.yml`, `validate-task-branch.mjs`, `orchestrate.mjs`
  - `is_fanout_task` dans `agent-execute.yml`
  - `createBranch()` dans `utils.mjs`

- Sprint 1 — pipeline stabilisé
  - `retry-dispatch.mjs`, `on-pr-comment.yml`, `on-pr-review-comment.yml`
  - Pin dépendances APM, setup APM, install `write-a-skill`

## Decisions log

- `branch_base` supprimé en v1.0.0 — calculable depuis task_branch
- `is_fanout_task` remplace `branch_base` comme signal de routage dans agent-execute.yml
- PR créée automatiquement par le pipeline dès que fichiers pushés sur feature/issue-N — merge = décision humaine
- FAN-OUT → PR créée au premier merge réussi — body mis à jour à allDone avec liste des tâches
- `@po init-doc` et `@leaddev init-<template>` → commandes déterministes, pas agentiques
- `create-pr.mjs` exporté comme module ET exécutable standalone (fileURLToPath guard)
- Format réponse agent : `**[Agent: @role]**` → premier char `*` → pas de re-déclenchement `on-issue-comment.yml`
- `autonomous_mode: true` → risque boucle (`@agent` commentaire) — non activé en v1.0.0
- Gate 0 exit 0 — erreur config gérée proprement, pas failure pipeline
- Auto-delete branches PR — configurer dans GitHub Settings → General → "Automatically delete head branches"
- `current_project` — passé à `monjournal`
- `on-pr-review.yml` — écoute `pull_request_review: submitted` uniquement — "Add single comment" = review auto-soumise par GitHub → même event
- `dispatch-review-agents.mjs` — dernier commentaire de chaque thread = règle de dispatch (identique issue comment)
- `AGENTS.md` — artefact CI compilé par `apm compile` — protégé par `.git/info/exclude` dans agent-execute.yml, jamais commité
- `cleanup_on_success: true` — supprime `.oneticket/tasks/issue-N/` entier après allDone sur branche feature
- Retry élargi — `failure() && steps.run-agent.outcome != 'success'` couvre crashes pre-opencode (Install APM, etc.)

## Open questions

- `autonomous_mode: true` — gérer le risque de boucle avant activation
- `init-template.mjs` — tester sur une issue monjournal avec `@leaddev init-appshell`
