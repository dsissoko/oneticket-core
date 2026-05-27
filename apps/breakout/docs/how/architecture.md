# Architecture — Breakout

## Overview

**Breakout** is a classical arcade breakout game implemented in vanilla JavaScript (HTML5, CSS3, ES2015+) with zero external dependencies. The architecture emphasizes simplicity, separation of concerns, and immediate responsiveness through a frame-based game loop architecture.

### Key Design Principles

1. **Vanilla JavaScript Only** — No frameworks, libraries, or build tools
2. **Separation of Concerns** — Distinct modules for game logic, rendering, input, and state management
3. **Deterministic Game Loop** — 60 FPS rendering with fixed physics timestep
4. **Module-Based Structure** — Each component is self-contained and communicates through well-defined interfaces
5. **Canvas 2D Rendering** — Direct DOM manipulation for UI, Canvas for game rendering

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Language** | JavaScript (ECMAScript 2015+) |
| **Markup** | HTML5 |
| **Styling** | CSS3 |
| **Rendering** | Canvas 2D (game), DOM (UI/menus) |
| **Build Tool** | None (direct browser execution) |
| **Package Manager** | None |
| **External Dependencies** | Zero |

---

## Architecture Layers

### 1. Entry Point — index.html

```
index.html
├── <canvas id="gameCanvas">
├── Menu/UI Containers
└── <script src="js/app.js">
```

**Responsibilities:**
- HTML5 document structure
- Canvas element for game rendering
- DOM containers for menu system
- Single entry script

---

### 2. Application Bootstrap — src/app.js

Main application orchestrator that:
- Initializes the Game Engine
- Loads saved settings (speed preference from localStorage)
- Manages application state transitions (menu ↔ gameplay ↔ game-over)
- Handles window lifecycle (resize, beforeunload)

**Key Exports:**
```javascript
// app.js
export class App {
  constructor(canvasElement)
  init()           // Initialize everything
  start()          // Start the game loop
  stop()           // Stop the game loop
  show(screen)     // Show menu/game-over screen
  hide(screen)     // Hide menu/game-over screen
}
```

---

### 3. Game Engine — src/game.js

The core game loop and state orchestrator.

**Responsibilities:**
- Frame-based game loop (requestAnimationFrame)
- State management (menu, playing, gameOver, victory)
- Coordinate between physics, collision, rendering, and input
- Handle game transitions and lifecycle

**Key Exports:**
```javascript
// game.js
export class GameEngine {
  constructor(canvas, config)
  
  // Lifecycle
  init(config)
  start()
  stop()
  reset()
  
  // Game state
  get state()        // Current game state
  get lives()
  get ballSpeed()
  
  // Input/Output
  onKeyDown(key)
  onKeyUp(key)
  render(deltaTime)
  
  // Events
  on(event, callback)
  emit(event, data)
}
```

**State Machine:**
```
MENU → (start) → PLAYING ↔ (pause) → PLAYING
         ↓                                ↓
       VICTORY            GAME_OVER ← (lives === 0)
         ↓                    ↓
      (restart) ─────────────┘
```

---

### 4. Game Objects — src/objects/

Self-contained entities with position, velocity, and collision bounds.

#### 4.1 Paddle (src/objects/paddle.js)

```javascript
export class Paddle {
  constructor(x, y, width, height, speed)
  
  update(deltaTime)         // Update position based on input state
  moveLef(deltaTime)
  moveRight(deltaTime)
  getBounds()              // Return collision bounds
  render(ctx)              // Draw to canvas
  reset()                  // Reset to center
  
  get x()
  get y()
  get width()
  get height()
}
```

**Properties:**
- Position: (x, y) — center-bottom of play area
- Dimensions: width × height
- Speed: pixels per second
- Bounds checking: constrained to playfield edges

---

#### 4.2 Ball (src/objects/ball.js)

```javascript
export class Ball {
  constructor(x, y, radius, vx, vy)
  
  update(deltaTime)        // Update position
  setVelocity(speed)       // Set speed, maintain direction
  getBounds()              // Return collision bounds
  render(ctx)              // Draw to canvas
  reset(x, y)              // Reset position and random direction
  
  get x()
  get y()
  get vx()
  get vy()
  get speed()
  get radius()
}
```

**Properties:**
- Position: (x, y) — center of ball
- Velocity: (vx, vy) — pixels per second
- Radius: pixels
- Speed: magnitude of velocity vector

---

#### 4.3 Brick (src/objects/brick.js)

```javascript
export class Brick {
  constructor(x, y, width, height, color)
  
  getBounds()
  render(ctx)
  isDestroyed()
  destroy()
  
  get x()
  get y()
  get width()
  get height()
  get color()
}
```

**Properties:**
- Position: (x, y) — top-left
- Dimensions: width × height
- Destroyed state: boolean flag
- Color: CSS color value

---

#### 4.4 Wall (src/objects/wall.js)

```javascript
export class Wall {
  constructor(width, height, brickLayout)
  
  getBricks()              // Return all bricks
  getActiveBricks()        // Return non-destroyed bricks
  isCleared()              // Return true if all destroyed
  reset()                  // Restore all bricks
  render(ctx)              // Draw all bricks
  
  // Dimensions
  get width()
  get height()
}
```

**Layout:**
- Default: 5 rows × 8 columns
- Regular spacing and alignment
- Configurable via initialization

---

### 5. Collision Detection — src/collision.js

Pure collision detection routines without side effects.

```javascript
export const CollisionDetector = {
  // Ball-Wall collisions
  ballHitsTop(ball, topBound)           // → boolean
  ballHitsBottom(ball, bottomBound)     // → boolean
  ballHitsLeft(ball, leftBound)         // → boolean
  ballHitsRight(ball, rightBound)       // → boolean
  
  // Ball-Paddle collision
  ballHitsPaddle(ball, paddle)          // → { hit: boolean, normal: vector }
  
  // Ball-Brick collision
  ballHitsBrick(ball, brick)            // → { hit: boolean, normal: vector }
  
  // Rect-Rect AABB
  aabbCollision(rect1, rect2)           // → boolean
  
  // Rect-Circle collision
  circleRectCollision(circle, rect)     // → { hit: boolean, normal: vector }
}
```

**Algorithms:**
- AABB (Axis-Aligned Bounding Box) for rect-rect
- Circle-AABB for ball-object collisions
- Collision normal for accurate bounce direction

---

### 6. Physics — src/physics.js

Velocity and collision response calculations.

```javascript
export const Physics = {
  // Bounce calculations
  bounceHorizontal(ball)               // Flip vx
  bounceVertical(ball)                 // Flip vy
  bounceOffSurface(ball, normal)       // Reflect velocity off surface normal
  
  // Paddle bounce with angle variation
  bounceOffPaddle(ball, paddle)        // Angle depends on hit position
  
  // Utility
  clampSpeed(ball, maxSpeed)           // Prevent accumulation
  updatePosition(object, deltaTime)    // Apply velocity
}
```

**Physics Rules:**
- No gravity (classic Pong-style)
- Constant speed (no acceleration/deceleration)
- Perfect elastic collisions
- Angle variation on paddle depends on paddle region hit

---

### 7. Input Handler — src/input.js

Keyboard input state tracking (not events).

```javascript
export class InputHandler {
  constructor(element)
  
  init()                               // Attach listeners
  destroy()                            // Clean up listeners
  
  get isLeftPressed()                  // → boolean
  get isRightPressed()                 // → boolean
  reset()                              // Clear all input state
  
  // Events
  on(event, callback)                  // Listen to input events
  emit(event, data)
}
```

**Event Types:**
- `keydown` — raw key event
- `keyup` — raw key event
- `inputStateChanged` — aggregated state

---

### 8. Renderer — src/renderer.js

Draws game objects to canvas and manages rendering context.

```javascript
export class Renderer {
  constructor(canvas)
  
  clear()                              // Clear canvas
  renderBall(ball)
  renderPaddle(paddle)
  renderWall(wall)
  renderBounds(bounds)
  renderUI(gameState)
  
  // Dimensions
  get width()
  get height()
  
  // Context access
  get ctx()
  get canvas()
}
```

**Rendering Order:**
1. Clear canvas
2. Draw walls (background)
3. Draw bricks
4. Draw paddle
5. Draw ball
6. Draw HUD (lives, score if applicable)

---

### 9. Menu System — src/ui/menu.js

DOM-based menu management for game flow.

```javascript
export class MenuSystem {
  constructor(container)
  
  showStartMenu()
  showGameOverMenu()
  showVictoryMenu()
  hideMenu()
  
  // Events
  on(action, callback)  // action: 'start', 'restart', 'quit', 'speedChange'
  
  getSelectedSpeed()    // → number (0.5 to 2.0)
}
```

**Menu Types:**
1. **Start Menu** — Démarrer, Slider, Quitter
2. **Game Over Menu** — Rejouer, Quitter
3. **Victory Menu** — Rejouer, Quitter

---

### 10. State Management — src/state.js

Immutable game state with localStorage persistence.

```javascript
export class GameState {
  constructor()
  
  // Read
  get lives()
  get ballSpeed()
  get score()
  get bricksDestroyed()
  
  // Write
  setBallSpeed(speed)      // → persists to localStorage
  setLives(count)
  addScore(points)
  resetLives()
  resetScore()
  
  // Batch update
  reset()                  // Reset to initial state
  load()                   // Load from localStorage
  save()                   // Save to localStorage
  
  // Serialization
  toJSON()                 // → object
  fromJSON(data)           // ← restore from object
}
```

**Persisted Data (localStorage):**
- `breakout_ballSpeed` — (0.5 to 2.0) user preference
- Scores/lives are NOT persisted (session-only)

---

## Module Dependencies Graph

```
app.js
  ├── GameEngine (src/game.js)
  │   ├── Paddle (src/objects/paddle.js)
  │   ├── Ball (src/objects/ball.js)
  │   ├── Wall (src/objects/wall.js)
  │   ├── Renderer (src/renderer.js)
  │   ├── InputHandler (src/input.js)
  │   ├── CollisionDetector (src/collision.js)
  │   ├── Physics (src/physics.js)
  │   └── GameState (src/state.js)
  │
  ├── MenuSystem (src/ui/menu.js)
  │   └── GameState (src/state.js)
  │
  └── GameState (src/state.js)
```

**Key Invariant:** No circular dependencies. All dependencies flow downward.

---

## File Structure

```
apps/breakout/
├── app/
│   ├── index.html              # Entry point
│   ├── style.css               # Global styles (menus, canvas)
│   └── js/
│       ├── app.js              # Bootstrap & orchestration
│       ├── game.js             # Game engine & loop
│       │
│       ├── objects/
│       │   ├── paddle.js
│       │   ├── ball.js
│       │   ├── brick.js
│       │   └── wall.js
│       │
│       ├── collision.js        # Collision detection
│       ├── physics.js          # Physics calculations
│       ├── input.js            # Keyboard input handler
│       ├── renderer.js         # Canvas rendering
│       ├── state.js            # Game state + localStorage
│       │
│       └── ui/
│           ├── menu.js         # Menu system
│           └── menu.css        # Menu styles
│
├── docs/
│   └── how/
│       ├── architecture.md     # This file
│       └── c4/                 # C4 diagrams (to be generated)
│
└── README.md
```

---

## Communication Patterns

### 1. Event-Driven Updates

**Menu → App → GameEngine**
```javascript
menu.on('start', (speed) => {
  gameState.setBallSpeed(speed)
  gameEngine.init(gameState)
  gameEngine.start()
})
```

**GameEngine → App → Menu**
```javascript
gameEngine.on('gameOver', (stats) => {
  app.show('gameOverMenu')
})

gameEngine.on('victory', (stats) => {
  app.show('victoryMenu')
})
```

### 2. Input Flow

```
Keyboard Events
    ↓
InputHandler (state tracking)
    ↓
GameEngine.onKeyDown/onKeyUp()
    ↓
Paddle.moveLeft() / Paddle.moveRight()
```

### 3. Game Loop

```
requestAnimationFrame
    ↓
GameEngine.update(deltaTime)
    │
    ├→ InputHandler state check
    ├→ Paddle.update()
    ├→ Ball.update()
    ├→ CollisionDetector.check() → Physics.bounce()
    ├→ Wall.checkCleared()
    └→ Emit events (ballLost, victoryDetected, etc.)
    ↓
GameEngine.render(deltaTime)
    │
    ├→ Renderer.clear()
    ├→ Renderer.render(paddle, ball, wall)
    └→ Renderer.renderUI()
```

---

## Configuration

### Canvas Dimensions

| Property | Value |
|----------|-------|
| Width | 800px |
| Height | 600px |

### Game Constants

| Property | Value | Notes |
|----------|-------|-------|
| Ball radius | 5px | |
| Paddle width | 80px | |
| Paddle height | 12px | |
| Paddle speed | 400px/s | Adjustable via config |
| Ball speed base | 200px/s | Adjustable via slider (0.5x – 2.0x) |
| Brick width | 80px | |
| Brick height | 15px | |
| Brick rows | 5 | Fixed |
| Brick columns | 8 | Fixed |
| Lives initial | 3 | |
| FPS target | 60 | |

### Speed Slider Range

- **Min**: 0.5× (very slow)
- **Max**: 2.0× (very fast)
- **Default**: 1.0×
- **Persistence**: localStorage key `breakout_ballSpeed`

---

## Non-Functional Requirements

### Performance

- **Target FPS**: 60 (16.67ms per frame)
- **Max frame time**: < 10ms for game logic + rendering
- **Acceptable**: Minor frame drops under 0.5% of frames

### Browser Compatibility

- **ES2015+** (class syntax, arrow functions, const/let)
- **Canvas 2D API**
- **localStorage API**
- **requestAnimationFrame**
- **Tested browsers**: Chrome, Firefox, Safari, Edge (latest versions)

### Memory

- No memory leaks on restart
- Event listener cleanup on game stop
- < 10MB heap usage for typical gameplay

### Accessibility

- No requirements for MVP
- Game controls via keyboard only

---

## Architectural Decisions

### Decision 1: Canvas 2D vs DOM Rendering

**Choice:** Canvas 2D for game, DOM for UI/menus

**Rationale:**
- Canvas provides direct pixel control, essential for smooth animation
- DOM better suits menu rendering and responsive layout
- Separation of concerns: game is canvas, UI is HTML

---

### Decision 2: No Build Tool

**Choice:** Vanilla JavaScript modules using ES6 `import/export`

**Rationale:**
- Project scope is small and self-contained
- Modern browsers support ES6 modules natively
- Reduces complexity and development overhead
- Direct browser execution aids debugging

---

### Decision 3: State Persistence

**Choice:** localStorage for ball speed only, session-only for gameplay state

**Rationale:**
- Ball speed is a user preference (persist across sessions)
- Scores and game progress are session-specific (no persistence)
- Simple and meets MVP requirements

---

### Decision 4: Collision Detection

**Choice:** AABB + Circle-AABB with continuous detection

**Rationale:**
- Sufficient accuracy for arcade-style physics
- Computationally cheap (no pixel-perfect detection needed)
- Prevents tunneling at 60 FPS with reasonable ball speeds

---

### Decision 5: Game Loop Frequency

**Choice:** Decouple rendering from physics (fixed physics timestep)

**Rationale:**
- Ensures deterministic physics independent of frame rate
- Accommodates variable frame timing in browsers
- Standard in game development

---

## Integration Points

### 1. Keyboard Input → Paddle Movement

```javascript
// InputHandler detects key state
inputHandler.on('leftPressed', () => {
  paddle.moveLeft(deltaTime)
})
```

### 2. Ball-Object Collision → Physics Update

```javascript
const { hit, normal } = CollisionDetector.ballHitsPaddle(ball, paddle)
if (hit) {
  Physics.bounceOffSurface(ball, normal)
}
```

### 3. Game State → Menu Visibility

```javascript
gameEngine.on('gameOver', () => {
  menuSystem.showGameOverMenu()
})
```

### 4. Speed Slider → Ball Speed

```javascript
menu.on('speedChange', (speed) => {
  gameState.setBallSpeed(speed)
  gameEngine.updateBallSpeed(speed)
})
```

### 5. Restart → State Reset

```javascript
menu.on('restart', () => {
  gameState.reset()
  gameEngine.reset()
  gameEngine.start()
})
```

---

## Testing Strategy

### Unit Tests (per module)

- **Collision.js**: AABB, circle-AABB collision tests
- **Physics.js**: Bounce angle calculations, velocity updates
- **Paddle.js**: Movement boundaries, state transitions
- **Ball.js**: Position updates, speed changes
- **Wall.js**: Brick initialization, destruction state

### Integration Tests

- Game loop execution (update → render cycle)
- Input → Paddle movement pipeline
- Collision detection + physics response
- State transitions (playing → gameOver → menu)

### E2E Tests (browser-based)

- Game starts without console errors
- Keyboard controls responsive
- Menu interactions work
- Win/lose conditions detected
- Restart functionality

---

## Known Limitations & Future Work

### MVP Scope

- Single level/configuration only
- No scoring system
- No difficulty progression
- No sound/music
- No mobile/touch controls
- No pause during gameplay
- No AI opponents

### Potential Enhancements

1. **Progressive Difficulty**: Increase ball speed after X bricks destroyed
2. **Scoring System**: Points per brick destroyed + time multiplier
3. **Power-ups**: Slow down, paddle size, ball multiplication
4. **Sound Effects**: Hit sounds, victory/defeat fanfares
5. **Mobile Support**: Touch controls for paddle movement
6. **Leaderboard**: High score persistence with name entry
7. **Particle Effects**: Visual feedback on collisions

---

## Glossary

| Term | Definition |
|------|-----------|
| **Brick** | Rectangular object that can be destroyed by ball impact |
| **Paddle** | Player-controlled horizontal bar that bounces the ball |
| **Wall** | Collection of bricks arranged in rows and columns |
| **AABB** | Axis-Aligned Bounding Box; fast collision detection method |
| **Bounce** | Ball velocity reflection off a surface |
| **Game Loop** | Continuous cycle of update → detect collisions → render |
| **Normal** | Surface vector perpendicular to collision boundary |

---

## References

- **Product Spec**: [apps/breakout/docs/what/product-spec.md](../what/product-spec.md)
- **Epic 0 MVP**: [apps/breakout/docs/what/epics/epic-0-mvp/epic.md](../what/epics/epic-0-mvp/epic.md)
- **Canvas 2D API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **ES6 Modules**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **localStorage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

**Architecture Version**: 1.0  
**Last Updated**: May 27, 2026  
**Status**: Complete (pending C4 diagrams)
