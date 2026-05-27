Crée le fichier architecture.md pour le projet Breakout. Utilise le template dans .oneticket/templates/architecture.md et remplis-le basé sur la product-spec.md créée (tâche A) avec les informations suivantes :

## Architecture Principles
- Simplicity: vanilla JavaScript, zéro dépendance externe
- Single responsibility: chaque module a une seule responsabilité (game logic, rendering, input, physics)
- No framework: pur HTML/CSS/JS

## System Overview
Application frontend monolithique en vanilla JS. Pas de backend, pas de base de données. Exécution entièrement côté client.

## Architectural Style
Structure modulaire vanilla JS avec séparation claire entre :
- Game engine (logique de jeu, physics, collisions)
- Rendering (affichage du jeu)
- Input handling (gestion clavier/souris)
- UI state (menus, game state)

## Main Technical Boundaries
- Game loop : moteur principal à 60 FPS
- Collision detection : balle <-> walls, paddle, bricks
- Physics : vitesse et trajectoire de la balle
- Rendering : canvas ou DOM manipulation
- Input : event listeners clavier pour raquette, souris pour menus

## Key Components
1. Game Engine : boucle de jeu, mise à jour état, détection collisions
2. Paddle : classe/objet pour la raquette
3. Ball : classe/objet pour la balle
4. Brick : classe/objet pour les briques
5. Game State : gestion du score, vies, état (menu/playing/gameover/victory)
6. Renderer : dessine le jeu sur canvas ou DOM
7. Input Manager : capture clavier (flèches) et souris (menus)
8. Menu System : UI menus (start, replay, quit, difficulty slider)

## Key Interfaces
- Game.start() : démarrer une partie
- Game.pause()/Game.resume() : pause/reprendre
- Paddle.move(direction) : déplacer la raquette
- Game.update(deltaTime) : mise à jour état du jeu
- Game.render() : affichage du jeu
- Menu.show() / Menu.hide() : afficher/masquer menus
- Settings.setBallSpeed(speed) : définir vitesse balle

## Data Architecture
- Game State : objet contenant lives, score, game status, bricks array, ball position/velocity, paddle position
- Pas de persistance : état complètement en mémoire
- Pas de backend : zéro communication serveur

## Security Architecture
- N/A : application locale, pas d'authentification, pas de données sensibles

## Deployment Strategy
- Static deployment : fichiers HTML/CSS/JS sur serveur web ou CDN
- Pas de build complexe initialement
- Compatible navigateur moderne (ES6+)

## Observability Strategy
- Logs console pour debug
- Pas de métriques/analytics

## Related C4 Views
- À créer : system-context.md (joueur + navigateur)
- À créer : containers.md (Single Page Application)
- À créer : components.md (modules JS)

## Related Implementation Slices
- À créer : slice-1 (setup projet + HTML/CSS base)
- À créer : slice-2 (game engine + physics)
- À créer : slice-3 (rendering + raquette)
- À créer : slice-4 (briques + collisions)
- À créer : slice-5 (menu + difficulté)

## Technical Constraints
- Vanilla JS : zéro framework (pas React, pas Vue, pas Angular)
- Zéro dépendance externe
- HTML5 standard
- Doit fonctionner sur navigateurs modernes

## Open Questions
- Canvas ou DOM pour le rendering ?
- Framework de test (Jest, Vitest) ou simple console ?
- Tooling de build (si nécessaire) ?
