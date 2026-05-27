# US-001 — Affichage du plateau de jeu

## Story

En tant que joueur, je veux voir le mur de briques et la raquette à l'écran, afin de commencer à jouer.

## Expected Behavior

À la première ouverture du jeu, le joueur voit :
- Un mur de briques organisé en grille (5 lignes horizontales, 10 briques par ligne)
- Une balle positionnée au centre-haut de l'écran
- Une raquette positionnée au centre-bas de l'écran
- Les murs latéraux et le plafond (zone de collision)
- Un affichage des vies actuelles (3 initiales)

## Acceptance Criteria

```gherkin
Feature: Affichage du plateau de jeu Breakout

Scenario: Joueur voit le plateau initial
  Given L'application Breakout est ouverte
  When La page se charge
  Then Le mur de briques est visible avec 5 lignes de 10 briques chacune
  And La balle est visible au centre-haut de l'écran
  And La raquette est visible au centre-bas de l'écran
  And Les 3 vies initiales sont affichées

Scenario: Plateau s'ajuste à la taille de l'écran
  Given Le plateau de jeu est affiché
  When La fenêtre change de taille
  Then Les éléments du jeu restent positionnés correctement
  And Les proportions du jeu sont maintenues

Scenario: Affichage du menu avant démarrage
  Given L'application a démarré
  When L'utilisateur n'a pas lancé la partie
  Then Un menu de sélection de vitesse s'affiche
  And Un bouton "Jouer" ou confirmation est visible
```

## Related Slices

À définir lors de l'implémentation.
