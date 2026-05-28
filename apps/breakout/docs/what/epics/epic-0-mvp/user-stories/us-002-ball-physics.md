# US-002 — Ball Physics and Collision

## Story

En tant que joueur, je veux que la balle rebondisse de manière réaliste sur les briques, les murs, le plafond et la raquette, afin de jouer au jeu.

## Expected Behavior

- La balle se déplace en continu à travers l'écran de jeu
- Lorsque la balle entre en collision avec un obstacle (mur, plafond, raquette ou brique), elle change de direction selon l'angle d'impact
- Les briques disparaissent immédiatement après une collision avec la balle
- La position et la direction de la balle sont mises à jour à chaque frame du rendu
- Aucune balle ne reste coincée ou ne traverse un obstacle (tunneling)

## Acceptance Criteria

```gherkin
Given une partie en cours
And la balle est en mouvement

When la balle heurte un mur latéral
Then la composante horizontale de la vélocité s'inverse (rebond)
And la balle reste à l'intérieur de la zone de jeu

When la balle heurte le plafond
Then la composante verticale de la vélocité s'inverse (rebond)
And la balle reste à l'intérieur de la zone de jeu

When la balle heurte la raquette
Then la balle rebondit vers le haut
And l'angle de rebond dépend de la position d'impact sur la raquette
And le centre de la raquette produit un rebond vertical
And les extrémités de la raquette produisent un rebond angulaire

When la balle heurte une brique
Then la brique est détruite et disparaît du jeu
And la balle rebondit loin de la brique
And un seul rebond est résolu par frame (pas de multi-collisions)

When la position et la vélocité sont mises à jour
Then elles l'sont à chaque frame (60 FPS)
And les calculs sont suffisamment précis pour éviter tunneling
```

## Related Epic

[Epic 0 — MVP Breakout](../epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
