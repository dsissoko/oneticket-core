---
title: Architecture — Breakout Game
---

# Architecture — Breakout Game

## 1. Architecture Principles

1. **Vanilla JavaScript** — No external dependencies (libraries, frameworks, or build tools). Pure HTML/CSS/JavaScript.
2. **Single Responsibility** — Each module handles one concern: game engine, physics, collision, rendering, state management.
3. **Separation of Concerns** — Clear boundaries between game logic, UI, input handling, and persistence.
4. **Performance First** — Efficient collision detection, minimal DOM updates, hardware-accelerated canvas rendering.
5. **Accessibility** — Keyboard-first gameplay with clear UI affordances; mouse support for menus.
6. **Progressive Enhancement** — Graceful degradation if certain features (localStorage, canvas) unavailable.

## 2. System Overview

Breakout is a **single-page HTML5 application** that runs entirely in the browser. The system is composed of:

- **Game Engine** — Core loop that updates game state and renders frames
- **Physics Engine** — Ball movement, collision detection, and bouncing logic
- **Game State Manager** — Tracks lives, bricks, paddle position, ball position/velocity, game status
- **Input Handler** — Keyboard input (arrow keys) for paddle control; mouse for menu interactions
- **Renderer** — Canvas-based 2D drawing of all game elements
- **Persistence Layer** — localStorage for speed slider preference and optional high scores
- **UI Layer** — Main menu, pause overlay, game over screen, victory screen

## 3. Architectural Style

**Event-driven, Frame-based Game Loop**

```
┌─────────────────────────────────────┐
│  Main Game Loop (requestAnimationFrame)  │
│  ~60 FPS (browser dependent)        │
└────────────┬────────────────────────┘
             │
       ┌─────▼──────┐
       │  Input     │ ← Keyboard/Mouse events
       │ Processing │
       └─────┬──────┘
             │
       ┌─────▼──────────────┐
       │  Update Game State │
       │  • Paddle position │
       │  • Ball physics    │
       │  • Collision check │
       │  • Life/brick count│
       └─────┬──────────────┘
             │
       ┌─────▼──────────┐
       │  Render Frame  │
       │  • Clear canvas│
       │  • Draw paddle │
       │  • Draw ball   │
       │  • Draw bricks │
       │  • Draw UI     │
       └────────────────┘
```

## 4. Main Technical Boundaries

### 4.1 Game Application Layer
- **HTML Document** — Single index.html with canvas element, menu containers, UI overlays
- **CSS Stylesheet** — Layout, typography, menu styling, responsive canvas
- **JavaScript Application** — Main entry point, game loop initialization, event listeners

### 4.2 Game Engine Core
- **GameEngine** — Central orchestrator managing game loop, state transitions, and component lifecycle
- **GameState** — Immutable representation of paddle, ball, bricks, lives, score, game phase
- **PhysicsEngine** — Ball velocity updates, collision detection (AABB with ball), bounce logic

### 4.3 Game Objects
- **Paddle** — Position, width, height, movement constraints, keyboard responsiveness
- **Ball** — Position, velocity (vx, vy), radius, mass, bounce elasticity
- **Bricks** — Array of active bricks; each has position, width, height, color, active state
- **GameBounds** — Canvas boundaries (walls, ceiling, floor)

### 4.4 Input & Control
- **KeyboardHandler** — Detects arrow key presses (left/right), debouncing, frame-based paddle updates
- **MouseHandler** — Menu clicks (Start, Restart, Quit), speed slider interaction

### 4.5 Rendering
- **CanvasRenderer** — 2D canvas drawing API; renders paddle, ball, bricks, UI elements
- **UIRenderer** — DOM-based overlays for menus, game over, victory screens

### 4.6 Persistence
- **LocalStorageManager** — Reads/writes speed preference and optional game stats to localStorage

### 4.7 Game Phases
- **MENU** — Main menu displayed, waiting for user to click Start
- **PLAYING** — Active gameplay; ball moving, collisions detected
- **PAUSED** — Overlay paused UI (optional; depends on design)
- **GAME_OVER** — All lives exhausted; show Game Over screen
- **VICTORY** — All bricks destroyed; show Victory screen

## 5. Key Components

### 5.1 GameEngine
**Responsibility**: Orchestrate game loop, manage state transitions, coordinate physics and rendering.

```javascript
class GameEngine {
  constructor(canvasElement, config = {})
  initialize()           // Set up game state, renderer, input handlers
  start()                // Begin main game loop
  pause()                // Halt game loop
  resume()               // Continue game loop
  reset()                // Reset to initial state
  update(deltaTime)      // Update game state (physics, collisions)
  render()               // Render current frame
  gameLoop(timestamp)    // requestAnimationFrame callback
  checkGameOver()        // Evaluate win/lose conditions
}
```

### 5.2 GameState
**Responsibility**: Represent and mutate current game state.

```javascript
class GameState {
  paddle = { x, y, width, height }
  ball = { x, y, radius, vx, vy }
  bricks = [ { x, y, width, height, active } ]
  lives = 3
  bricksDestroyed = 0
  speedMultiplier = 1.0  // From slider
  gamePhase = 'MENU'     // MENU, PLAYING, PAUSED, GAME_OVER, VICTORY
}
```

### 5.3 PhysicsEngine
**Responsibility**: Update ball position, detect collisions, apply bouncing rules.

```javascript
class PhysicsEngine {
  updateBall(ball, deltaTime)           // Update position based on velocity
  checkCollisions(ball, paddle, bricks) // Return collision info
  resolveBallPaddleCollision(...)       // Bounce ball off paddle
  resolveBallBrickCollision(...)        // Bounce ball off brick, mark brick destroyed
  resolveBallWallCollision(...)         // Bounce off walls/ceiling
  checkBallOutOfBounds(ball, canvas)    // Ball passed bottom edge?
}
```

### 5.4 InputHandler (Keyboard)
**Responsibility**: Capture keyboard input and update paddle position.

```javascript
class KeyboardHandler {
  constructor(gameEngine)
  onKeyDown(event)       // Detect left/right arrow
  onKeyUp(event)         // Stop movement when released
  updatePaddlePosition() // Apply movement constraints
}
```

### 5.5 CanvasRenderer
**Responsibility**: Draw all game elements to canvas.

```javascript
class CanvasRenderer {
  constructor(canvasElement)
  clear()                // Clear canvas
  drawPaddle(paddle)     // Draw rectangle
  drawBall(ball)         // Draw circle
  drawBricks(bricks)     // Draw grid of rectangles
  drawWalls(canvas)      // Draw border indicators
  drawHUD(lives, bricks) // Draw lives and remaining bricks count
}
```

### 5.6 UIRenderer
**Responsibility**: Manage DOM-based UI overlays.

```javascript
class UIRenderer {
  showMenu()             // Display start menu
  hideMenu()             // Hide start menu
  showGameOver(stats)    // Show game over screen
  showVictory(stats)     // Show victory screen
  updateHUD(lives, bricks)
}
```

### 5.7 LocalStorageManager
**Responsibility**: Persist and retrieve user preferences.

```javascript
class LocalStorageManager {
  static SPEED_KEY = 'breakout_speed_preference'
  static HIGH_SCORE_KEY = 'breakout_high_score'
  
  getSpeedPreference()   // Return default if not found
  setSpeedPreference(value)
  getHighScore()
  setHighScore(value)
}
```

## 6. Key Interfaces

### 6.1 HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
  <title>Breakout Game</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Main game canvas -->
  <canvas id="gameCanvas"></canvas>
  
  <!-- Menu overlay -->
  <div id="menu" class="overlay">
    <h1>Breakout</h1>
    <button id="startButton">Start Game</button>
  </div>
  
  <!-- Speed control -->
  <div id="controls">
    <label for="speedSlider">Speed:</label>
    <input type="range" id="speedSlider" min="0.5" max="2" step="0.1" value="1">
  </div>
  
  <!-- HUD -->
  <div id="hud">
    <span id="lives">Lives: 3</span>
    <span id="bricks">Bricks: 50</span>
  </div>
  
  <!-- Game Over / Victory overlays -->
  <div id="gameOverOverlay" class="overlay hidden">
    <h1>Game Over</h1>
    <button id="restartButton">Restart</button>
    <button id="quitButton">Quit</button>
  </div>
  
  <div id="victoryOverlay" class="overlay hidden">
    <h1>Victory!</h1>
    <button id="restartButton">Restart</button>
    <button id="quitButton">Quit</button>
  </div>
  
  <script src="app.js"></script>
</body>
</html>
```

### 6.2 Canvas Coordinate System
- **Origin** — Top-left corner (0, 0)
- **X-axis** — Left to right (0 to canvas width)
- **Y-axis** — Top to bottom (0 to canvas height)
- **Collision Detection** — Axis-aligned bounding box (AABB) for paddle/bricks; circle-rect for ball

### 6.3 Event Flow
```
User presses arrow key
     ↓
KeyboardHandler.onKeyDown()
     ↓
Update KeyState { leftPressed, rightPressed }
     ↓
GameEngine.update()
     ↓
InputHandler processes KeyState → moves paddle
     ↓
PhysicsEngine updates ball + collision detection
     ↓
CanvasRenderer draws frame
     ↓
UI updates (lives, brick count)
```

## 7. Data Architecture

### 7.1 Game State
- **Type** — JavaScript object (mutable during game loop; snapshot-like)
- **Scope** — Global to GameEngine instance; no global variables
- **Persistence** — User preferences (speed, high score) in localStorage

### 7.2 Canvas Data
- **Format** — 2D pixel buffer in browser memory
- **Access** — Via CanvasRenderingContext2D API
- **No explicit storage** — Rendered fresh every frame

### 7.3 Brick Grid Layout
```
Example: 10 bricks per row, 5 rows
[0,0]  [1,0]  [2,0]  ... [9,0]
[0,1]  [1,1]  [2,1]  ... [9,1]
...
[0,4]  [1,4]  [2,4]  ... [9,4]
```

### 7.4 Speed Slider
- **Range** — 0.5 (half speed) to 2.0 (double speed)
- **Default** — 1.0
- **Storage** — localStorage as `breakout_speed_preference`
- **Applied to** — Ball velocity multiplier in PhysicsEngine

## 8. Security Architecture

### 8.1 Threats Mitigated
1. **XSS (DOM-based)** — No user input injected into DOM; canvas rendering only
2. **Local Storage Hijacking** — Preference data only; no sensitive user data stored
3. **Canvas Exploitation** — Standard 2D API usage; no advanced features that could expose data

### 8.2 Measures
- **Input Validation** — Keyboard events validated; canvas click events scoped
- **No eval()** — No dynamic code execution
- **localStorage Isolation** — Keys namespaced to `breakout_*`
- **Content Security Policy** — Can implement CSP header if deployed on server

## 9. Deployment Strategy

### 9.1 Delivery
- **Package** — Single HTML file + JavaScript file + CSS file (or inlined)
- **CDN** — Can be served from any static file server (no server-side processing)
- **Caching** — All assets can be cached indefinitely (hash versioning recommended for updates)

### 9.2 Browser Support
- **Minimum** — ES6+ JavaScript (arrow functions, const/let, classes)
- **Required APIs** — Canvas 2D, KeyboardEvent, MouseEvent, requestAnimationFrame, localStorage
- **Target** — Modern browsers (Chrome, Firefox, Safari, Edge from 2020+)

### 9.3 Performance
- **FPS Target** — 60 FPS via requestAnimationFrame
- **Canvas Size** — Responsive (100% of viewport or fixed); CSS media queries for mobile
- **Frame Budget** — ~16.7ms per frame (must include input, update, render)

## 10. Observability Strategy

### 10.1 Logging
- **Level** — Console warnings/errors for physics edge cases, collision misses
- **Format** — Simple console.log/console.warn for debugging
- **Runtime** — Optional verbose mode flag for development

### 10.2 Metrics (Optional, Future)
- **FPS Counter** — Display current frame rate (development only)
- **Collision Count** — Debug metric for collision detection efficiency
- **Ball Out-of-Bounds** — Detect game rule violations (should never happen)

### 10.3 Error Handling
- **Canvas Unavailable** — Fallback error message; game cannot run
- **Performance Degradation** — Automatic frame skipping if CPU-bound (not planned v1.0)
- **Keyboard Not Responding** — Log warning; can still use menus with mouse

## 11. Related C4 Views

C4 diagrams for this system will be stored in `docs_path/how/c4/`:

- **System Context** (C4Level1) — Breakout game, browser, player
- **Container** (C4Level2) — Canvas renderer, game engine, input handlers, localStorage
- **Components** (C4Level3) — Detailed internal components (Physics, Collision, etc.)

*To be generated after architecture approval.*

## 12. Related Implementation Slices

Implementation slices will decompose the build into deliverable units:

- **Slice 1** — Game canvas setup + basic paddle rendering + keyboard input
- **Slice 2** — Ball physics + movement + collision with walls
- **Slice 3** — Brick grid + brick-ball collision + brick destruction
- **Slice 4** — Lives system + game over / victory conditions
- **Slice 5** — Speed slider + localStorage persistence
- **Slice 6** — Menu UI (Start, Restart, Quit) + HUD (lives, brick count)
- **Slice 7** — Polish: animations, sound considerations (muted for v1.0), responsive layout
- **Slice 8** — Testing & optimization: edge case validation, performance tuning

*To be generated after architecture approval.*

## 13. Technical Constraints

| Constraint | Impact | Mitigation |
|---|---|---|
| **No external dependencies** | Limited libraries for animation, physics — all custom | Vanilla JavaScript; focus on simplicity over advanced features |
| **Canvas 2D only** | No 3D graphics, shaders, or advanced effects | Use 2D primitives (circles, rectangles); CSS for UI |
| **Single-threaded JavaScript** | Long computations block rendering | Keep physics/collision O(n) efficient; frame budget ~16.7ms |
| **localStorage quotas** | Limited persistent storage (typically 5-10 MB) | Minimal data: speed preference + optional high score |
| **Browser API variance** | Minor differences across browsers | Test on Chrome, Firefox, Safari, Edge; use standard APIs |
| **Mobile input** — Keyboard not available on mobile | Gameplay affected on touch devices | Future: support touch controls / on-screen paddle |
| **Fixed game logic** — No dynamic level loading | All content defined at compile time | Bricks grid hardcoded; no progression or procedural generation (v1.0) |

## 14. Open Questions

1. **Brick Grid Dimensions** — Exact number of bricks per row? (Product spec: Open Q1)
2. **Canvas Responsiveness** — Fixed dimensions or responsive to window size?
3. **Ball Initial Speed** — Hardcoded velocity or derived from slider on game start?
4. **Bounce Angle on Paddle** — Does contact point on paddle (left/center/right) affect bounce angle?
5. **Score Tracking** — Display a score counter even without point system (v1.0)?
6. **Brick Styling** — Different colors per row, or uniform?
7. **Mobile Support** — Scope for touch controls on mobile, or desktop-only v1.0?
8. **Accessibility** — ARIA labels for screen readers; keyboard-only mode?
9. **Sound Effects** — Placeholder for audio (muted in v1.0) or fully out of scope?
10. **Save Game State** — Ability to pause and resume, or restart only?

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-27  
**Status**: Architecture designed for implementation
