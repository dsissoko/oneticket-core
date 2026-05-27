# US-006 — Conditions de victoire et défaite

## Story

En tant que joueur, je veux une fin de partie claire quand toutes les briques sont cassées ou que je n'ai plus de vies, afin de savoir si j'ai gagné ou perdu et de pouvoir rejouer.

## Expected Behavior

- **Victoire** : Lorsque toutes les briques sont détruites (nombre de briques = 0)
- **Défaite** : Lorsque le joueur atteint 0 vies
- Un écran de victoire s'affiche avec un message congratulatoire et les statistiques
- Un écran de défaite (Game Over) s'affiche avec un message et l'option de rejouer
- Le jeu s'arrête immédiatement quand une condition est atteinte
- Un bouton "Rejouer" permet de relancer une nouvelle partie avec le menu de vitesse
- Les états finaux sont clairement distingués et mémorables

## Acceptance Criteria

```gherkin
Feature: Conditions de victoire et défaite

Scenario: Joueur gagne en détruisant toutes les briques
  Given La partie est en cours
  And Il reste 1 brique
  When La balle détruit la dernière brique
  Then L'écran de victoire s'affiche
  And Le message "Vous avez gagné!" ou similaire apparaît
  And Le jeu s'arrête

Scenario: Écran de victoire affiche les informations
  Given Le joueur a gagné
  When L'écran de victoire s'affiche
  Then Les statistiques de la partie sont visibles
  And Un bouton "Rejouer" est disponible

Scenario: Joueur perd en épuisant ses 3 vies
  Given Le joueur a 1 vie restante
  When La balle sort une dernière fois
  Then L'affichage passe à "Vies: 0"
  And L'écran "Game Over" s'affiche
  And Le message "Game Over" ou similaire apparaît

Scenario: Écran Game Over permet de rejouer
  Given Le joueur a perdu
  When L'écran Game Over s'affiche
  Then Un bouton "Rejouer" est disponible
  And Cliquer sur "Rejouer" relance le menu de vitesse

Scenario: Jeu s'arrête immédiatement à la victoire
  Given La victoire est atteinte
  When L'écran de victoire s'affiche
  Then Aucune action de jeu ne continue
  And Aucune balle n'est en mouvement
  And Aucune brique ne bouge

Scenario: Jeu s'arrête immédiatement à la défaite
  Given La défaite est atteinte
  When L'écran Game Over s'affiche
  Then Aucune action de jeu ne continue
  And La balle s'arrête de bouger
  And Aucune interaction n'est possible sauf "Rejouer"

Scenario: Rejouer démarre une nouvelle partie
  Given L'écran de victoire ou défaite est affiché
  When L'utilisateur clique sur "Rejouer"
  Then Le menu de sélection de vitesse réapparaît
  And Un nouvel écran de jeu vierge est prêt
  And Les statistiques de la partie précédente sont réinitialisées
```

## Technical Notes

- Ajouter une fonction `checkWinCondition()` qui vérifie si bricks.filter(b => !b.destroyed).length === 0
- Ajouter une fonction `checkLoseCondition()` qui vérifie si lives === 0
- Implémenter un état `gameState` avec valeurs : "menu", "playing", "won", "lost"
- Afficher les écrans correspondants selon `gameState`
- Implémenter un bouton "Rejouer" qui réinitialise l'état et revient au menu

## Related Slices

À définir lors de l'implémentation.
