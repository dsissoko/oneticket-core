# US-003 — Routing Setup

## Story

En tant que développeur, je veux des routes de base (/, /about, /help) afin de démontrer le routing.

## Expected Behavior

- React Router v6 est configuré avec routes principales
- Chaque route charge un composant de page distinct
- Les routes sont lazy-loaded pour optimiser le bundle
- Une page 404 (Not Found) est présente pour les routes invalides
- Une Error Boundary enveloppe les routes pour capturer les erreurs de rendu

## Acceptance Criteria

- [ ] React Router v6 est importé et configuré dans l'application
- [ ] Route `/` charge une page d'accueil (Home)
- [ ] Route `/about` charge une page À propos avec informations sur le projet
- [ ] Route `/help` charge une page d'aide avec documentation basique
- [ ] Routes inutilisées affichent une page 404 styled
- [ ] Error Boundary enveloppe les routes et affiche un message d'erreur gracieux
- [ ] Lazy loading est implémenté avec React.lazy() et Suspense
- [ ] Navigation entre les routes est testable (liens dans Header)

## Related Epic

[Epic 0 — AppShell MVP](epic-0-mvp/epic.md)

## Related Slices

[Slice 2 — Routing Setup](../../../how/slices/slice-2-routing/slice.md)
