---
title: 'US-006 — Implémenter le slider de vitesse'
---

# US-006 — Implémenter le slider de vitesse

## Story

En tant que joueur, je veux ajuster la vitesse de la balle via un slider avant de lancer une partie, afin de choisir le niveau de difficulté qui me convient.

## Expected Behavior

- Un slider est accessible depuis le menu « Paramètres »
- Le slider a une plage allant de « très lente » à « très rapide »
- Le joueur peut voir en temps réel comment la vitesse affecte la balle (aperçu optionnel)
- La vitesse choisie est appliquée au lancement de la partie
- La vitesse persiste entre les parties tant que le joueur ne la change pas

## Acceptance Criteria

- [ ] Un slider est rendu et fonctionnel dans le menu des paramètres
- [ ] Le slider a au minimum 5 positions distinctes (très lente → très rapide)
- [ ] La position du slider affecte directement la vélocité initiale de la balle
- [ ] La valeur du slider est mémorisée (localStorage ou variable d'état)
- [ ] La valeur du slider est appliquée à la prochaine partie lancée
- [ ] L'étiquette ou l'affichage du slider montre clairement la plage (ex. « Vitesse : lent → rapide »)

## Related Slices

- Slice 3 — Interface utilisateur et menus
