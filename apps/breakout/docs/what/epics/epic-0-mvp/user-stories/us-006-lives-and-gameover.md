# User Story

## Story

En tant que joueur, je veux un système de 3 vies où je perds une vie si la balle atteint le bas de l'écran, afin d'avoir des conséquences aux erreurs et une pression de jeu.

## Expected Behavior

- Joueur commence avec 3 vies
- Balle atteint bas de l'écran = perte de 1 vie
- Affichage du nombre de vies restantes
- À 0 vies, partie terminée (game over)
- Game over affiche message et options (rejouer/quitter)

## Acceptance Criteria

- [ ] Vies initialisées à 3
- [ ] Détection balle sortie bas de l'écran
- [ ] Décrémentation vies, réinitialisation balle après perte
- [ ] Affichage vies en temps réel
- [ ] Transition game over à 0 vies
- [ ] Menu game over avec options

## Related Slices

- slice-2-game-engine
- slice-5-game-flow-and-ui
