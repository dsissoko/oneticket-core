# User Story

## Story
En tant que joueur, je veux que la balle rebondisse correctement sur les murs, le plafond, la raquette et les briques, afin que le jeu soit prévisible et juste.

## Expected Behavior
- Balle rebondit sur murs gauche/droite (angle reflété)
- Balle rebondit sur plafond (angle reflété)
- Balle rebondit sur raquette (angle selon position impact)
- Balle rebondit sur briques (destructrices)
- Aucun phénomène de "stick" (balle ne reste pas coincée)

## Acceptance Criteria
- [ ] Collision detection murs/plafond/raquette/briques implémentée
- [ ] Physique de rebond réaliste (angle d'incidence = angle de réflexion)
- [ ] Pas de glitch de collision
- [ ] Vitesse constante entre rebonds
- [ ] Balle destruire briques au contact

## Related Slices
- slice-2-game-engine
- slice-4-brick-collision
