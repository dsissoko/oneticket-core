# US-001 — Initialiser Canvas et boucle de jeu

## Story

En tant que joueur, je veux que le canvas 2D soit initialisé et la boucle de jeu démarre via requestAnimationFrame, afin que le jeu soit prêt à recevoir les inputs.

## Expected Behavior

- Canvas 2D est créé et rendu sans erreur à l'initialisation
- Delta time est calculé correctement entre chaque frame
- Boucle de jeu s'exécute à 60fps de manière stable
- requestAnimationFrame gère le cycle de rendu du navigateur

## Acceptance Criteria

```gherkin
Scenario: Canvas initialization and game loop setup
  Given le navigateur charge l'application
  When la page est initialisée
  Then le canvas s'affiche sans erreur
  And le delta time est calculé correctement entre les frames
  And la boucle s'exécute à 60fps de manière stable
```

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
