Crée le fichier epic.md pour l'epic MVP du Breakout. Utilise le template dans .oneticket/templates/epic.md et remplis-le basé sur la product-spec.md (tâche A) avec les informations suivantes :

## Goal
Impémenter un jeu Breakout jouable avec tous les mécaniques de base : contrôle raquette, rebond balle, destruction briques, système de vies, menus et contrôle de difficulté.

## Business Value
Fournir une expérience de jeu arcade fonctionnelle et amusante, démontrant la viabilité d'un jeu en pur frontend JS vanilla sans dépendances externes.

## Scope
Cet epic couvre :
1. Setup du projet (HTML/CSS/JS structure)
2. Game engine avec physics et collision detection
3. Raquette contrôlable par clavier
4. Balle rebondissant sur tous les obstacles
5. Système de briques (5 lignes) destructibles
6. Système de vies (3 vies, game over à 0)
7. Conditions de victoire (0 briques) et défaite (0 vies)
8. Menu principal (démarrer, rejouer, quitter)
9. Slider pour ajuster vitesse de balle
10. Affichage score/vies en temps réel

Hors scope pour MVP :
- Niveaux progressifs
- Sauvegarde scores
- Power-ups
- Sons/musique
- Animations avancées

## Related User Stories
- us-001-game-setup
- us-002-game-engine
- us-003-paddle-control
- us-004-ball-physics
- us-005-brick-system
- us-006-lives-and-gameover
- us-007-victory-condition
- us-008-menu-system
- us-009-difficulty-control
- us-010-ui-display

## Related Slices
- slice-1-project-setup
- slice-2-game-engine
- slice-3-paddle-and-rendering
- slice-4-brick-collision
- slice-5-game-flow-and-ui
