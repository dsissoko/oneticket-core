# US-005 — Système de 3 vies

## Story

En tant que joueur, je veux avoir 3 vies et en perdre une quand la balle sort par le bas de l'écran, afin de gérer le risque et d'avoir plusieurs tentatives pour terminer le jeu.

## Expected Behavior

- La partie commence avec 3 vies affichées à l'écran
- Le joueur voit le nombre de vies restantes en temps réel
- Une vie est perdue quand la balle franchit le bas de l'écran (y > hauteur_écran)
- Après la perte d'une vie, si des vies restent, la balle est relancée au centre-haut
- La balle relancée se déplace selon la vitesse configurée
- La raquette revient au centre après chaque perte de vie
- Un affichage clair indique le nombre de vies restantes (ex: "Vies: 2")

## Acceptance Criteria

```gherkin
Feature: Système de 3 vies

Scenario: Joueur commence avec 3 vies
  Given La partie vient de démarrer
  When L'écran se charge
  Then L'affichage montre "Vies: 3"
  And Le joueur a 3 tentatives

Scenario: Joueur perd une vie quand la balle sort
  Given La partie est en cours avec 3 vies
  And La balle est active
  When La balle franchit le bas de l'écran
  Then L'affichage passe à "Vies: 2"
  And Une vie a été perdue

Scenario: Balle est relancée après perte de vie
  Given Une vie vient d'être perdue
  And Des vies restent (> 0)
  When Le système détecte la perte
  Then La balle réapparaît au centre-haut
  And La raquette revient au centre
  And Le jeu continue

Scenario: Joueur peut perdre toutes ses vies
  Given Le joueur a 1 vie restante
  When La balle sort par le bas une dernière fois
  Then L'affichage passe à "Vies: 0"
  And L'écran "Game Over" s'affiche
  And La partie s'arrête

Scenario: Plusieurs pertes de vies successives
  Given La partie est en cours
  When La balle sort 3 fois
  Then Les vies passent de 3 → 2 → 1 → 0
  And L'affichage se met à jour après chaque perte
  And Le jeu se termine après la 3ème perte

Scenario: Affichage des vies toujours visible
  Given Une partie est lancée
  When N'importe quel événement se produit
  Then Le nombre de vies est toujours visible
  And L'affichage se met à jour en temps réel
```

## Technical Notes

- Utiliser un compteur `lives` initialisé à 3
- Décrémenter `lives` quand balle.y > canvas.height
- Relancer la balle si `lives > 0`
- Terminer la partie si `lives === 0`
- Garder l'affichage des vies constamment à jour

## Related Slices

À définir lors de l'implémentation.
