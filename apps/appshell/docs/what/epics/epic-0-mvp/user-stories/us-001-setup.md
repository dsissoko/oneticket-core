# US-001 — Skeleton Setup

## Story

En tant que développeur, je veux un skeleton prêt à copier afin de démarrer un nouveau projet rapidement.

## Expected Behavior

- Le répertoire `apps/appshell/app/` contient une structure de projet React + Vite complète
- La structure suit un modèle d'ownership exclusif : une composante = un fichier, une page = un fichier
- Vite est configuré avec dev server, build et preview modes
- TypeScript est en mode strict avec une `tsconfig.json` appropriée
- Les composants `Header`, `Footer`, et `AppLayout` sont verrouillés (locked)
- Le projet est immédiatement copiable vers une nouvelle structure de projet

## Acceptance Criteria

- [ ] `apps/appshell/app/` existe avec `package.json`, `vite.config.ts`, et `tsconfig.json`
- [ ] `npm install && npm run dev` démarre le serveur Vite sans erreurs
- [ ] `npm run build` génère un bundle de production sans warnings TypeScript
- [ ] Structure de répertoires reflète l'ownership model (src/components/, src/pages/, src/hooks/, src/stores/)
- [ ] Header, Footer, AppLayout sont des composants verrouillés dans src/components/layout/
- [ ] Documentation explique comment copier ce skeleton vers un nouveau projet

## Related Epic

[Epic 0 — AppShell MVP](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
