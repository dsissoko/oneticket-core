Crée le fichier product-spec.md pour le projet Breakout. Utilise le template dans .oneticket/templates/product-spec.md et remplis-le avec les informations suivantes :

## Vision
Breakout est un jeu arcade frontend en JavaScript vanilla (HTML/CSS/JS) sans dépendances externes. Le joueur contrôle une raquette pour faire rebondir une balle et détruire un mur de briques avant de perdre ses 3 vies.

## Users and Actors
- Joueur : personne jouant au jeu, contrôlant la raquette avec les flèches gauche/droite du clavier

## Problems to Solve
- Offrir une expérience de jeu classique et accessible en pur frontend

## Product Goals
- Implémenter un jeu Breakout jouable et fonctionnel
- Permettre au joueur de contrôler facilement la raquette
- Proposer une difficulté ajustable via un slider de vitesse de balle

## Out of Scope
- Système de niveaux ou progression
- Sauvegarde/persistance des scores
- Multijoueur
- Graphiques avancés ou animations

## Business Concepts
- Balle : élément qui rebondit sur les murs, la raquette et les briques
- Raquette : contrôlée par le joueur avec les flèches gauche/droite
- Mur de briques : 5 lignes de briques à détruire pour gagner
- Vie : le joueur commence avec 3 vies, en perd une si la balle atteint le bas de l'écran
- Vitesse de balle : ajustable via slider dans le menu (très lente à très rapide)

## Product Capabilities
1. Gameplay : balle rebondissant sur murs, plafond et raquette
2. Contrôle joueur : déplacement raquette avec flèches gauche/droite
3. Système de vies : 3 vies, game over à 0 vies
4. Victoire : destruction de toutes les briques
5. Menu : démarrer la partie, rejouer, quitter
6. Contrôle de difficulté : slider pour régler la vitesse de la balle

## High-Level Workflows
1. Joueur accède au menu principal
2. Joueur ajuste la vitesse de la balle (optionnel) via slider
3. Joueur démarre la partie
4. Balle rebondit, joueur contrôle la raquette
5. Partie se termine par game over (0 vies) ou victoire (0 briques)
6. Joueur peut rejouer ou quitter

## Business Rules
- La raquette se déplace uniquement avec flèches gauche et droite du clavier
- La souris est réservée à la navigation dans les menus
- La balle rebondit sur les murs latéraux, le plafond, la raquette et les briques
- Chaque impact balle-brique détruit la brique
- Perte de vie : balle atteint le bas de l'écran
- Fin de partie : 0 vies (game over) ou 0 briques (victoire)
- Vitesse de balle ajustable : plage très lente à très rapide

## Success Criteria
- Joueur peut contrôler la raquette facilement
- Balle rebondit correctement
- Système de vies fonctionne
- Conditions de victoire et game over déclenchées correctement
- Slider de vitesse fonctionne et affecte la balle

## Open Questions
- Vitesse par défaut de la balle ?
- Taille des briques, de la raquette, position initiale ?
- Design visuel (couleurs, style) ?
- Sons/feedback auditif ?
