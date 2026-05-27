# US-001 — Initialiser le jeu et configurer l'aire de jeu

## Story

En tant que joueur, je veux voir une aire de jeu bien définie avec un mur de briques, afin de comprendre le cadre du jeu.

## Expected Behavior

Lors du chargement du jeu, l'aire de jeu doit être entièrement visible avec tous ses composants :
- Un mur de briques organisé en 5 lignes horizontales
- Une raquette positionnée au bas de l'aire de jeu
- Un compteur de vies affichant le nombre initial de vies (3)
- Un compteur de score affichant 0
- L'état initial du jeu en attente de commande du joueur

## Acceptance Criteria

```gherkin
Given j'accède au jeu
When la page charge
Then je vois l'aire de jeu avec le mur de briques (5 lignes)
And je vois ma raquette au bas
And le compteur de vies affiche 3
And le score affiche 0
```

## Related Slices

- Slice 0: Game initialization and rendering pipeline
