# US-001 — Initialisation et affichage du jeu

## Story

En tant que joueur, je veux voir l'écran de jeu avec le mur de briques, la balle et la raquette, afin de comprendre la mécanique du jeu.

## Expected Behavior

À la première mise en jeu :
- Le canvas (ou grille de jeu) s'affiche avec un arrière-plan clair et délimité
- Un mur de briques est visible au-dessus du jeu (5 lignes de briques arrangées en grille régulière)
- Une balle est affichée au centre du jeu ou à proximité immédiate de la raquette
- Une raquette est visible et positionnée au bas de l'écran, centrée horizontalement
- Un compteur de vies affiche le nombre de vies restantes (3 au démarrage)

## Acceptance Criteria

- **Critère 1** — L'écran affiche un canvas ou une grille de 5 lignes de briques, avec des briques de dimensions régulières et espacement uniforme
- **Critère 2** — La balle est visible et rendue sur l'écran au centre ou à proximité immédiate de la raquette au démarrage du jeu
- **Critère 3** — La raquette est visible et positionnée au bas de l'écran, avec un positionnement horizontal correct et une épaisseur/hauteur appropriée
- **Critère 4** — Le compteur de vies est clairement affiché à l'écran avec le texte « Vies : 3 » ou similaire, et correspond à l'état initial du jeu

## Related Epic

[Epic 0 — MVP Breakout](../epic.md)

## Related Slices

- [Slice 1 — Game Setup & Display](../../how/slices/slice-01-game-setup/slice.md)
