# US-004 — Menu et slider vitesse de la balle

## Story

En tant que joueur, je veux régler la vitesse de la balle via un slider dans le menu avant de jouer, afin d'adapter la difficulté.

## Expected Behavior

Un menu s'affiche au démarrage du jeu avec un slider pour contrôler la vitesse de la balle. Le slider offre une gamme de vitesses de "très lent" à "très rapide". Une fois la vitesse sélectionnée, le joueur peut lancer la partie avec la balle à la vitesse configurée. Le menu reste accessible pendant le jeu et permet d'ajuster la vitesse en temps réel.

## Acceptance Criteria

```gherkin
Feature: Menu et slider vitesse de la balle
  
  Scenario: Menu affiche le slider vitesse
    Given Le jeu est lancé
    When Le menu s'affiche
    Then Un slider de vitesse est visible à l'écran
    
  Scenario: Slider offre la gamme de vitesses
    Given Le menu est visible
    Then Le slider affiche les valeurs de "très lent" à "très rapide"
    And La gamme couvre au minimum de 0.5x à 2.0x la vitesse de base
    
  Scenario: Vitesse appliquée au lancement de la balle
    Given Le joueur a sélectionné une vitesse avec le slider
    When La balle est lancée
    Then La balle se déplace à la vitesse sélectionnée
    
  Scenario: Souris contrôle le menu
    Given Le menu est visible
    When Le joueur bouge la souris
    Then Le slider répond au mouvement de la souris
    And Aucune action ne se déclenche en arrière-plan
```

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
