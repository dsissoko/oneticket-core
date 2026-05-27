# US-003 — Physique de la balle

## Story

En tant que joueur, je veux que la balle rebondisse sur les murs, le plafond et la raquette de manière réaliste, afin de jouer à un jeu physiquement crédible et prévisible.

## Expected Behavior

- La balle se déplace continuellement selon un vecteur de vélocité (composantes X et Y)
- La vitesse de la balle est réglable avant le démarrage de la partie (5 niveaux : très lente à très rapide)
- La balle rebondit sur les murs latéraux en inversant la composante X de sa vélocité
- La balle rebondit sur le plafond en inversant la composante Y de sa vélocité
- La balle rebondit sur la raquette en inversant la composante Y et peut ajuster son angle selon le point d'impact
- La balle se déplace de manière cohérente selon la vélocité appliquée
- La magnitude de la vélocité reste constante après un rebond (sauf changement volontaire)

## Acceptance Criteria

```gherkin
Feature: Physique et rebond de la balle

Scenario: Balle se déplace selon sa vélocité
  Given La partie est lancée
  And La balle a une vélocité initiale
  When La boucle de jeu s'exécute
  Then La position de la balle change à chaque frame selon sa vélocité
  And Le mouvement est continu et fluide

Scenario: Balle rebondit sur le mur gauche
  Given La balle se déplace vers la gauche
  When La balle atteint le bord gauche de l'écran
  Then La composante X de la vélocité est inversée
  And La balle change de direction vers la droite

Scenario: Balle rebondit sur le mur droit
  Given La balle se déplace vers la droite
  When La balle atteint le bord droit de l'écran
  Then La composante X de la vélocité est inversée
  And La balle change de direction vers la gauche

Scenario: Balle rebondit sur le plafond
  Given La balle se déplace vers le haut
  When La balle atteint le plafond
  Then La composante Y de la vélocité est inversée
  And La balle change de direction vers le bas

Scenario: Vitesse de la balle affecte le rebond
  Given La vitesse de balle a été réglée avant le démarrage
  When La balle rebondit
  Then La magnitude de la vélocité correspond au niveau de vitesse choisi
  And Le rebond respecte la vitesse configurée

Scenario: Vitesse peut être très lente
  Given L'utilisateur a sélectionné "Très lente"
  When La partie commence
  Then La balle se déplace très lentement
  And Le joueur a amplement de temps pour réagir

Scenario: Vitesse peut être très rapide
  Given L'utilisateur a sélectionné "Très rapide"
  When La partie commence
  Then La balle se déplace très rapidement
  And Le jeu est très difficile
```

## Technical Notes

- Implémenter la balle avec vecteur vélocité (vx, vy)
- Utiliser `requestAnimationFrame` pour la boucle de jeu
- La vitesse doit affecter la magnitude du vecteur, pas sa direction
- Considérer les 5 niveaux de vitesse : très lente (0.5x), lente (0.75x), normal (1.0x), rapide (1.5x), très rapide (2.0x)

## Related Slices

À définir lors de l'implémentation.
