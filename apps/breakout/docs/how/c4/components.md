# Components — Game Engine Container

## Overview

Diagramme des composants C4 du **Game Engine Container** — décomposition interne en classes et modules.

```mermaid
C4Component
  title Component Diagram — Game Engine (Gameplay Phase)

  Container_Boundary(gameEngine, "Game Engine") {
    Component(engine, "GameEngine", "JavaScript Class", "Orchestration boucle de jeu. Cadence via requestAnimationFrame. Coordonne update → physics → collision → render.")
    
    Component(loop, "GameLoop", "JavaScript Singleton", "Boucle principale 60 FPS. Calcul deltaTime. Dispatch aux phases.")
    
    Component(stateManager, "GameStateManager", "JavaScript Class", "État centralisé : ball, paddle, bricks[], lives, status, ballSpeed.")
  }

  Container_Boundary(physics, "Physics Module") {
    Component(ballPhysics, "BallPhysics", "JavaScript Class", "Mise à jour position/vélocité balle. Gestion speed multiplier.")
    
    Component(paddlePhysics, "PaddlePhysics", "JavaScript Class", "Mise à jour position raquette. Clamping aux murs. Direction from input.")
    
    Component(collisionDetector, "CollisionDetector", "JavaScript Utility", "AABB collision detection. Retourne collision data.")
    
    Component(bounceResolver, "BounceResolver", "JavaScript Utility", "Calcul rebonds : walls, paddle (angle), bricks. Inversion vélocité.")
  }

  Container_Boundary(gameObjects, "Game Objects") {
    Component(ball, "Ball", "JavaScript Class", "Données balle : x, y, radius, velocityX, velocityY. Propriétés physiques.")
    
    Component(paddle, "Paddle", "JavaScript Class", "Données raquette : x, y, width, height, direction, speed.")
    
    Component(brick, "Brick", "JavaScript Class", "Données brique : x, y, width, height, color, destroyed.")
    
    Component(wall, "Wall", "JavaScript Utility", "Constantes murs : left, right, top boundaries.")
  }

  Container_Boundary(rendering, "Rendering Module") {
    Component(renderer, "CanvasRenderer", "JavaScript Class", "Rendu Canvas : drawBall, drawPaddle, drawBricks, drawWalls.")
    
    Component(ctx, "CanvasContext", "HTML5 Canvas 2D", "Context 2D pour dessin.")
  }

  Container_Boundary(inputAndUI, "Input & UI") {
    Component(inputHandler, "InputHandler", "JavaScript Class", "Écoute keyboard/mouse. Convertit en paddle direction, speed changes.")
    
    Component(uiManager, "UIManager", "JavaScript Class", "Affichage menus, transitions état. Clics souris.")
  }

  Rel(engine, loop, "Démarre/arrête boucle")
  Rel(loop, stateManager, "1. Lit état")
  Rel(loop, ballPhysics, "2a. update()")
  Rel(loop, paddlePhysics, "2b. update()")
  Rel(loop, collisionDetector, "3. check collisions()")
  Rel(collisionDetector, bounceResolver, "Collision → resolve bounce")
  Rel(loop, renderer, "4. render()")
  
  Rel(ballPhysics, ball, "Lit/écrit position, vélocité")
  Rel(paddlePhysics, paddle, "Lit/écrit position, direction")
  Rel(collisionDetector, ball, "Lit bounds (AABB)")
  Rel(collisionDetector, paddle, "Lit bounds (AABB)")
  Rel(collisionDetector, brick, "Lit bounds (AABB)")
  Rel(bounceResolver, ball, "Inverse vélocité")
  Rel(bounceResolver, paddle, "Calcul angle")
  
  Rel(renderer, ball, "Dessine")
  Rel(renderer, paddle, "Dessine")
  Rel(renderer, brick, "Dessine")
  Rel(renderer, wall, "Dessine bounds")
  Rel(renderer, ctx, "Utilise CanvasContext")
  
  Rel(inputHandler, paddle, "Met à jour direction")
  Rel(inputHandler, stateManager, "Met à jour ballSpeed")
  Rel(uiManager, stateManager, "Lit lives, status")
  
  Rel(stateManager, ballPhysics, "Fournit state")
  Rel(stateManager, paddlePhysics, "Fournit state")
```

## Composants détaillés

### Game Engine Core

#### GameEngine
**Responsabilité** : Orchestration principale de la boucle de jeu

**Interface** :
```javascript
class GameEngine {
  constructor(canvas, gameState)
  
  start()           // Lance requestAnimationFrame
  pause()           // Met en pause (stop gameLoop)
  resume()          // Reprend (restart gameLoop)
  
  update(deltaTime) // Phase de mise à jour
  render()          // Phase de rendu
  
  reset()           // Réinitialise tout
  onCollision(collision) // Traite collisions
}
```

**Dépendances** : GameLoop, GameStateManager, Physics, Renderer

#### GameLoop
**Responsabilité** : Boucle de jeu cadencée

**Interface** :
```javascript
const GameLoop = {
  start(callback)   // Démarre requestAnimationFrame
  stop()            // Arrête
  getPreviousTime() // Dernier timestamp
  getDeltaTime()    // Temps écoulé depuis frame précédente
}
```

#### GameStateManager
**Responsabilité** : Source unique de vérité pour l'état du jeu

**Interface** :
```javascript
class GameState {
  // Entities
  ball: Ball
  paddle: Paddle
  bricks: Brick[]
  
  // Game control
  lives: number
  status: 'menu' | 'speedControl' | 'playing' | 'won' | 'lost'
  ballSpeed: number // 0.5 à 2.0 multiplicateur
  
  // Methods
  reset()
  resetBall(x, y)
  loseLife()        // lives--
  destroyBrick(index)
  isGameWon()       // bricks.length === 0
  isGameLost()      // lives === 0
}
```

### Physics Module

#### BallPhysics
**Responsabilité** : Simulation mouvement balle

**Interface** :
```javascript
class BallPhysics {
  static updatePosition(ball, deltaTime) {
    // ball.x += ball.velocityX * deltaTime * ball.speed
    // ball.y += ball.velocityY * deltaTime * ball.speed
  }
  
  static isOutOfBounds(ball, playfield) {
    // Retourne true si ball.y > playfield.bottom
  }
}
```

#### PaddlePhysics
**Responsabilité** : Simulation mouvement raquette

**Interface** :
```javascript
class PaddlePhysics {
  static updatePosition(paddle, deltaTime, playfield) {
    // Applique direction (1, 0, -1)
    // Clamp à playfield.left et playfield.right
  }
}
```

#### CollisionDetector
**Responsabilité** : Détection des collisions AABB

**Interface** :
```javascript
class CollisionDetector {
  static checkBallCollisions(ball, paddle, bricks, walls) {
    // Retourne { type, target, data }
  }
  
  static isRectColliding(rect1, rect2) {
    // AABB collision test
  }
  
  static getBallBounds(ball) {
    // Retourne { x, y, width, height } pour AABB
  }
}
```

#### BounceResolver
**Responsabilité** : Calcul des rebonds et direction post-collision

**Interface** :
```javascript
class BounceResolver {
  static reflectOnWall(ball, wall) {
    // Inverse velocityX ou velocityY selon le mur
  }
  
  static reflectOnPaddle(ball, paddle) {
    // Calcul angle selon position contact sur raquette
    // Rebond vers le haut + angle (gauche/centre/droite)
  }
  
  static reflectOnBrick(ball) {
    // Inversion simple (vertical ou horizontal selon arête)
  }
}
```

### Game Objects

#### Ball
**Responsabilité** : Représentation de la balle

**Interface** :
```javascript
class Ball {
  constructor(x, y, radius, velocityX, velocityY, speed = 1.0)
  
  x: number
  y: number
  radius: number
  velocityX: number
  velocityY: number
  speed: number // Multiplicateur
  
  getBounds() // AABB pour collisions
  reset(x, y)
}
```

#### Paddle
**Responsabilité** : Représentation de la raquette

**Interface** :
```javascript
class Paddle {
  constructor(x, y, width, height, speed = 300)
  
  x: number
  y: number
  width: number
  height: number
  speed: number      // px/s
  direction: -1|0|1  // -1: left, 0: stop, 1: right
  
  getBounds() // AABB pour collisions
  clamp(minX, maxX)
  moveLeft()
  moveRight()
  stop()
}
```

#### Brick
**Responsabilité** : Représentation d'une brique

**Interface** :
```javascript
class Brick {
  constructor(x, y, width, height, color = '#FF0000')
  
  x: number
  y: number
  width: number
  height: number
  color: string
  destroyed: boolean
  
  getBounds() // AABB pour collisions
  destroy()
  isDestroyed()
}
```

#### Wall
**Responsabilité** : Définition des limites du playfield

**Interface** :
```javascript
const Wall = {
  LEFT: 0,
  RIGHT: 800,      // Largeur canvas
  TOP: 0,
  BOTTOM: 600,     // Hauteur canvas
  PADDLE_BOTTOM: 550
}
```

### Rendering Module

#### CanvasRenderer
**Responsabilité** : Rendu graphique 2D

**Interface** :
```javascript
class CanvasRenderer {
  constructor(canvas)
  
  render(gameState) {
    // Effacement canvas
    // Dessin walls, bricks, paddle, ball
  }
  
  drawBall(ball)
  drawPaddle(paddle)
  drawBricks(bricks)
  drawWalls()
  drawLives(lives) // Optionnel, peut être dans UI
  
  clear()
}
```

### Input & UI

#### InputHandler
**Responsabilité** : Capture et conversion des entrées

**Interface** :
```javascript
class InputHandler {
  constructor(gameState)
  
  onKeyDown(event)    // Capture flèches
  onKeyUp(event)      // Fin saisie
  onMouseClick(event) // Boutons, slider
  
  getPaddleDirection() // -1, 0, 1
}
```

#### UIManager
**Responsabilité** : Gestion de l'affichage des menus

**Interface** :
```javascript
class UIManager {
  constructor(gameState)
  
  showMainMenu()
  showSpeedControl()
  showWinScreen()
  showLoseScreen()
  hideAllMenus()
  
  updateLivesDisplay(lives)
  updateSpeedSlider(value)
}
```

## Flux de données à chaque frame

```
Frame start
  │
  ├─ DeltaTime = currentTime - lastTime
  │
  ├─ Input Handler
  │  └─ Read keyboard/mouse
  │     └─ Update GameState (paddle.direction, ballSpeed)
  │
  ├─ Ball Physics
  │  └─ ball.x += ball.velocityX * deltaTime * ball.speed
  │  └─ ball.y += ball.velocityY * deltaTime * ball.speed
  │
  ├─ Paddle Physics
  │  └─ paddle.x += paddle.direction * paddle.speed * deltaTime
  │  └─ paddle.x = clamp(paddle.x, 0, canvasWidth - paddleWidth)
  │
  ├─ Collision Detection
  │  ├─ Check Ball vs Walls
  │  ├─ Check Ball vs Paddle
  │  ├─ Check Ball vs Bricks
  │  └─ Check Ball vs BottomBoundary (lose life)
  │
  ├─ Bounce Resolution
  │  └─ For each collision:
  │     ├─ Reverse velocities
  │     ├─ Update GameState (lives, bricks destroyed)
  │     └─ If win/loss: transition state
  │
  ├─ Renderer
  │  ├─ Clear canvas
  │  ├─ Draw walls
  │  ├─ Draw bricks
  │  ├─ Draw paddle
  │  ├─ Draw ball
  │  └─ Flush to screen
  │
  └─ lastTime = currentTime
```

## Testing Strategy

Chaque composant peut être testé indépendamment :

| Composant | Test Type | Exemple |
|-----------|-----------|---------|
| BallPhysics | Unit | updatePosition → position change |
| PaddlePhysics | Unit | moveLeft → x decreases |
| CollisionDetector | Unit | isRectColliding → true/false |
| BounceResolver | Unit | reflectOnWall → velocity inverted |
| GameStateManager | Unit | loseLife → lives-- |
| CanvasRenderer | Integration | render → canvas modified |
| GameEngine | Integration | Full game loop → gameplay |
