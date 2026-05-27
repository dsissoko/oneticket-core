---
title: 'US-003 — Implémenter la raquette et ses contrôles'
---

# US-003 — Implémenter la raquette et ses contrôles

## Story

En tant que joueur, je veux contrôler la raquette avec les flèches gauche et droite du clavier, afin de positionner précisément la raquette pour frapper la balle.

## Expected Behavior

- La raquette se déplace horizontalement quand je presse la flèche gauche ou droite
- La raquette s'arrête quand je relâche la touche ou atteint les bords de l'écran
- Le mouvement est fluide et réactif (pas de lag de plusieurs frames)
- La raquette ne peut pas sortir du côté gauche ou droit de l'aire de jeu

## Acceptance Criteria

- [ ] Les touches flèche gauche et droite sont détectées et traitées
- [ ] La raquette se déplace à une vitesse cohérente avec le reste du jeu
- [ ] La raquette ne dépasse jamais les limites horizontales de l'écran
- [ ] Le mouvement commence immédiatement après la pression de la touche
- [ ] Le mouvement s'arrête immédiatement après le relâchement de la touche
- [ ] Pas d'autres touches ou événements souris n'interfèrent avec les contrôles au clavier

## Related Slices

- Slice 1 — Moteur de rendu et boucle de jeu
