---
title: 'US-004 — Gérer les vies et la fin de partie'
---

# US-004 — Gérer les vies et la fin de partie

## Story

En tant que joueur, je veux disposer de 3 vies au début, en perdre une quand la balle atteint le bas de l'écran, et voir clairement quand la partie se termine (victoire ou défaite), afin de comprendre l'état du jeu et savoir si j'ai gagné ou perdu.

## Expected Behavior

- La partie commence avec 3 vies affichées visiblement
- À chaque fois que la balle tombe en bas, une vie est perdue et la balle est repositionnée
- Le compteur de vies se met à jour après chaque perte
- Si le nombre de vies atteint 0, la partie se termine (game over / défaite)
- Si toutes les briques sont détruites, la partie se termine (victoire)
- Un écran de fin clair affiche soit « Victoire », soit « Défaite »

## Acceptance Criteria

- [ ] Le compteur de vies est affiché et initialisé à 3
- [ ] Le compteur décrémente quand la balle passe la ligne basse
- [ ] La balle est repositionnée sur la raquette après la perte d'une vie
- [ ] Le jeu détecte l'état « 0 vies restantes »
- [ ] Le jeu détecte l'état « toutes les briques détruites »
- [ ] Un écran distinct est affiché pour la victoire et la défaite
- [ ] L'écran de fin affiche le résultat final de manière claire et lisible

## Related Slices

- Slice 1 — Moteur de rendu et boucle de jeu
- Slice 3 — Interface utilisateur et menus
