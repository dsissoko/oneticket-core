# OneTicket v0.6.0 — Implementation Followup
<!-- last updated: 2026-06-05 -->

## Authoring rules

This document is a memory aid for humans — no details, no specs, no explanations.
One line per item. All detail lives in `product-spec.md`, `AGENTS.md`, or the code.

## Backlog

### Sprint 5 — Optimisations pipeline
- Vérifier existence profil agent avant dispatch — éviter 3 retries sur "default agent not found"
- Refactoring : extraire `postComment()` vers `utils.mjs` — dupliqué dans `init-doc.mjs` + `init-template.mjs`
- `init-template.mjs` — refactoring placeholders : remplacer KNOWN_COMPOUNDS/toTitleCase par `replaceAll(templateName, projectName)` strict
- Issue #1044 — enhancement : task-X-status.txt signal files (backlog)
- Rétrodoc framework — runbooks : `setup.md`, `post-merge.md`, vérifier cohérence `merge-recovery.md` avec pipeline v0.6.0

## Done

### Session 2026-06-05 — v0.6.0

**Pipeline — labels & deploy**
- Flow direct run : retrait `ready for review` avant dispatch, `dev error` sur échec issue + PR ✅
- `notify-agent-failure.mjs` — script dédié commentaire + labels sur échec agent ✅
- `create-pr.mjs` — retrigger deploy cycling `ready for review` sur PR existante post-FAN-OUT ✅
- `fix deploy-preview` — condition label `ready for review` requise (évite crash PR release-please) ✅
- `fix agent-dispatch` — `pull_request_comment` couvert pour retrait `ready for review` ✅
- `fix create-pr` — `applyLabel ready for review` sur la PR en plus de l'issue ✅

**Pipeline — réponses agents**
- Directives de réponse structurées et symétriques par canal (issue, PR comment, inline review, FAN-OUT) ✅
- `agent-launcher.mjs` — `Do NOT post comment` — pipeline gère la progression via barre ✅

**Reverse-doc**
- Skill `oneticket-reverse-doc` créé dans `oneticket-skills` ✅
- Commande `@po reverse-doc <prompt>` — déterministe (init-doc garanti par check-prerequisites) + agentique ✅
- Complement prompt injecté dans `agent-dispatch.mjs` si `reverse-doc` détecté ✅
- Instructions explicites de mise à jour : `product-spec.md`, `architecture.md`, C4, slices ✅
- Règles d'ownership fichiers doc dans `oneticket-doc-structure` + `oneticket-reverse-doc` ✅
- Validé sur MonJournal issue #1056 — 7/7 done, zéro merge conflict ✅

**Nettoyage .old**
- `src.old/` supprimé (16 fichiers) ✅
- `.github/workflows.old/` supprimé (9 fichiers) ✅
- `.oneticket/agents.old/` supprimé (6 fichiers) ✅
- `.oneticket/skills.old/` supprimé — 27 skills migrés dans `oneticket-skills` ✅
- `oneticket-skills` : 50 skills au total, frontmatter normalisé, descriptions en anglais ✅

**MonJournal app (PR #1053 mergée)**
- Home page complète : liste, filtres horizontaux, ControlZone (list/timeline/surprise) ✅
- Formulaire Add Thought inline collapsible en haut de page ✅
- Seed 100 pensées au premier chargement localStorage (2024-2026) ✅
- Tags avec couleurs sur les cartes ✅
- Recherche multicritère (titre, contenu, tags) — tag multi-select supprimé ✅
- Dead code supprimé (`ViewModeToggle.tsx`, `Home.tsx` pages/) ✅

**Release**
- `release-please` restauré depuis `workflows.old/` ✅
- v0.6.0 releasée ✅

---

### Session 2026-06-04 — PR triggers + review pipeline
- `on-pr-comment.yml` — fix `head.ref` → `issue_number` via API, guard pattern `feature/issue-N` ✅
- `on-pr-review.yml` — nouveau workflow — `pull_request_review: submitted` ✅
- `dispatch-review-agents.mjs` — N agents parallèles : threads inline + body submit review ✅
- `agent-dispatch.mjs` — exports `buildPrompt`, `parseComment`, `resolveProjectContext` + `COMMENT_PATH/LINE/DIFF_HUNK` dans prompt ✅
- fix: directive inline `DO NOT use other command` dans `buildPrompt` + `oneticket-team.instructions.md` ✅
- fix: `agent-execute.yml` — retry élargi : couvre crashes pre-opencode ✅
- fix: `dispatch-fanout.mjs` — guard `allDone` anti-retrigger ✅
- fix: `orchestrate.mjs` — `cleanup_on_success` + `findFeaturePR()` + label PR à allDone ✅
- fix: `AGENTS.md` dans `.git/info/exclude` CI ✅
- `us-003-multi-trigger.md` — réécriture complète : 4 cas UX ✅
- Validé E2E : issue comment ✅, PR conversation ✅, inline "Comment" ✅, submit review ✅

### Sprint 3 — Init + PR automatique + commandes déterministes
- Validé E2E #1019, #1021, #1025, #1027
- `ensure-issue-branch.mjs`, `check-prerequisites.mjs`, `init-doc.mjs`, `init-template.mjs` ✅
- `@po init-doc`, `@leaddev init-<template>` — commandes déterministes ✅
- `create-pr.mjs` — validé FAN-OUT allDone + direct run ✅

### Sprint 2 — FAN-OUT / GATHER
- Validé E2E issues #1013, #1014
- `dispatch-fanout.mjs`, `on-fanout.yml`, `agent-launcher.mjs`, `launch-fanout.mjs` ✅
- `dispatch-gather.mjs`, `on-gather.yml`, `validate-task-branch.mjs`, `orchestrate.mjs` ✅

### Sprint 1 — pipeline stabilisé
- `retry-dispatch.mjs`, `on-pr-comment.yml`, `on-pr-review-comment.yml` ✅
- Pin dépendances APM, setup APM, install `write-a-skill` ✅

---

## Decisions log

- `branch_base` supprimé en v0.6.0 — calculable depuis task_branch
- `is_fanout_task` remplace `branch_base` comme signal de routage dans agent-execute.yml
- PR créée automatiquement par le pipeline dès que fichiers pushés sur feature/issue-N — merge = décision humaine
- FAN-OUT → PR créée au premier merge réussi — body mis à jour à allDone
- `@po init-doc` et `@leaddev init-<template>` → commandes déterministes, pas agentiques
- `create-pr.mjs` exporté comme module ET exécutable standalone (fileURLToPath guard)
- Format réponse agent : `**[Agent: @role]**` → premier char `*` → pas de re-déclenchement
- `autonomous_mode: true` → risque boucle — non activé en v0.6.0
- Gate 0 exit 0 — erreur config gérée proprement, pas failure pipeline
- `current_project: monjournal`
- `on-pr-review.yml` — écoute `pull_request_review: submitted` uniquement
- `dispatch-review-agents.mjs` — dernier commentaire de chaque thread = règle de dispatch
- `AGENTS.md` — artefact CI compilé par `apm compile` — `.git/info/exclude`, jamais commité
- `cleanup_on_success: true` — supprime `.oneticket/tasks/issue-N/` après allDone
- Skills distribués via `dsissoko/oneticket-skills#main` — 50 skills, frontmatter opencode
- `@po reverse-doc` — seule commande déterministe + agentique combinée (init-doc garanti upstream)
- `dev error` label — nouveau signal d'échec agent sur direct run (distinct de `merge error` et `blocked`)
- `oneticket-doc-structure` + `oneticket-reverse-doc` — règles ownership fichiers partagés (product-spec, epic, architecture)
