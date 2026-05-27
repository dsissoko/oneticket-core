# Epic 0 — MVP Breakout

## Goal

Créer une implémentation complète et jouable du jeu arcade classique Breakout en JavaScript vanilla, permettant aux joueurs de détruire un mur de briques en contrôlant une raquette pour rebondir une balle, avec un système de vies et un menu de configuration de la difficulté.

## Business Value

- **Accessibilité** : Jeu arcade classique jouable directement dans le navigateur sans installation ni dépendances externes
- **Engagement utilisateur** : Mécanique addictive avec progression visible (3 vies, destruction de briques, victoire/défaite)
- **Extensibilité** : Architecture vanilla JS bien structurée, prête pour des évolutions futures (niveaux, scores persistants, bonus)
- **Expérience utilisateur** : Contrôles réactifs au clavier, menu de configuration de vitesse, interface intuitive

## Scope

Cette épic couvre les fonctionnalités essentielles du MVP :

1. **Rendu graphique** — Affichage du plateau de jeu (balle, raquette, briques, murs)
2. **Contrôles joueur** — Déplacement de la raquette avec les flèches gauche/droite
3. **Physique et collisions** — Rebond réaliste de la balle sur murs, plafond, raquette et briques
4. **Détection de collisions** — Destruction des briques lors de la collision avec la balle
5. **Gestion des vies** — Système de 3 vies avec affichage et perte de vie au bas de l'écran
6. **États de fin de partie** — Conditions de victoire (toutes briques détruites) et défaite (plus de vies)
7. **Menu de configuration** — Écran de sélection de la vitesse de balle (5 niveaux)
8. **Navigation menu** — Écrans titre, configuration, victoire et défaite

### Hors scope (Futures versions)
- Système de niveaux progressifs
- Persistance de scores (leaderboard)
- Sons et musiques
- Animations avancées
- Support tactile mobile
- Multiplayer
- Thèmes visuels alternatifs
- Système de puissances/bonus

## Related User Stories

- US-001 — Affichage du plateau de jeu
- US-002 — Contrôle de la raquette
- US-003 — Physique de la balle
- US-004 — Détection de collision et destruction des briques
- US-005 — Système de 3 vies
- US-006 — Conditions de victoire et défaite
- US-007 — Menu de réglage de la vitesse

## Related Slices

À définir lors de la phase d'implémentation avec l'architecte.
