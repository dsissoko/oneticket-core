# US-004 — Gestion des vies et écran de game over

## Story

- **Résumé :** En tant que joueur, je veux perdre une vie chaque fois que la balle atteint le bas de l'écran et voir un écran de game over après avoir épuisé mes 3 vies, afin de savoir l'état actuel de ma partie.

### Use Case

- **En tant que** joueur de Breakout
- **Je veux** voir mon compteur de vies diminuer quand la balle sort du jeu par le bas, et voir un écran de game over après la perte de ma 3ème vie
- **afin que** je comprenne mon progression dans le jeu et puisse relancer une nouvelle partie

## Expected Behavior

- Le joueur démarre chaque partie avec exactement **3 vies**
- Chaque fois que la balle atteint le bas de l'écran (sortie du jeu), une vie est perdue
- Le compteur de vies s'affiche en permanence pendant le jeu et se met à jour visuellement après chaque perte
- Après la perte de la 3ème vie, un **écran de game over** s'affiche immédiatement
- L'écran de game over propose deux options : **« Rejouer »** pour lancer une nouvelle partie, **« Retour au menu »** pour retourner à l'écran d'accueil

## Acceptance Criteria

### Scenario 1: Perte d'une vie
- **Given:** Je suis en cours de partie avec 3 vies affichées
- **and Given:** La balle est en mouvement
- **When:** La balle atteint le bas de l'écran (sous la palette)
- **Then:** Le compteur de vies passe de 3 à 2
- **and Then:** La balle respawn au-dessus de la palette au centre

### Scenario 2: Passage de 2 vies à 1 vie
- **Given:** Je suis en cours de partie avec 2 vies affichées
- **and Given:** La balle est en mouvement
- **When:** La balle atteint le bas de l'écran (sous la palette)
- **Then:** Le compteur de vies passe de 2 à 1
- **and Then:** La balle respawn au-dessus de la palette au centre

### Scenario 3: Game over après perte de la 3ème vie
- **Given:** Je suis en cours de partie avec 1 vie affichée
- **and Given:** La balle est en mouvement
- **When:** La balle atteint le bas de l'écran (sous la palette)
- **Then:** Le compteur de vies passe de 1 à 0
- **and Then:** L'écran de jeu disparaît et un écran de game over s'affiche
- **and Then:** Le message « Game Over » est visible
- **and Then:** Deux boutons sont présents : « Rejouer » et « Retour au menu »

### Scenario 4: Rejouer depuis l'écran de game over
- **Given:** L'écran de game over est affiché
- **When:** Je clique sur le bouton « Rejouer »
- **Then:** Une nouvelle partie démarre immédiatement
- **and Then:** Le compteur de vies est réinitialisé à 3
- **and Then:** La balle respawn au-dessus de la palette au centre
- **and Then:** Le jeu reprend avec les briques remplies

### Scenario 5: Retour au menu depuis l'écran de game over
- **Given:** L'écran de game over est affiché
- **When:** Je clique sur le bouton « Retour au menu »
- **Then:** L'écran de game over disparaît
- **and Then:** L'écran du menu principal s'affiche

## Related Epic

Voir [Epic 0 — MVP Breakout](../epic.md)

## Related Slices

- [Slice 4 — Lives System & Game Over Screen](../../../../how/slices/slice-04-lives-system/slice.md)
