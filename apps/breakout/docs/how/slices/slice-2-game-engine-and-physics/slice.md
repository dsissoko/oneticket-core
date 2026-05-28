# Slice 2 — Game Engine and Physics Core

## Goal

Implémenter la boucle de jeu, la physique de la balle, la détection de collisions et le système de rebonds. Le résultat est une balle qui se déplace en physique réaliste et rebondit sur les murs, la raquette et les briques.

Livrable testable : Un jeu où la balle se déplace, rebondit sur tous les obstacles, les briques se détruisent au contact et la raquette peut être contrôlée au clavier.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Ball Physics and Playfield Elements](../../../what/epics/epic-0-mvp/user-stories/us-002-ball-paddle-bricks.md)
- [US-003 — Collision Detection and Ball Bouncing](../../../what/epics/epic-0-mvp/user-stories/us-003-collision-detection.md)
- [US-004 — Lives System and Game State Management](../../../what/epics/epic-0-mvp/user-stories/us-004-lives-and-game-state.md)
- [US-005 — Paddle Controls and Input Handling](../../../what/epics/epic-0-mvp/user-stories/us-005-paddle-controls.md)

## Impacted Components

### Game Engine Core
- **GameEngine** : Boucle de jeu via requestAnimationFrame
- **GameLoop** : Cadençage 60 FPS, deltaTime

### Physics Module
- **BallPhysics** : Mise à jour position balle
- **PaddlePhysics** : Mise à jour position raquette
- **CollisionDetector** : Détection AABB
- **BounceResolver** : Calcul des rebonds

### Game Objects
- **Ball** : Position, vélocité, rayon
- **Paddle** : Position, dimensions, direction
- **Brick** : Position, dimensions, état destroyed

### Game State Manager
- **GameState** : Gestion état balle, raquette, briques

### Input
- **InputHandler** : Clavier (flèches gauche/droite)

### Rendering
- **CanvasRenderer** : Rendu balle, raquette, briques, murs

## Interfaces

### GameEngine.start()
```javascript
class GameEngine {
  start() {
    // Lance requestAnimationFrame loop
    // Chaque frame: update() → render()
  }
}
```

### BallPhysics.updatePosition()
```javascript
class BallPhysics {
  static updatePosition(ball, deltaTime, speed) {
    ball.x += ball.velocityX * deltaTime * speed;
    ball.y += ball.velocityY * deltaTime * speed;
  }
}
```

### CollisionDetector.checkBallCollisions()
```javascript
class CollisionDetector {
  static checkBallCollisions(ball, paddle, bricks, walls) {
    // Retourne { collided: bool, type, brickIndex?, wall? }
  }
}
```

### BounceResolver.reflectOnPaddle()
```javascript
class BounceResolver {
  static reflectOnPaddle(ball, paddle) {
    // Calcul angle selon position contact
    // ball.velocityX = angle
    // ball.velocityY = -abs(velocityY)  // Vers le haut
  }
}
```

## Data Changes

### GameState Structure
```javascript
{
  ball: {
    x: 400,
    y: 300,
    radius: 5,
    velocityX: 200,  // px/s
    velocityY: 200,  // px/s
    speed: 1.0       // Multiplicateur
  },
  paddle: {
    x: 350,
    y: 550,
    width: 100,
    height: 20,
    speed: 300,      // px/s
    direction: 0     // -1, 0, 1
  },
  bricks: [
    { x: 0, y: 50, width: 80, height: 20, destroyed: false, color: '#FF0000' },
    // ... 24 autres briques
  ],
  lives: 3,
  status: 'playing'
}
```

### Collision Data
```javascript
{
  collided: true,
  type: 'paddle'|'brick'|'wall'|'lost',
  brickIndex: 5,  // Si type === 'brick'
  wall: 'left'|'right'|'top'|null
}
```

## Sequence Flow

### Per-Frame Loop
```
Frame N
  │
  ├─ Input Handler
  │  └─ Read paddle.direction from keyboard
  │
  ├─ Physics Update Phase
  │  ├─ Ball Position
  │  │  └─ ball.x += ball.velocityX * deltaTime * ball.speed
  │  │  └─ ball.y += ball.velocityY * deltaTime * ball.speed
  │  │
  │  └─ Paddle Position
  │     └─ paddle.x += paddle.direction * paddle.speed * deltaTime
  │     └─ Clamp paddle.x to [0, 700]
  │
  ├─ Collision Detection Phase
  │  ├─ Check ball vs walls (left, right, top)
  │  ├─ Check ball vs paddle
  │  ├─ Check ball vs each brick
  │  └─ Check ball vs bottom boundary (lost)
  │
  ├─ Bounce Resolution Phase
  │  └─ For each collision:
  │     ├─ If wall: invert velocityX or velocityY
  │     ├─ If paddle: calculate angle, set velocityX/Y
  │     ├─ If brick: destroy, invert appropriate velocity
  │     └─ If lost: trigger lives-- (next frame)
  │
  ├─ Render Phase
  │  ├─ Clear canvas
  │  ├─ Draw walls (rectangles)
  │  ├─ Draw bricks (rectangles, skip destroyed)
  │  ├─ Draw paddle (rectangle)
  │  ├─ Draw ball (circle)
  │  └─ Flush to screen
  │
  └─ Schedule next frame
```

### Ball-Wall Collision
```
Ball moving right toward right wall (x=800):
  ball.x >= 795 (rightBound)
  → velocityX = -velocityX
  → Ball bounces back left
```

### Ball-Paddle Collision
```
Ball falling downward, hits paddle:
  ball.y + radius >= paddle.y
  AND ball.x in [paddle.x, paddle.x + paddle.width]
  → angle = (ball.x - paddle.center) / paddle.halfWidth * 45°
  → velocityX = sin(angle) * speed
  → velocityY = -cos(angle) * speed
  → Ball bounces upward with lateral angle
```

### Ball-Brick Collision
```
Ball hits brick:
  brick.x <= ball.x <= brick.x + brick.width
  brick.y <= ball.y <= brick.y + brick.height
  → brick.destroyed = true
  → Invert appropriate velocity (top/bottom → Y, left/right → X)
```

### Ball Out of Bounds
```
Ball below paddle:
  ball.y > 600 (playfield.bottom)
  → GameState.loseLife()
  → lives -= 1
  → If lives === 0: status = 'lost'
  → Else: resetBall() at (400, 300) above paddle
```

## Implementation Checklist

### GameEngine Core
- [ ] GameEngine class avec constructor, start(), pause(), resume()
- [ ] GameLoop avec requestAnimationFrame et deltaTime
- [ ] Main loop: input → physics → collision → render
- [ ] Frame rate target: 60 FPS
- [ ] DeltaTime calculation: currentTime - lastTime

### Physics Simulation
- [ ] BallPhysics.updatePosition() : position += velocity * deltaTime
- [ ] PaddlePhysics.updatePosition() : position += direction * speed * deltaTime
- [ ] Paddle clamping : clamp(x, 0, canvasWidth - paddleWidth)
- [ ] Ball speed multiplier appliqué

### Collision Detection
- [ ] CollisionDetector.checkBallCollisions()
- [ ] AABB collision detection for all entities
- [ ] Ball.getBounds() → circle → AABB approx
- [ ] Paddle.getBounds() → rectangle
- [ ] Brick.getBounds() → rectangle
- [ ] Wall boundaries (left: 0, right: 800, top: 0)

### Bounce Resolution
- [ ] BounceResolver.reflectOnWall() : invert X or Y
- [ ] BounceResolver.reflectOnPaddle() : angle calculation
- [ ] BounceResolver.reflectOnBrick() : invert appropriate axis
- [ ] Handle corner cases (ball hitting corner)

### Game State Updates
- [ ] GameState.destroyBrick(index) : mark brick destroyed
- [ ] GameState.loseLife() : lives--
- [ ] GameState.resetBall(x, y) : reposition balle
- [ ] GameState.isGameWon() : bricks.length === 0
- [ ] GameState.isGameLost() : lives === 0

### Input Handling
- [ ] InputHandler.onKeyDown() : set paddle.direction
- [ ] InputHandler.onKeyUp() : clear paddle.direction
- [ ] Left arrow (←) → direction = -1
- [ ] Right arrow (→) → direction = 1
- [ ] No other keys processed

### Canvas Rendering
- [ ] CanvasRenderer.render() : full redraw each frame
- [ ] Clear canvas (white background)
- [ ] Draw walls (black lines or rectangles)
- [ ] Draw bricks (colored rectangles, skip destroyed)
- [ ] Draw paddle (rectangle, color)
- [ ] Draw ball (circle, color)
- [ ] 60 FPS smooth rendering

## Observability Impact

### Console Logging (Debug)
```javascript
// Per-collision
console.log('Collision:', { type, brickIndex });

// Per-life-loss
console.log('Life lost:', { livesRemaining: lives });

// Per-win/loss
console.log('Game Over:', { status, lives });
```

### Browser DevTools
- Frame rate monitor (should be ~60 FPS)
- No memory leaks (listeners properly removed on pause)

## Success Criteria (Definition of Done)

- ✅ Balle se déplace continuellement en ligne droite
- ✅ Balle rebondit sur les murs gauche, droit, haut
- ✅ Raquette se déplace gauche/droite au clavier (flèches)
- ✅ Raquette reste dans les limites du playfield
- ✅ Balle rebondit sur la raquette avec angle variable
- ✅ Briques se détruisent au contact de la balle
- ✅ Briques détruites disparaissent du rendu
- ✅ Balle sort en bas → lives--
- ✅ Lives atteint 0 → status = 'lost'
- ✅ Toutes les briques détruites → status = 'won'
- ✅ Rendu 60 FPS sans saccade
- ✅ Console log clean (no errors)

## Testing Notes

### Manual Game Testing
1. Lancer le jeu
2. Ball se déplace, raquette controllable
3. Tester collisions : walls, paddle, bricks
4. Tester loss of life : faire sortir balle en bas
5. Tester win condition : détruire toutes les briques
6. Vérifier lives count affichées et mises à jour

### Unit Tests (Optional, V1)
- BallPhysics.updatePosition() : position incremente
- CollisionDetector.isRectColliding() : AABB correcte
- BounceResolver.reflectOnWall() : velocity inverse
- GameState.destroyBrick() : brick marked destroyed

## Dependencies

- Canvas 2D API
- requestAnimationFrame
- Keyboard events (keydown, keyup)

## Timeline Estimate

- **Effort** : 2–3 jours
- **Risk** : Moyen (physique et collisions critiques)
- **Blocker** : Slice 1 doit être complète

## Notes

- La détection de collision peut être AABB simple en V1 (pas de circle-specific)
- Les rebonds peuvent être approchés (pas besoin de physics engine complet)
- Performance optimisations (spatial hashing, quad-tree) peuvent être reportées
- Sound/animations ne sont pas à ce stade
