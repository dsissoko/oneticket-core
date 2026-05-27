---
title: 'US-002 — Implémenter la physique de la balle'
---

# US-002 — Implémenter la physique de la balle

## Story

En tant que joueur, je veux que la balle rebondisse de manière réaliste sur les murs, le plafond, la raquette et les briques, afin de créer une expérience de jeu fluide et intuitive.

## Expected Behavior

- La balle se déplace en ligne droite avec une vélocité et une direction
- La balle rebondit sur les murs gauche et droite (change de direction horizontale)
- La balle rebondit sur le plafond (change de direction verticale)
- La balle rebondit sur la raquette (change de direction verticale)
- La balle rebondit sur les briques (change de direction verticale ou horizontale selon l'impact)
- Si la balle atteint le bas de l'écran, elle déclenche la perte d'une vie

## Acceptance Criteria

- [ ] La balle se déplace continuellement selon sa vélocité
- [ ] Chaque collision avec un mur/plafond/raquette/brique fait rebondir la balle
- [ ] Les rebonds sont mathématiquement cohérents (angle d'incidence ≈ angle de réflexion)
- [ ] La vitesse de la balle est réglable et affecte la difficulté du jeu
- [ ] Aucun comportement de "stuck" (balle bloquée) ne se produit
- [ ] Les collisions sont détectées chaque frame sans lag perceptible

## Related Slices

- Slice 2 — Physique de la balle et collisions
