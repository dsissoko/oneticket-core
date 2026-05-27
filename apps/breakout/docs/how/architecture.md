# Architecture — Breakout

## 1. Architecture Principles

- **Vanilla JavaScript** — Pas de dépendances externes. Utilisation exclusive des APIs du navigateur standard (Canvas, DOM, événements clavier/souris).
- **Modular Pattern** — Organisation en modules isolés avec responsabilités clairement délimitées. Chaque module gère un aspect spécifique du jeu (moteur de jeu, entrées, collision, rendu).
- **Canvas-Based Rendering** — Utilisation exclusive de l'API Canvas pour le rendu graphique. Boucle de jeu centralisée, frame-based.
- **Separation of Concerns** — Séparation stricte entre la logique métier (physics, collision), la gestion d'état (game state), et la présentation (rendering).
- **Deterministic Physics** — Physique de balle prévisible, basée sur des vecteurs de vélocité. Rebonds calculés de manière cohérente sur tous les éléments.
- **Single Entry Point** — Initialisation unifiée via un contrôleur principal (GameController ou Game Manager) qui orchestre tous les modules.

## 2. System Overview

Le jeu Breakout est une application frontend pure exécutée dans le navigateur. L'application gère :

1. **Menu Principal** — Affichage initial avec slider de vitesse et boutons Démarrer/Quitter.
2. **Game Loop** — Boucle de jeu continuous (update/render) exécutée à chaque frame.
3. **Entity Management** — Gestion des entités de jeu (balle, raquette, briques, murs).
4. **Input Handling** — Traitement des entrées clavier (flèches pour la raquette) et souris (menus).
5. **Collision Detection** — Détection et résolution des collisions (balle-murs, balle-raquette, balle-briques).
6. **State Management** — Gestion des états de jeu (Menu, En Jeu, Game Over, Victoire).
7. **UI Rendering** — Rendu du terrain, entités, score, vies via Canvas et DOM.

## 3. Architectural Style

**Module Pattern avec Immédiat Function Invocation (IIFE)** — Chaque composant métier est encapsulé dans un module IIFE afin de créer un scope isolé et d'éviter les collisions de noms globaux. Les modules exposent des interfaces publiques via `return` d'objets contenant les méthodes accessibles.

Exemple de structure :

```javascript
const GameModule = (() => {
  // Variables privées
  let gameState = { ... };

  // Méthodes privées
  function updateInternal() { ... }

  // Interface publique
  return {
    initialize() { ... },
    update() { ... },
    render() { ... },
    reset() { ... }
  };
})();
```

**Single Canvas Context** — Un seul élément `<canvas>` pour tout le rendu. Le contexte 2D est centralisé et passé aux composants qui en ont besoin.

**Frame-Based Update Loop** — Boucle principale utilisant `requestAnimationFrame()` pour synchroniser les mises à jour avec le taux de rafraîchissement du navigateur.

## 4. Main Technical Boundaries

### Boundary 1 : Game Engine
- **Responsabilité** — Orchestration de la boucle de jeu (update → collision detection → render).
- **Entrée** — État du jeu, delta time, événements.
- **Sortie** — État mis à jour, signal de fin de jeu (victoire/game over).

### Boundary 2 : Input Handler
- **Responsabilité** — Capture des événements clavier (flèches) et souris (clics menu).
- **Entrée** — Événements DOM.
- **Sortie** — Commandes de contrôle pour la raquette, événements de menu.

### Boundary 3 : Collision Detection
- **Responsabilité** — Détection AABB (Axis-Aligned Bounding Box) et résolution des collisions.
- **Entrée** — Positions et dimensions des entités (balle, raquette, briques, murs).
- **Sortie** — Signaux de collision (balle-mur, balle-raquette, balle-brique, balle-sortie).

### Boundary 4 : Entity Manager
- **Responsabilité** — Gestion du cycle de vie des entités (création, mise à jour, suppression).
- **Entrée** — Commandes de création/suppression d'entités.
- **Sortie** — Collection d'entités valides, état de chaque entité.

### Boundary 5 : Canvas Renderer
- **Responsabilité** — Rendu de tous les éléments visuels via Canvas 2D.
- **Entrée** — État des entités, paramètres de rendu (couleurs, dimensions).
- **Sortie** — Frame rendu sur le canvas.

### Boundary 6 : Menu System
- **Responsabilité** — Gestion des menus (principal, game over, victoire) et interaction souris.
- **Entrée** — Clics souris, ajustements du slider.
- **Sortie** — Commandes de transition d'état (démarrer, rejouer, quitter).

### Boundary 7 : Game State Manager
- **Responsabilité** — Gestion centralisée de l'état de jeu (enum : Menu, Playing, GameOver, Victory).
- **Entrée** — Signaux de transition d'état.
- **Sortie** — État actuel, permettant à d'autres modules de s'adapter.

## 5. Key Components

### 5.1 Game (Game Engine)
- **Responsabilité** — Orchestration principal du jeu.
- **Méthodes publiques** :
  - `initialize()` — Initialise le canvas, les modules, et la boucle de jeu.
  - `startGame()` — Démarre une partie (réinitialise entités et état).
  - `reset()` — Réinitialise complètement le jeu au menu principal.
  - `setGameSpeed(speedFactor)` — Applique le facteur de vitesse de la balle.
- **Cycle de vie** — À chaque frame : update() → checkCollisions() → render().

### 5.2 Ball
- **Propriétés** — Position (x, y), vélocité (vX, vY), rayon.
- **Méthodes publiques** :
  - `update()` — Met à jour la position en fonction de la vélocité.
  - `setVelocity(vX, vY)` — Définit la direction et la vitesse.
  - `bounce(axis)` — Inverse la vélocité sur l'axe spécifié ('x' ou 'y').
  - `isOutOfBounds()` — Retourne vrai si la balle a quitté le bas de l'écran.
  - `render(ctx)` — Dessine la balle sur le canvas.

### 5.3 Paddle
- **Propriétés** — Position (x, y), largeur, hauteur, vitesse de déplacement.
- **Méthodes publiques** :
  - `moveLeft()` — Déplace la raquette vers la gauche (limites respectées).
  - `moveRight()` — Déplace la raquette vers la droite (limites respectées).
  - `reset()` — Réinitialise la position au centre.
  - `getBounds()` — Retourne les limites AABB de la raquette.
  - `render(ctx)` — Dessine la raquette sur le canvas.

### 5.4 Brick
- **Propriétés** — Position (x, y), largeur, hauteur, état actif.
- **Méthodes publiques** :
  - `destroy()` — Marque la brique comme détruite.
  - `isDestroyed()` — Retourne l'état de destruction.
  - `getBounds()` — Retourne les limites AABB.
  - `render(ctx)` — Dessine la brique (si non détruite).

### 5.5 Wall
- **Responsabilité** — Conteneur des limites de jeu (murs gauche/droit, plafond, bas).
- **Propriétés** — Largeur de l'écran, hauteur de l'écran, épaisseur des murs (optionnel).
- **Méthodes publiques** :
  - `getBounds(side)` — Retourne les limites pour le mur spécifié ('left', 'right', 'top', 'bottom').

### 5.6 CollisionDetector
- **Responsabilité** — Détection et gestion des collisions.
- **Méthodes publiques** :
  - `checkBallBrickCollision(ball, bricks)` — Détecte collision balle-briques, retourne briques touchées.
  - `checkBallPaddleCollision(ball, paddle)` — Détecte collision balle-raquette.
  - `checkBallWallCollision(ball, wall)` — Détecte collision balle-murs/plafond.
  - `checkBallOutOfBounds(ball)` — Détecte si la balle a quitté le bas.
  - `resolveBallCollision(ball, axis)` — Résout la collision en inversant la vélocité.

### 5.7 InputManager
- **Responsabilité** — Capture et gestion des événements clavier/souris.
- **Méthodes publiques** :
  - `initialize(gameInstance)` — Enregistre les listeners d'événements.
  - `isLeftPressed()` — Retourne si la flèche gauche est enfoncée.
  - `isRightPressed()` — Retourne si la flèche droite est enfoncée.
  - `onMenuButtonClick(button)` — Callback pour les clics sur les boutons de menu.

### 5.8 CanvasRenderer
- **Responsabilité** — Rendu de tous les éléments visuels.
- **Méthodes publiques** :
  - `initialize(canvas)` — Initialise le contexte 2D.
  - `clear()` — Efface le canvas.
  - `drawBall(ball)` — Dessine la balle.
  - `drawPaddle(paddle)` — Dessine la raquette.
  - `drawBricks(bricks)` — Dessine les briques.
  - `drawWalls()` — Dessine les contours du terrain.
  - `drawUI(score, lives)` — Dessine le score et les vies.
  - `drawText(text, x, y, font, color)` — Dessine du texte.

### 5.9 MenuSystem
- **Responsabilité** — Gestion et rendu des menus.
- **États** — MainMenu, GameOverMenu, VictoryMenu.
- **Méthodes publiques** :
  - `showMainMenu()` — Affiche le menu principal avec slider.
  - `showGameOverMenu()` — Affiche le menu game over.
  - `showVictoryMenu()` — Affiche le menu victoire.
  - `hideMenu()` — Cache le menu.
  - `getSpeedFactor()` — Retourne la valeur du slider de vitesse.
  - `reset()` — Réinitialise les menus.

### 5.10 GameStateManager
- **Responsabilité** — Gestion de l'état global du jeu.
- **États** — MENU, PLAYING, GAME_OVER, VICTORY.
- **Méthodes publiques** :
  - `setState(newState)` — Change l'état de jeu.
  - `getState()` — Retourne l'état actuel.
  - `isPlaying()` — Retourne vrai si le jeu est en cours.

## 6. Key Interfaces

### 6.1 Game Loop Interface
```javascript
// Exécuté à chaque frame (requestAnimationFrame)
{
  update(deltaTime) {}, // Mise à jour de la physique
  checkCollisions() {}, // Détection et résolution des collisions
  render() {}           // Rendu graphique
}
```

### 6.2 Event Handling Interface
```javascript
{
  // Événements clavier
  onKeyDown(key) {},
  onKeyUp(key) {},
  
  // Événements souris (menus)
  onMouseClick(x, y) {}
}
```

### 6.3 State Transition Interface
```javascript
{
  // Transitions d'état
  startGame() {},   // Menu → Playing
  endGame() {},     // Playing → GameOver
  winGame() {},     // Playing → Victory
  resetGame() {}    // Any → Menu
}
```

### 6.4 Collision Response Interface
```javascript
{
  onBallBrickCollision(ball, brick) {}, // Détruit la brique, met à jour le score
  onBallPaddleCollision(ball, paddle) {}, // Inverse la vélocité Y
  onBallWallCollision(ball, wall) {}, // Inverse la vélocité (X ou Y)
  onBallOutOfBounds(ball) {}           // Décrémente les vies, réinitialise la balle
}
```

## 7. Data Architecture

### 7.1 Game State
```javascript
gameState = {
  state: 'MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY',
  score: number,           // Score courant
  lives: number,           // Vies restantes (0-3)
  speedFactor: number,     // Facteur de vitesse (1-10)
  entities: {
    ball: Ball,
    paddle: Paddle,
    bricks: [Brick],
    walls: Wall
  }
}
```

### 7.2 Entity Data Model

**Ball**
```javascript
{
  x: number,           // Position X
  y: number,           // Position Y
  radius: number,      // Rayon du cercle
  vX: number,          // Vélocité X
  vY: number,          // Vélocité Y
  speed: number        // Vitesse scalaire
}
```

**Paddle**
```javascript
{
  x: number,           // Position X
  y: number,           // Position Y
  width: number,       // Largeur
  height: number,      // Hauteur
  speed: number,       // Vitesse de déplacement
  minX: number,        // Limite gauche
  maxX: number         // Limite droite
}
```

**Brick**
```javascript
{
  x: number,
  y: number,
  width: number,
  height: number,
  isDestroyed: boolean,
  row: number,         // Rang de la grille
  column: number       // Colonne de la grille
}
```

### 7.3 Collision Data
```javascript
collisionData = {
  type: 'ball-wall' | 'ball-paddle' | 'ball-brick' | 'ball-out',
  entities: [entity1, entity2],
  axis: 'x' | 'y',           // Axe de collision
  side: 'left' | 'right' | 'top' | 'bottom' // Côté du mur
}
```

## 8. Security Architecture

### 8.1 Data Integrity
- Aucune persistance réseau. Toutes les données de jeu restent en mémoire locale (RAM du navigateur).
- Pas d'authentification requise. Le jeu est local, pas de gestion d'utilisateur.
- Pas d'accès aux APIs externes. Entièrement autonome.

### 8.2 Input Validation
- Entrées clavier : Validation simple (flèches gauche/droit uniquement en jeu).
- Entrées souris : Validation des zones de clic (boutons, slider).
- Slider de vitesse : Gamme fixe 1-10, valeurs non acceptées ignorées.

### 8.3 State Integrity
- Transitions d'état strictement définie via `GameStateManager`.
- Aucune modification directe de l'état. Transitions via méthodes publiques uniquement.
- Réinitialisation complète après chaque partie (score, vies, entités).

## 9. Deployment Strategy

### 9.1 Artifact
- Fichier HTML unique avec balises `<style>` et `<script>` intégrées, ou structure simple :
  - `index.html` — Structure DOM (canvas, menu) + inclusions CSS/JS
  - `main.css` — Styles (fond, boutons, layout)
  - `game.js` — Code du jeu (modules, game loop)

### 9.2 Browser Requirements
- HTML5 Canvas API
- ES6 JavaScript (classes, arrow functions, template literals — ou compatible ES5 si nécessaire)
- Event APIs (KeyboardEvent, MouseEvent)
- `requestAnimationFrame()`

### 9.3 Hosting
- Fichier statique servi par un serveur HTTP standard (pas de backend).
- Pas de dépendances serveur, pas de base de données.

## 10. Observability Strategy

### 10.1 Console Logging
- Logs de debug activables via flag global : `window.DEBUG_GAME = true`.
- Logs pertinents :
  - Transitions d'état : `console.log('State: MENU → PLAYING')`
  - Collisions détectées : `console.log('Collision: ball-brick')`
  - Score/Vies : `console.log('Score: 10, Lives: 2')`
  - Fin de jeu : `console.log('Game Over - Lives: 0')`, `console.log('Victory - Score: 50')`

### 10.2 Performance Monitoring (Optionnel)
- FPS estimé : Compteur de frames par seconde (utiliser `performance.now()`).
- Time spent in update/render : Mesurer les durées de chaque phase de la boucle.

### 10.3 Error Handling
- Erreurs dans la boucle de jeu : Try-catch en haut niveau, log et pause du jeu.
- Erreurs d'initialisation Canvas : Message d'erreur au joueur, rechargement recommandé.

## 11. Related C4 Views

Les diagrammes C4 pour cette architecture seront documentés dans `how/c4/` :

- **System Context** — Joueur, Navigateur, Jeu Breakout.
- **Container** — Canvas Renderer, DOM Menu, Game Engine, Input Handler.
- **Component** — Ball, Paddle, Brick, CollisionDetector, GameStateManager, etc.
- **Deployment** — Browser Runtime, Static File Server.

À générer séparément avec la skill `oneticket-c4`.

## 12. Related Implementation Slices

Les slices d'implémentation pour décomposer le développement seront documentés dans `how/slices/` :

1. **Slice 0** — Setup Canvas et Game Loop de base
2. **Slice 1** — Entités de base (Ball, Paddle, Brick)
3. **Slice 2** — Physique et Collision Detection
4. **Slice 3** — Menu System et State Management
5. **Slice 4** — Input Handling
6. **Slice 5** — Rendu et UI
7. **Slice 6** — Intégration complète et test manuel

À générer séparément avec la skill `oneticket-vertical-slice`.

## 13. Technical Constraints

- **Langage** — Vanilla JavaScript (ES6+), pas de frameworks (React, Vue, etc.) ni de dépendances npm.
- **Rendu** — Canvas 2D uniquement. Pas de WebGL, pas de DOM rendering pour le jeu.
- **Mémoire** — Pas de persistance locale. Réinitialisation complète à chaque nouvelle partie.
- **Performance** — Cible 60 FPS. Boucle de jeu optimisée, pas de garbage collection excessif.
- **Taille de brique** — À confirmer (exemple : 60px × 15px avec espacement 5px).
- **Vitesse de raquette** — À confirmer (fixe ou liée à la balle).
- **Résolution** — À confirmer (exemple : 800×600 ou 1024×768).

## 14. Open Questions

- Taille exacte de chaque brique (pixels) et espacement entre briques ?
- Vitesse de déplacement de la raquette : fixe ou basée sur la vélocité de la balle ?
- Animation de destruction de brique (disparition immédiate ou fade out) ?
- Sons ou feedback visuel supplémentaire au contact brique/balle ?
- Résolution cible du jeu (pixels) ?
- Nombre exact de briques par ligne ?
