---
title: 'US-001 — Initialiser l''aire de jeu'
---

# US-001 — Initialiser l'aire de jeu

## Story

En tant que joueur, je veux voir une aire de jeu organisée avec un mur de briques, une raquette en bas et une balle prête à être lancée, afin de comprendre l'objectif du jeu et commencer à jouer.

## Expected Behavior

- L'aire de jeu affiche un mur de briques disposées sur 5 lignes
- La raquette est centrée en bas de l'aire de jeu
- La balle est positionnée au-dessus de la raquette, immobile
- Un score ou compteur de briques détruites est visible (optionnel à ce stade)

## Acceptance Criteria

- [ ] Le mur de briques est rendus avec 5 lignes de briques
- [ ] Chaque brique est un rectangle visible et cliquable visuellement
- [ ] La raquette est une barre horizontale en bas de l'écran
- [ ] La balle est un petit cercle positionné au-dessus de la raquette
- [ ] L'aire de jeu utilise le viewport complètement ou presque (responsive)
- [ ] Les éléments sont dessinés via Canvas ou HTML/CSS sans dépendances externes

## Related Slices

- Slice 1 — Moteur de rendu et boucle de jeu
