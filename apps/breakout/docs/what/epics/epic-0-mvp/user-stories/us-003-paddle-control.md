# US-003 — Contrôle de la raquette

## Story

En tant que joueur, je veux contrôler la raquette avec les flèches gauche et droite du clavier, afin d'intercepter la balle.

## Expected Behavior

- Quand j'appuie sur la touche flèche gauche, la raquette se déplace vers la gauche
- Quand j'appuie sur la touche flèche droite, la raquette se déplace vers la droite
- La raquette s'arrête aux limites de l'écran (pas de débordement possible)
- Les entrées clavier sont traitées sans lag (réactivité immédiate)
- La raquette continue de se déplacer tant que la touche est maintenue enfoncée
- Relâcher la touche arrête le déplacement instantanément

## Acceptance Criteria

- [ ] La touche flèche gauche déplace la raquette vers la gauche
- [ ] La touche flèche droite déplace la raquette vers la droite
- [ ] La raquette s'arrête aux limites de l'écran
- [ ] Le contrôle est réactif (input lag minimal)
- [ ] La raquette ne sort jamais de la zone de jeu

## Related Epic

[Epic 0 — MVP Breakout](../epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
