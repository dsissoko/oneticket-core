# US-002 — Layout Structure

## Story

En tant qu'utilisateur, je veux une structure de layout (Header + Outlet + Footer) afin que tous les écrans soient cohérents.

## Expected Behavior

- Un composant `AppLayout` global qui enveloppe tous les écrans
- Le layout contient un Header sticky en haut avec logo et navigation
- Un Outlet central où les routes affichent leur contenu
- Un Footer sticky en bas avec informations légales et liens
- Le layout est responsive et respecte une grille cohérente
- Le theme (light/dark) s'applique uniformément à tous les éléments

## Acceptance Criteria

- [ ] Composant `AppLayout` crée le layout global (Header + Outlet + Footer)
- [ ] Header affiche le logo AppShell et des liens de navigation (/, /about, /help)
- [ ] Footer affiche copyright, lien vers documentation, statut du projet
- [ ] Layout utilise CSS Grid ou Flexbox pour une grille cohérente
- [ ] Layout est responsive (mobile, tablet, desktop)
- [ ] Classes de style sont centralisées et utilisent les design tokens
- [ ] Composant est documenté avec JSDoc
- [ ] Design tokens (couleurs, espacements, typographie) sont appliqués de manière cohérente

## Related Epic

[Epic 0 — AppShell MVP](epic-0-mvp/epic.md)

## Related Slices

[Slice 1 — Layout Structure](../../../how/slices/slice-1-layout/slice.md)
