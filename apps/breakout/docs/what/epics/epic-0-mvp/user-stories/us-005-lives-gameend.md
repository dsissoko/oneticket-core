# US-005 — Lives & Game End

## Story

En tant que joueur,
je veux que le jeu gère mes 3 vies et se termine quand je les perds toutes,
afin de avoir un défi et une fin claire.

## Status

- In Progress

## Expected Behavior

- Le jeu attribue 3 vies au démarrage
- À chaque fois que la balle atteint le bas, une vie est perdue
- L'affichage des vies restantes est visible à tout moment
- Après la perte d'une balle, le jeu remet en place une nouvelle balle et continue
- Lorsque les 3 vies sont perdues, le jeu affiche "Game Over"

## Acceptance Criteria

**Given** la partie en cours,
**When** la balle atteint le bas 3 fois,
**Then** affiche Game Over.

**Given** la partie en cours,
**When** j'ai au moins une vie,
**Then** le jeu continue après une perte de balle.

**Given** la partie est active,
**When** à tout moment,
**Then** l'affichage des vies restantes est visible.

## Related Slices

- [Vertical Slice: Lives Management](../../how/slices/)
