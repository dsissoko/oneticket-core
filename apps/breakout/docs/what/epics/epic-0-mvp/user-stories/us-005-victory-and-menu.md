# US-005 — Victoire et Menu

## Story

En tant que joueur, je veux voir un écran de victoire quand toutes les briques sont détruites, et accéder à un menu avec les options démarrer, rejouer et quitter, afin de naviguer dans l'application.

## Expected Behavior

### Menu Principal
- Affichage d'un écran menu principal au démarrage de l'application
- Présence de trois boutons principaux : Démarrer, Options, Quitter
- Chaque bouton répond à l'interaction à la souris (hover, click)
- Navigation entièrement gérée à la souris (pas de clavier requis)

### Écran de Victoire
- Affichage automatique quand tous les briques sont détruites (dernier brick détruit)
- Message de victoire clair et visible (ex: "Victoire!" ou "All bricks destroyed!")
- Présence d'un bouton Rejouer pour démarrer une nouvelle partie
- Présence d'un bouton Retour au Menu pour revenir à l'écran principal

### Écran de Défaite (Game Over)
- Affichage automatique quand les vies atteignent 0
- Message de défaite clair et visible
- Présence d'un bouton Rejouer pour démarrer une nouvelle partie
- Présence d'un bouton Retour au Menu pour revenir à l'écran principal

### Fonctionnalités du Menu
- **Démarrer** : Lance une nouvelle partie (réinitialise les briques, les vies, la position du ballon)
- **Options** : Affiche le curseur de vitesse de ballon (plage: très lent à très rapide)
- **Rejouer** : Lance une nouvelle partie après victoire ou défaite
- **Quitter** : Ferme l'application ou revient à l'écran menu principal
- **Curseur de Vitesse** : Ajustable en temps réel, persiste pendant que le menu est ouvert, réinitialise à la valeur par défaut (moyen) au démarrage d'une nouvelle session

## Acceptance Criteria

- [ ] Affichage d'un écran victoire quand toutes les briques sont détruites
- [ ] Présence d'un menu principal avec boutons : Démarrer, Options, Quitter
- [ ] Option Rejouer disponible après une partie (victoire ou game over)
- [ ] Le menu est navigué à la souris
- [ ] Fermeture de l'application depuis le menu Quitter
- [ ] Transitions fluides entre les écrans (menu, victoire, défaite, jeu)
- [ ] Boutons avec états visuels clairs (hover, active, default)
- [ ] Curseur de vitesse visible et fonctionnel dans le menu Options

## Related Epic

- [Epic 0 — MVP Breakout](../epic.md)

## Related Slices

- [Slice 5 — Victory Screen & Menu Navigation](../../../../how/slices/slice-05-victory-menu/slice.md)
