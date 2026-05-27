# User Story

## Story

En tant que joueur, je veux contrôler la raquette avec les flèches gauche et droite du clavier, afin de rattraper la balle et poursuivre le jeu.

## Expected Behavior

- La raquette se déplace vers la gauche lorsque la flèche gauche est appuyée
- La raquette se déplace vers la droite lorsque la flèche droite est appuyée
- La raquette ne sort pas des limites de l'écran

## Acceptance Criteria

```gherkin
Given la raquette en place
When j'appuie sur la flèche gauche
Then la raquette se déplace vers la gauche

When j'appuie sur la flèche droite
Then la raquette se déplace vers la droite

And la raquette ne sort pas des limites de l'écran
```

## Related Slices
