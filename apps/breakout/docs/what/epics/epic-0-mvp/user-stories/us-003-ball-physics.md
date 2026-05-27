---
title: 'US-003 — La balle rebondit sur les obstacles'
---

# US-003 — La balle rebondit sur les obstacles

## Story

En tant que joueur, je veux que la balle rebondisse réaliste-ment sur les obstacles (murs, plafond, raquette), afin que le jeu soit jouable et respecte les lois physiques de base.

## Expected Behavior

La balle se déplace en continu sur l'aire de jeu et change de direction au contact de chaque obstacle selon les lois de réflexion simples :
- Rebond sur les murs latéraux : direction horizontale inversée
- Rebond sur le plafond : direction verticale inversée
- Rebond sur la raquette : direction verticale inversée
- Si la balle atteint le bas de l'écran sans être interceptée par la raquette : le joueur perd une vie

## Acceptance Criteria

```gherkin
Scenario: Rebond sur mur latéral
  Given le jeu est en cours
  When la balle touche un mur latéral
  Then elle rebondit en changeant sa direction horizontale

Scenario: Rebond sur plafond
  Given le jeu est en cours
  When la balle touche le plafond
  Then elle rebondit en changeant sa direction verticale

Scenario: Rebond sur raquette
  Given le jeu est en cours
  When la balle touche la raquette
  Then elle rebondit en changeant sa direction verticale

Scenario: Perte de vie
  Given le jeu est en cours
  When la balle atteint le bas de l'écran sans intercepteur (raquette absente ou hors zone)
  Then le joueur perd une vie
  And la balle est repositionnée sur la raquette
```

## Related Slices

- Slice 1: Ball physics and collision detection
