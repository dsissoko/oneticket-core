---
title: 'US-005 — Ajuster la vitesse de la balle via un slider'
---

# US-005 — Ajuster la vitesse de la balle via un slider

## Story

En tant que joueur, je veux pouvoir régler la vitesse de la balle avant ou pendant une partie, afin d'adapter la difficulté à mon niveau.

## Expected Behavior

- Un slider de contrôle de vitesse est accessible dans le menu et pendant le gameplay
- Le slider permet d'ajuster la vitesse de très lente à très rapide
- Les modifications de vitesse s'appliquent en temps réel
- Les préférences de vitesse sont sauvegardées localement

## Acceptance Criteria

### Scenario 1: Ajustement de la vitesse dans le menu
```gherkin
Given je suis dans le menu
When je manipule le slider de vitesse
Then la valeur change de très lente à très rapide
And le préférences sont sauvegardées
```

### Scenario 2: Vitesse appliquée pendant le jeu
```gherkin
Given une partie est en cours
When la balle se déplace
Then sa vitesse correspond au réglage du slider
```

## Related Slices

- Slice 5: Speed slider and game state management
