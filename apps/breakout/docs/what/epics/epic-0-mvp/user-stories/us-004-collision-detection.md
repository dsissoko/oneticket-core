# US-004 — Détection de collision et destruction des briques

## Story

En tant que joueur, je veux que les briques disparaissent quand je les touche avec la balle, afin de progresser dans le jeu et d'avoir un objectif clair.

## Expected Behavior

- La balle détecte les collisions avec chaque brique individuellement
- Une brique disparaît immédiatement après la collision avec la balle
- La balle rebondit après une collision avec une brique (inverse de la composante Y ou X selon l'angle d'impact)
- Le système de détection est fiable et détecte tous les rebonds
- Une brique ne peut être touchée qu'une seule fois (elle disparaît définitivement)
- La progression du jeu est visible (nombre de briques restantes diminue)

## Acceptance Criteria

```gherkin
Feature: Détection de collision et destruction des briques

Scenario: Balle détruit une brique lors du contact
  Given La partie est en cours
  And Une brique est visible
  When La balle entre en contact avec la brique
  Then La brique disparaît immédiatement de l'écran
  And La balle rebondit

Scenario: Balle rebondit après destruction d'une brique
  Given La balle se déplace vers une brique
  When La collision est détectée
  Then La brique est détruite
  And La balle change de direction (rebond)
  And Le rebond respecte la vélocité en place

Scenario: Une brique ne peut être détruite qu'une fois
  Given Une brique a été détruite
  When La balle repasse par la même zone
  Then La brique ne réapparaît pas
  And Aucune nouvelle collision n'est détectée

Scenario: Toutes les briques peuvent être touchées
  Given Le mur complet de 50 briques est visible (5 lignes × 10)
  When La balle passe par chaque brique
  Then Chaque brique est détruite exactement une fois
  And Le joueur peut détruire le mur complet

Scenario: Progression visible du nombre de briques restantes
  Given Le jeu commence avec 50 briques
  When Des briques sont détruites progressivement
  Then Le nombre de briques affichées diminue
  And L'affichage se met à jour en temps réel

Scenario: Aucune brique ne passe à travers la balle
  Given La balle se déplace rapidement
  When La balle traverse une brique
  Then La collision est détectée (pas de "tunneling")
  And La brique est détruite
```

## Technical Notes

- Implémenter une détection de collision AABB (Axis-Aligned Bounding Box) ou par radius
- Stocker l'état des briques (destroyed = true/false)
- Déterminer l'angle de rebond selon le côté de collision (haut/bas = inversion Y, gauche/droite = inversion X)
- Gérer le cas où la balle passe plusieurs briques en un frame (tunneling) avec une détection à grain fin

## Related Slices

À définir lors de l'implémentation.
