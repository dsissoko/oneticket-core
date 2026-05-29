# US-006 — Documentation & Runbook

## Story

En tant que développeur, je veux un runbook pour réutiliser le skeleton afin de créer rapidement des projets.

## Expected Behavior

- Un README.md explique le but du AppShell et la vision OneTicket
- Une section "Getting Started" liste les étapes pour copier le skeleton
- Un runbook détail les étapes d'adaptation pour un nouveau projet
- Les fichiers importants sont commentés avec explications
- Les fonctions publiques ont des JSDoc avec types TypeScript
- Les patterns non-évidents (ownership model, state management, etc.) sont documentés

## Acceptance Criteria

- [ ] README.md au racine `apps/appshell/` explique le projet
- [ ] Section "Quick Start" décrit les commandes npm (dev, build, preview, test)
- [ ] Section "Copy to New Project" liste les étapes :
  -   Copier `apps/appshell/app/` vers le nouveau projet
  -   Mettre à jour `package.json` (nom, version)
  -   Adapter les imports du projet racine
  -   Configurer les routes spécifiques au projet
  -   Adapter les design tokens si nécessaire
- [ ] Runbook (.oneticket/runbooks/appshell-skeleton.md) documente chaque étape avec exemples
- [ ] Composants clés (AppLayout, Header, Footer, useUsers) ont JSDoc
- [ ] Les patterns patterns importants sont expliqués : ownership model, exclusive file ownership, state management avec Zustand
- [ ] Liens vers la documentation Vite, React Router, React Query, MSW, next-themes

## Related Epic

[Epic 0 — AppShell MVP](epic-0-mvp/epic.md)

## Related Slices

[Slice 5 — Documentation & Runbook](../../../how/slices/slice-5-documentation/slice.md)
