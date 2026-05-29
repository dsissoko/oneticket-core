---
title: US-001 — Skeleton Setup
---

# US-001 — Skeleton Setup

## Story

En tant que développeur, je veux copier le skeleton AppShell et l'adapter pour créer rapidement une nouvelle application, afin de bénéficier d'une structure standard, de design tokens, et de conventions d'équipe.

## Expected Behavior

- L'application dupliquée possède une structure complète et fonctionnelle identique à AppShell
- Les variables d'environnement sont personnalisables sans modification du code source
- Le configuration du projet reflète correctement le contexte applicatif
- Les écrans de présentation (About, Help) peuvent être adaptés au domaine métier

## Acceptance Criteria

1. **Structure complète copiée de `apps/appshell/app/`** — Tous les répertoires (src/screens, src/hooks, src/mocks, src/components, src/styles, src/utils) et fichiers de configuration (package.json, tsconfig.json, vite.config.ts, tailwind.config.ts) sont présents et fonctionnels dans le nouveau projet
2. **`VITE_APP_NAME` configurable en `.env.example`** — La variable d'environnement est définie dans `.env.example` et peut être remplacée par le nom de l'application cible sans modification du code applicatif
3. **`current_project` mis à jour en `.oneticket/config.yml`** — Le champ `current_project` reflète exactement le nom du répertoire du nouveau projet sous `apps/`
4. **`AboutScreen` et `HelpScreen` personnalisables** — Les deux écrans de présentation contiennent des placeholders ou du texte générique facilement identifiables et remplaçables par le contenu spécifique au domaine

## Related Epic

../epic.md

## Related Slices

<!-- @architect fills this section after producing slices -->
