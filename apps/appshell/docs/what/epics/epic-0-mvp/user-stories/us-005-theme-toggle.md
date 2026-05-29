# US-005 — Theme Toggle

## Story

En tant qu'utilisateur, je veux switcher entre system/light/dark themes afin de tester la personnalisation.

## Expected Behavior

- Un composant ThemeToggle dans le Header permet de changer le theme
- Trois modes disponibles : system (défaut), light, dark
- Les changements sont persistés dans localStorage
- Les CSS variables changent immédiatement lors du switch
- next-themes gère la logique de theme
- Le contraste des couleurs respecte WCAG AA (≥4.5:1)

## Acceptance Criteria

- [ ] next-themes est intégré avec ThemeProvider en layout root
- [ ] Composant ThemeToggle dans Header avec bouton icône
- [ ] Switch permet de sélectionner : System (par défaut), Light, Dark
- [ ] Sélection est sauvegardée dans localStorage
- [ ] CSS variables root changent avec le theme :
  -   light : --background: white, --foreground: black, etc.
  -   dark : --background: #0d1117, --foreground: white, etc.
- [ ] Tous les éléments UI utilisent les CSS variables
- [ ] Transition smooth entre les themes (animation optionnelle)
- [ ] Page d'accueil affiche le theme courant et un boutton de test

## Related Epic

[Epic 0 — AppShell MVP](epic-0-mvp/epic.md)

## Related Slices

[Slice 4 — Theme Toggle](../../../how/slices/slice-4-theme/slice.md)
