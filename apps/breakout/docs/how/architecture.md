# Architecture — Jeu Breakout

## 1. Architecture Principles

1. **Vanilla First** — Pas de dépendances externes (ni frameworks ni librairies). Code JavaScript ES6+ pur.
2. **Separation of Concerns** — Modules distincts pour : Game Engine, Physics, Input, State Management, Rendering.
3. **Simplicity Over Cleverness** — Code lisible et maintenable plutôt que des optimisations prématurées.
4. **Canvas-based Rendering** — Utilisation du Canvas 2D pour le rendu du jeu, DOM pour les menus.
5. **Single Game Loop** — Une boucle de jeu unique gérée par le GameEngine, cadencée à 60 FPS.
6. **Immutable Game State** — L'état du jeu est stable pendant une frame, mis à jour en bloc à chaque itération.

## 2. System Overview

Le jeu Breakout est une **single-page application (SPA)** écrite en vanilla JavaScript. Le système comprend :

- **Frontend Layer** : DOM (menus, UI) + Canvas 2D (rendu du jeu)
- **Game Logic Layer** : Moteur de jeu, physique, détection de collisions, gestion d'état
- **Input Layer** : Clavier (raquette), souris (menus)
- **Rendering Layer** : Canvas pour le gameplay, DOM pour les menus

```
┌─────────────────────────────────────┐
│      Menu & UI (DOM)                │
│   Main Menu, Speed Control,         │
│   Win/Loss Screens                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Game Engine (Game Loop)          │
│   - Update state                    │
│   - Physics simulation              │
│   - Collision detection             │
│   - Rendering                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Canvas 2D Rendering              │
│   Ball, Paddle, Bricks, Walls       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    Input Handlers                   │
│   Keyboard (Paddle), Mouse (Menus)  │
└─────────────────────────────────────┘
```

## 3. Architectural Style

**Modular Event-Driven Architecture** :

- **Modules** : Chaque composant (Ball, Paddle, Brick, etc.) est encapsulé dans sa propre classe ou objet.
- **Game Loop Pattern** : Mise à jour → Détection des collisions → Rendu.
- **State Machine** : Transitions d'état claires entre Menu → Speed Control → Gameplay → Win/Loss.
- **Observer Pattern** : Les changements d'état (nouvelles briques, vies perdues) peuvent être observés par l'UI.

## 4. Main Technical Boundaries

### 4.1 Frontend Container

**Stack** : HTML5, CSS3, vanilla JavaScript ES6+

**Sub-components** :
- **DOM Layer** : Menus, boutons, sliders, affichage des statistiques
- **Canvas Layer** : Rendu du gameplay (balle, raquette, briques, murs)
- **Game Engine** : Logique du jeu, boucle de jeu, mise à jour d'état
- **Input Handlers** : Clavier (raquette), souris (menus, slider)
- **Physics Engine** : Déplacement, rebonds, détection de collisions
- **State Manager** : Gestion des états (menu, gameplay, win, loss)

### 4.2 Data Boundaries

- **Game State** : Conteneur central des données du jeu (lives, bricks, ball, paddle, gameStatus)
- **Persistence** : Aucune persistance en V1 (en-mémoire uniquement)
- **Local Storage** : Non utilisé en V1

### 4.3 Time Boundaries

- **Frame Rate** : 60 FPS (16.67 ms par frame)
- **Time Step** : Pas de simulation fixe (variable timestep basé sur requestAnimationFrame)
- **Update Cycle** : Physics → Collisions → Render

## 5. Key Components

### 5.1 GameEngine

**Responsabilité** : Orchestrer la boucle de jeu, coordonner les mises à jour.

**Exports** :
```javascript
class GameEngine {
  constructor(canvas, gameState)
  start()          // Démarre la boucle de jeu
  pause()          // Met en pause la simulation
  resume()         // Reprend la simulation
  update(deltaTime) // Met à jour l'état du jeu
  render()         // Rendu du jeu
  reset()          // Réinitialise le jeu
}
```

### 5.2 Ball

**Responsabilité** : Représenter et gérer la balle.

**Exports** :
```javascript
class Ball {
  constructor(x, y, radius, velocityX, velocityY)
  update(deltaTime)      // Mise à jour position
  isOutOfBounds(height)  // Vérifie si la balle est sortie en bas
  reset(x, y)            // Réinitialisation de position
  getBounds()            // Rectangle englobant pour collisions
}
```

### 5.3 Paddle

**Responsabilité** : Représenter et gérer la raquette.

**Exports** :
```javascript
class Paddle {
  constructor(x, y, width, height, speed)
  moveLeft()             // Déplacement à gauche
  moveRight()            // Déplacement à droite
  stopMovement()         // Arrêt du mouvement
  update(deltaTime)      // Mise à jour position
  clamp(minX, maxX)      // Limite les bornes
  getBounds()            // Rectangle englobant
}
```

### 5.4 Brick

**Responsabilité** : Représenter une brique.

**Exports** :
```javascript
class Brick {
  constructor(x, y, width, height, color)
  getBounds()     // Rectangle englobant
  isDestroyed()   // État détruit
  destroy()       // Marquer comme détruite
}
```

### 5.5 Physics

**Responsabilité** : Déplacement et collisions.

**Exports** :
```javascript
class Physics {
  static reflectBall(ball, surface) // Rebond (walls, paddle, bricks)
  static paddleAngle(ballX, paddleX, paddleWidth) // Angle au-dessus de la raquette
  static checkCollision(rect1, rect2) // AABB collision detection
  static updateBallPosition(ball, deltaTime) // Mise à jour position
}
```

### 5.6 InputHandler

**Responsabilité** : Gérer clavier et souris.

**Exports** :
```javascript
class InputHandler {
  constructor(gameState)
  onKeyDown(event)   // Événement clavier
  onKeyUp(event)     // Fin clavier
  onMouseClick(event) // Clic souris (menus, slider)
  getPaddleDirection() // Direction actuelle de la raquette
}
```

### 5.7 GameState

**Responsabilité** : Conteneur centralisé de l'état du jeu.

**Exports** :
```javascript
class GameState {
  // Gameplay state
  ball: Ball
  paddle: Paddle
  bricks: Brick[]
  lives: number
  
  // Game control
  status: string  // 'menu', 'speedControl', 'playing', 'won', 'lost'
  ballSpeed: number // Multiplicateur de vitesse (0.5 à 2.0)
  
  // Methods
  reset()
  resetBall()
  loseLife()
  destroyBrick(brickIndex)
  isGameWon()
  isGameLost()
}
```

### 5.8 UI Manager

**Responsabilité** : Gérer l'affichage des menus et de l'UI.

**Exports** :
```javascript
class UIManager {
  constructor(gameState)
  showMainMenu()
  showSpeedControl()
  hideMenu()
  showWinScreen()
  showLoseScreen()
  updateLivesDisplay(lives)
  updateSpeedSlider(value)
}
```

## 6. Key Interfaces

### 6.1 Canvas Rendering Interface

```javascript
// Contrat de rendu Canvas
function renderGameplay(ctx, gameState) {
  // ctx = CanvasRenderingContext2D
  // Dessine : walls, bricks, ball, paddle
}
```

### 6.2 Collision Detection Interface

```javascript
function checkBallCollisions(ball, paddle, bricks, walls) {
  // Retourne { type: 'wall'|'paddle'|'brick'|'lost', data: {...} }
}
```

### 6.3 State Update Interface

```javascript
function updateGameState(gameState, deltaTime, collisions) {
  // Met à jour : positions, lives, bricks détruites, statut du jeu
  // Retourne le nouvel état
}
```

## 7. Data Architecture

### 7.1 Game State Structure

```javascript
{
  ball: {
    x: number,
    y: number,
    radius: number,
    velocityX: number,
    velocityY: number,
    speed: number // Multiplicateur d'échelle
  },
  paddle: {
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
    direction: 0 | 1 | -1 // stationnaire, droite, gauche
  },
  bricks: [
    { x, y, width, height, destroyed: boolean, color: string }
  ],
  lives: number,
  status: 'menu' | 'speedControl' | 'playing' | 'won' | 'lost',
  ballSpeed: number, // 0.5 à 2.0
  frameCount: number,
  lastFrameTime: number
}
```

### 7.2 Collision Result Structure

```javascript
{
  collided: boolean,
  type: 'wall' | 'paddle' | 'brick' | 'lost' | null,
  brickIndex: number | null, // Si type === 'brick'
  wall: 'left' | 'right' | 'top' | null // Si type === 'wall'
}
```

## 8. Security Architecture

**No External Data** : Le jeu n'accède pas à des ressources externes (pas d'API, pas de réseau).

**Input Validation** : 
- Clavier : validation des touches (flèches uniquement)
- Souris : validation des zones de clic (boutons, slider)
- Slider : validation des valeurs (0.5 à 2.0)

**No User Data** : Aucune collecte, stockage ou transmission de données utilisateur en V1.

## 9. Deployment Strategy

**Single HTML File** : Tout le code (HTML, CSS, JS) peut être déployé dans un seul fichier `index.html` ou séparé par souci de maintenabilité.

**Assets** :
- Pas d'images externes (rendu 100% Canvas et DOM)
- Pas de fonts externes (defaults du système)
- Pas de dépendances NPM

**Browser Support** : ES6+ moderne (Chrome, Firefox, Safari, Edge récents).

## 10. Observability Strategy

**Console Logging** :
- `console.log()` pour le debug des collisions
- `console.error()` pour les cas inattendus

**Performance Monitoring** :
- FPS tracking via `requestAnimationFrame` (optionnel)
- Time per frame measurement (optionnel)

**No Analytics** : Aucune télémétrie en V1.

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

## 13. Technical Constraints

1. **No External Dependencies** — Vanilla JS only, no NPM packages.
2. **No Responsive Design** — Focus desktop, no mobile optimization in V1.
3. **Single Canvas** — Un seul canvas pour tout le rendu du gameplay.
4. **60 FPS Target** — Cadence fixe via `requestAnimationFrame`.
5. **In-Memory State** — Aucune persistance, tout est perdu à la fermeture.
6. **No Multiplayer** — Jeu solo uniquement en V1.

## 14. Open Questions

1. **Collision Optimization** — AABB suffisant ou faut-il circle-based pour la balle ?
2. **Ball Speed Variation** — La vitesse doit-elle augmenter au fil du temps ou rester constante ?
3. **Visual Feedback** — Animations de destruction de briques ou instantané ?
4. **Paddle Acceleration** — La raquette doit-elle avoir une accélération/décelération ou être instantanée ?
5. **Brick Grid Layout** — Configuration exacte des briques (nombre par ligne, espacement) ?
6. **Sound Design** — Effets sonores pour rebonds, destructions, victoire/défaite en V2 ?
