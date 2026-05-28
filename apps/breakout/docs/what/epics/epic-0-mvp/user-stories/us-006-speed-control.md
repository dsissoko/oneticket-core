# US-006 — Contrôle de la vitesse de la balle

## Story

- **As a** joueur
- **I want to** ajuster la vitesse de la balle via un slider dans le menu des options
- **so that** je peux choisir le niveau de difficulté qui me convient et adapter le jeu à mon habileté

## Expected Behavior

Un slider de contrôle de vitesse est accessible depuis le menu principal permettant au joueur de varier la vitesse initiale de la balle entre une plage de très lente (0.5x) à très rapide (2x) la vitesse normale. La vitesse sélectionnée s'applique immédiatement au démarrage d'une nouvelle partie et sa valeur est conservée entre les sessions de jeu.

## Acceptance Criteria

- **Scenario:** Joueur accède au menu Options et ajuste la vitesse de la balle
- **Given:** je suis sur l'écran du menu principal
- **and Given:** le menu Options contient un slider de vitesse
- **When:** j'ajuste le slider de vitesse de la balle
- **Then:** le slider affiche une valeur dans la plage : très lente → très rapide (ex. 0.5x à 2x)

- **Scenario:** Vitesse appliquée au démarrage d'une partie
- **Given:** j'ai défini une vitesse spécifique via le slider
- **and Given:** je démarre une nouvelle partie
- **When:** la balle commence à se déplacer
- **Then:** la vitesse de la balle correspond à la valeur que j'ai sélectionnée

- **Scenario:** Persistance de la valeur du slider entre les sessions
- **Given:** j'ai défini une vitesse spécifique (ex. 1.5x)
- **and Given:** j'ai fermé le jeu
- **When:** je relance le jeu et retourne au menu
- **Then:** le slider affiche toujours la valeur 1.5x que j'avais définie

## Related Epic

[Epic 0 — MVP Breakout](../epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
