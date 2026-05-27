---
title: 'US-006 — Naviguer dans les menus'
---

# US-006 — Naviguer dans les menus (démarrer, rejouer, quitter)

## Story

En tant que joueur, je veux pouvoir démarrer une partie, recommencer après une défaite, ou quitter le jeu via des menus intuitifs, afin de contrôler mon expérience de jeu.

## Expected Behavior

Le joueur interagit avec des menus accessibles à la souris pour contrôler le flux du jeu :

- **Menu Principal** : affiche un bouton "Démarrer" qui lance une nouvelle partie
- **Écran Fin de Partie** : après une victoire ou défaite, affiche deux boutons :
  - "Rejouer" : réinitialise le jeu et commence une nouvelle partie
  - "Quitter" : retourne au menu principal
- Les transitions entre écrans sont fluides et sans délai

## Acceptance Criteria

```gherkin
Feature: Naviguer dans les menus du jeu

  Scenario: Lancer une partie depuis le menu principal
    Given l'application est lancée
    When j'accède au menu principal
    Then je vois le bouton "Démarrer"
    When je clique sur "Démarrer"
    Then la partie commence

  Scenario: Rejouer après une défaite ou victoire
    Given j'ai perdu ou gagné
    When l'écran "Fin de partie" s'affiche
    Then je vois le bouton "Rejouer"
    And je vois le bouton "Quitter"
    When je clique sur "Rejouer"
    Then une nouvelle partie démarre

  Scenario: Quitter le jeu
    Given l'écran "Fin de partie" s'affiche
    When je clique sur "Quitter"
    Then je reviens au menu principal
```

## Related Slices

- Slice 5: Speed slider and game state management
- Slice 6: UI menus and screen transitions
