---
title: 'US-005 — Créer le système de menus'
---

# US-005 — Créer le système de menus

## Story

En tant que joueur, je veux voir un menu principal pour démarrer le jeu, une option pour rejouer après la fin d'une partie, et une option pour quitter, afin de naviguer facilement entre les états du jeu.

## Expected Behavior

- L'écran initial affiche un menu principal avec les boutons « Démarrer », « Paramètres », et « Quitter »
- Cliquer sur « Démarrer » lance une nouvelle partie
- À la fin d'une partie (victoire ou défaite), un écran propose « Rejouer » et « Quitter »
- Les menus sont navigables à la souris
- Les menus disparaissent quand une partie commence et réapparaissent quand elle finit

## Acceptance Criteria

- [ ] Le menu initial est affiché au lancement
- [ ] Le bouton « Démarrer » initialise une nouvelle partie
- [ ] Le bouton « Paramètres » accède au slider de vitesse (intégration avec US-006)
- [ ] Le bouton « Quitter » réinitialise le jeu à l'état menu principal (ou ferme la fenêtre)
- [ ] Le menu de fin est affiché après victoire ou défaite
- [ ] Les boutons « Rejouer » et « Quitter » fonctionnent correctement
- [ ] Les menus sont stylisés de manière lisible et cohérente

## Related Slices

- Slice 3 — Interface utilisateur et menus
