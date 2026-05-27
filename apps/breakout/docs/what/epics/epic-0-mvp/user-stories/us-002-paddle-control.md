---
title: 'US-002 — Contrôler la raquette avec le clavier'
---

# US-002 — Contrôler la raquette avec le clavier

## Story

En tant que joueur, je veux déplacer ma raquette à gauche ou à droite avec les flèches du clavier, afin de contrôler la balle et l'empêcher de tomber.

## Expected Behavior

- Quand le joueur appuie sur la flèche gauche (←), la raquette se déplace vers la gauche.
- Quand le joueur appuie sur la flèche droite (→), la raquette se déplace vers la droite.
- La raquette s'arrête au bord gauche de l'aire de jeu et ne peut pas sortir par la gauche.
- La raquette s'arrête au bord droit de l'aire de jeu et ne peut pas sortir par la droite.
- Le mouvement est fluide et répond immédiatement aux appuis clavier.
- La raquette continue de suivre la balle sans latence perceptible.

## Acceptance Criteria

```gherkin
Scenario: Déplacer la raquette vers la gauche
  Given le jeu est en cours
  When j'appuie sur la flèche gauche
  Then la raquette se déplace vers la gauche
  And elle s'arrête au bord gauche de l'aire de jeu

Scenario: Déplacer la raquette vers la droite
  Given le jeu est en cours
  When j'appuie sur la flèche droite
  Then la raquette se déplace vers la droite
  And elle s'arrête au bord droit de l'aire de jeu

Scenario: Raquette ne sort pas de l'aire de jeu
  Given le jeu est en cours
  And la raquette est au bord gauche
  When j'appuie sur la flèche gauche
  Then la raquette reste au bord gauche

Scenario: Raquette intercepte la balle
  Given le jeu est en cours
  And la balle descend vers la raquette
  When je déplace la raquette pour aligner avec la balle
  Then la balle rebondit sur la raquette vers le haut
```

## Related Slices

- Slice 0: Game initialization and rendering pipeline
- Slice 2: Paddle control and boundary handling
