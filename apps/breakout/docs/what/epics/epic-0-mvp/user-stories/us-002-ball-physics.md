# User Story

## Story

En tant que joueur, je veux que la balle rebondisse sur les murs, le plafond et la raquette avec une physique réaliste, afin de jouer à un jeu arcade classique.

## Expected Behavior

La balle doit rebondir selon l'angle d'incidence lorsqu'elle frappe un mur, le plafond ou la raquette. Lorsque la balle atteint le bas sans être frappée par la raquette, une vie est perdue et la balle réapparaît.

## Acceptance Criteria

```gherkin
Given une balle en mouvement
When elle frappe un mur/plafond/raquette
Then elle rebondit selon l'angle d'incidence

When elle atteint le bas sans raquette
Then une vie est perdue et la balle réapparaît
```

## Related Slices
