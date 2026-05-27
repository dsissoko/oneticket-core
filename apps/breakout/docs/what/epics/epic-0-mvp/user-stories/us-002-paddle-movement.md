# US-002 — Contrôle de la raquette

## Story

En tant que joueur, je veux déplacer la raquette avec les flèches gauche/droite du clavier, afin de contrôler le rebond de la balle et progresser dans le jeu.

## Expected Behavior

- La raquette répond instantanément aux entrées clavier (Flèche gauche / Flèche droite)
- La raquette se déplace horizontalement à vitesse constante
- La raquette ne peut pas sortir de l'écran (reste dans les limites gauche/droite)
- Le mouvement de la raquette est fluide et réactif
- La raquette peut être contrôlée pendant que le jeu est en cours
- Le contrôle reste actif jusqu'à la fin de la partie (victoire/défaite)

## Acceptance Criteria

```gherkin
Feature: Contrôle de la raquette

Scenario: Joueur déplace la raquette vers la droite
  Given La partie est en cours
  And La raquette est au centre
  When L'utilisateur appuie sur la Flèche droite
  Then La raquette se déplace vers la droite
  And Le mouvement est continu tant que la touche est maintenue

Scenario: Joueur déplace la raquette vers la gauche
  Given La partie est en cours
  And La raquette est au centre
  When L'utilisateur appuie sur la Flèche gauche
  Then La raquette se déplace vers la gauche
  And Le mouvement est continu tant que la touche est maintenue

Scenario: Raquette respecte les limites de l'écran
  Given La raquette est au bord gauche de l'écran
  When L'utilisateur appuie sur la Flèche gauche
  Then La raquette ne sort pas de l'écran
  And La raquette reste en contact avec le bord gauche

Scenario: Raquette reste visible pendant toute la partie
  Given La partie est lancée
  When N'importe quel événement se produit (collision, rebond)
  Then La raquette reste visible et contrôlable
  And Aucun état ne désactive le contrôle de la raquette
```

## Technical Notes

- Utiliser `keydown` et `keyup` pour détecter les appuis sur les flèches
- Maintenir l'état des touches pressées pour un mouvement fluide
- Appliquer une vitesse de déplacement indépendante de la vitesse de la balle

## Related Slices

À définir lors de l'implémentation.
