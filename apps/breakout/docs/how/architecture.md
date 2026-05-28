# Architecture — Breakout Game Engine

## 1. Architecture Principles

1. **Vanilla JavaScript Foundation** — No external dependencies. Pure HTML5, CSS3, ES6 JavaScript.
2. **Separation of Concerns** — Distinct modules for game state, physics, rendering, input, and UI.
3. **Single Responsibility** — Each component handles one concern (e.g., physics engine only updates velocities/positions, renderer only draws).
4. **Frame-Driven Model** — All updates driven by a single game loop using `requestAnimationFrame` for 60 FPS consistency.
5. **Immutable State Transitions** — Game state changes flow unidirectionally (input → state update → render).
6. **No Tunneling** — Collision detection prevents ball from passing through obstacles by checking single collision per frame.

## 2. System Overview

Breakout is a single-page, canvas-based arcade game that runs in a single JavaScript execution context. The game system consists of:

- **Game Loop** — Orchestrates each frame (input → physics → collision → rendering)
- **Game State Manager** — Tracks lives, bricks, ball, paddle, game phase (menu/playing/gameover/victory)
- **Physics Engine** — Updates ball and paddle position/velocity based on time delta
- **Collision Detector** — Detects and resolves collisions (ball vs walls, paddle, bricks, floor)
- **Input Handler** — Captures keyboard (arrow keys) and mouse (menu clicks) events
- **Renderer** — Draws bricks, ball, paddle, UI on canvas
- **Menu Controller** — Manages navigation between main menu, game, victory, and game-over screens

## 3. Architectural Style

**Event-Driven Game Loop Architecture** with a **state machine** for game phases.

```
┌─────────────────┐
│  Input Handler  │ ← Captures keyboard/mouse events
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│         Game Loop (60 FPS)              │
│  ┌────────────────────────────────────┐ │
│  │ 1. Process Input → Update State    │ │
│  │ 2. Update Physics (Δt)             │ │
│  │ 3. Detect & Resolve Collisions     │ │
│  │ 4. Render Canvas                   │ │
│  │ 5. Check Win/Loss Conditions       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│    Renderer                             │
│  (Canvas, DOM for UI/Menu)              │
└─────────────────────────────────────────┘
```

## 4. Main Technical Boundaries

### Boundary 1: Game Canvas Layer
**Scope:** Rendering game objects (ball, paddle, bricks) on HTML5 Canvas.
**Responsibility:** Visual representation only; no logic.
**Technologies:** Canvas 2D Context, requestAnimationFrame.

### Boundary 2: Game Engine Layer
**Scope:** Physics, collision detection, state management, game rules.
**Responsibility:** All game logic; no rendering or DOM manipulation.
**Dependencies:** None (pure JavaScript).

### Boundary 3: Menu & UI Layer
**Scope:** Main menu, game-over/victory screens, speed slider, buttons.
**Responsibility:** Navigation, user interaction, settings persistence.
**Technologies:** HTML/CSS, DOM manipulation, localStorage (speed preference).

### Boundary 4: Input Layer
**Scope:** Keyboard (arrows) and mouse (clicks) event capture.
**Responsibility:** Translate user input into game state changes.
**Technologies:** DOM event listeners.

## 5. Key Components

### 5.1 Game Loop (`gameLoop.js`)
**Purpose:** Orchestrates each frame; synchronizes all subsystems.

**Responsibilities:**
- Call `inputHandler.update()` to process keyboard/mouse input
- Call `physics.update(deltaTime)` to move ball and paddle
- Call `collisionDetector.detectAndResolve()` to handle collisions
- Call `renderer.draw()` to render canvas
- Check win/loss/game-over conditions
- Manage game phase transitions (menu → playing → victory/gameover)

**Key Methods:**
```javascript
class GameLoop {
  run() { /* requestAnimationFrame loop */ }
  handleGamePhaseChange(newPhase) { /* stop/start physics */ }
  checkWinCondition() { /* all bricks destroyed? */ }
  checkLossCondition() { /* lives exhausted? */ }
}
```

### 5.2 Game State (`gameState.js`)
**Purpose:** Single source of truth for game data.

**State Structure:**
```javascript
{
  phase: "menu|playing|victory|gameover",  // Current game phase
  lives: 3,                                // Remaining lives (0-3)
  bricks: [...],                          // Array of brick objects
  ball: { x, y, vx, vy, radius },        // Ball position and velocity
  paddle: { x, y, width, height, vx },   // Paddle position and velocity
  speedMultiplier: 1.0,                   // Speed adjustment (0.5 - 2.0)
  score: 0,                               // (For future use)
  isWon: false,                           // Victory flag
}
```

**Key Methods:**
```javascript
class GameState {
  resetGame() { /* reinit all values */ }
  decrementLives() { /* lives-- */ }
  removeBrick(id) { /* splice from array */ }
  setPause(bool) { /* toggle pause */ }
  setSpeedMultiplier(factor) { /* 0.5-2.0 */ }
  isGameOver() { /* lives === 0 */ }
  isVictory() { /* bricks.length === 0 */ }
}
```

### 5.3 Physics Engine (`physics.js`)
**Purpose:** Updates ball and paddle position/velocity based on deltaTime.

**Responsibilities:**
- Update ball position: `x += vx * dt`, `y += vy * dt`
- Update paddle position based on input velocity
- Apply speed multiplier to ball velocity
- Clamp paddle to screen bounds
- Separate gravity/acceleration logic (future-proof)

**Key Methods:**
```javascript
class Physics {
  update(deltaTime) {
    // Update ball position/velocity
    // Update paddle position
    // Clamp paddle to bounds
  }
  applySpeedMultiplier(multiplier) {
    // Scale ball velocity by factor
  }
}
```

### 5.4 Collision Detector (`collisionDetector.js`)
**Purpose:** Detects and resolves collisions; prevents tunneling.

**Collision Types (Priority Order):**
1. **Floor Collision** → Ball below play area → Emit "ball-lost" event
2. **Brick Collision** → Ball intersects brick → Reflect ball, destroy brick
3. **Paddle Collision** → Ball intersects paddle → Reflect ball (angle-dependent)
4. **Wall/Ceiling Collision** → Ball intersects left/right/top → Reflect ball

**Resolution Strategy:**
- Only resolve **one collision per frame** to prevent tunneling
- Check collisions in priority order; return after first match
- Use AABB (Axis-Aligned Bounding Box) for brick/wall checks
- Use circle-vs-rect for ball-vs-paddle (angle-dependent reflection)

**Key Methods:**
```javascript
class CollisionDetector {
  detectAndResolve(gameState) {
    // Check floor first
    if (ballBelowFloor) { return "ball-lost"; }
    // Check bricks
    let hitBrick = findBrickCollision(ball);
    if (hitBrick) { 
      reflectBall(direction);
      return "brick-destroyed"; 
    }
    // Check paddle
    if (intersectsCircleRect(ball, paddle)) {
      reflectBallFromPaddle(paddle);
      return "paddle-bounce";
    }
    // Check walls/ceiling
    if (ballHitsWall) { reflectBallX(); }
    if (ballHitsCeiling) { reflectBallY(); }
  }
  
  reflectBallFromPaddle(paddle) {
    // Angle depends on impact position on paddle
    // Center = vertical; edges = angled reflection
  }
}
```

### 5.5 Input Handler (`inputHandler.js`)
**Purpose:** Captures and translates user input into game state changes.

**Input Handling:**
- **Keyboard (Arrow Keys):**
  - Left arrow → Set `paddle.vx = -paddleSpeed`
  - Right arrow → Set `paddle.vx = paddleSpeed`
  - Key release → Set `paddle.vx = 0`

- **Mouse/Pointer:**
  - Button clicks → Trigger menu actions (start, replay, return to menu)
  - Slider interaction → Update speed multiplier in real-time

**Key Methods:**
```javascript
class InputHandler {
  onKeyDown(event) { /* set paddle velocity */ }
  onKeyUp(event) { /* clear paddle velocity */ }
  onMouseClick(event) { /* route to menu handler */ }
  onSliderChange(value) { /* update speed multiplier */ }
}
```

### 5.6 Renderer (`renderer.js`)
**Purpose:** Draws all game objects on canvas and DOM.

**Rendering Targets:**
1. **Canvas Rendering** (game objects)
   - Bricks (rectangles, solid colors or patterns)
   - Ball (circle)
   - Paddle (rectangle)
   - Background

2. **DOM Rendering** (UI)
   - Lives counter
   - Speed indicator
   - Menu/buttons

**Key Methods:**
```javascript
class Renderer {
  draw(gameState) {
    // Clear canvas
    // Draw background
    // Draw bricks
    // Draw ball
    // Draw paddle
    // Render lives counter
    // Render phase-specific UI (menu, game-over, victory)
  }
  drawBrick(brick) { /* canvas.fillRect */ }
  drawBall(ball) { /* canvas.arc + fill */ }
  drawPaddle(paddle) { /* canvas.fillRect */ }
  renderMenu(state) { /* DOM manipulation */ }
  renderGameOver(won) { /* DOM manipulation */ }
}
```

### 5.7 Menu Controller (`menuController.js`)
**Purpose:** Manages navigation and settings across menu screens.

**Screens:**
- **Main Menu** → "Start" button, "Options" button
- **Options Screen** → Speed slider (0.5x to 2.0x), back button
- **Game Screen** → Displays lives counter, speed indicator
- **Victory Screen** → "Play Again", "Return to Menu"
- **Game Over Screen** → "Play Again", "Return to Menu"

**State Persistence:**
- Speed slider value persists in memory while menu is open
- Speed slider resets to default (1.0x) on new game session start
- *Future:* Store speed preference in localStorage

**Key Methods:**
```javascript
class MenuController {
  handleStartGame() { /* transition to playing */ }
  handleSliderChange(value) { /* update speed multiplier */ }
  handleReplay() { /* reset game state, return to playing */ }
  handleReturnToMenu() { /* return to main menu */ }
  render() { /* DOM + event listener setup */ }
}
```

### 5.8 Brick Factory (`brickFactory.js`)
**Purpose:** Creates initial brick layout and manages brick data.

**Layout:**
- 5 rows of bricks, evenly spaced
- Uniform size and spacing across all rows
- Fixed arrangement per game session

**Key Methods:**
```javascript
class BrickFactory {
  createInitialLayout() { /* return array of brick objects */ }
  
  // Brick object structure:
  // { id, x, y, width, height, color, isDestroyed }
}
```

## 6. Key Interfaces

### Game State → Renderer
```javascript
renderer.draw(gameState)
// gameState contains: { ball, paddle, bricks, lives, phase, speedMultiplier }
```

### Input Handler → Game State
```javascript
inputHandler.update(gameState)
// Updates: gameState.paddle.vx, gameState.speedMultiplier
```

### Physics → Game State
```javascript
physics.update(deltaTime, gameState)
// Updates: gameState.ball.x, gameState.ball.y, gameState.ball.vx, gameState.ball.vy
//          gameState.paddle.x
```

### Collision Detector → Game State
```javascript
collisionDetector.detectAndResolve(gameState)
// Modifies: gameState.ball.vx, gameState.ball.vy, gameState.bricks (removes), gameState.lives
// Returns: "ball-lost" | "brick-destroyed" | "paddle-bounce" | null
```

### Menu Controller → Game State
```javascript
menuController.handleAction(action, gameState)
// Actions: "start", "replay", "return-to-menu", "set-speed"
// Modifies: gameState.phase, gameState.speedMultiplier
```

## 7. Data Architecture

### Game State Schema
```javascript
{
  phase: "menu" | "playing" | "victory" | "gameover",
  lives: number (0-3),
  bricks: [
    { id, x, y, width, height, color }
  ],
  ball: {
    x: number,
    y: number,
    vx: number (velocity x),
    vy: number (velocity y),
    radius: number
  },
  paddle: {
    x: number (center),
    y: number,
    width: number,
    height: number,
    vx: number (velocity, for smooth movement)
  },
  speedMultiplier: number (0.5 - 2.0),
  isPaused: boolean,
}
```

### Brick Object
```javascript
{
  id: string | number,        // Unique identifier
  x: number,                  // Left edge
  y: number,                  // Top edge
  width: number,              // Brick width
  height: number,             // Brick height
  color: string,              // CSS color or hex
  isDestroyed: boolean,       // Marked for removal
}
```

### Collision Data
```javascript
{
  type: "floor" | "brick" | "paddle" | "wall" | "ceiling",
  object: brick | paddle | wall,
  impact: { x, y },           // Impact point
  side: "top" | "bottom" | "left" | "right", // Entry side
}
```

## 8. Security Architecture

**Data Validation:**
- Speed multiplier: Clamp to [0.5, 2.0] range
- Paddle bounds: Clamp X to [0, canvas.width - paddleWidth]
- Ball bounds: Detect floor collision (loss condition)

**Input Sanitization:**
- Keyboard input: Validate only arrow keys (left/right)
- Mouse input: Validate click targets (buttons, slider)
- No eval, innerHTML injection, or user code execution

**State Immutability:**
- Game state updates are unidirectional
- No direct manipulation of brick/ball data from renderer
- Collision resolver has sole authority to destroy bricks

## 9. Deployment Strategy

**Single-Page Application (SPA):**
- Single `index.html` with embedded canvas
- Inline `<script>` tags or separate `.js` files served together
- No build step required; vanilla JavaScript runs directly in browser

**File Structure:**
```
apps/breakout/
├── index.html
├── js/
│   ├── gameLoop.js
│   ├── gameState.js
│   ├── physics.js
│   ├── collisionDetector.js
│   ├── renderer.js
│   ├── inputHandler.js
│   ├── menuController.js
│   └── brickFactory.js
├── css/
│   └── styles.css
└── docs/
    ├── what/
    │   ├── product-spec.md
    │   └── epics/
    └── how/
        ├── architecture.md
        ├── c4/
        └── slices/
```

**Browser Compatibility:**
- Requires HTML5 Canvas, ES6 JavaScript, CSS3
- Works in Chrome, Firefox, Safari, Edge (current versions)
- No polyfills needed for vanilla ES6 features

## 10. Observability Strategy

**Logging (for debugging only, not production):**
- Log game phase transitions (menu → playing → victory)
- Log collision events (brick destroyed, ball lost, win condition)
- Log input events (paddle movement, speed adjustment)

**Performance Monitoring:**
- Measure frame time to detect stuttering or drops below 60 FPS
- Monitor memory usage for potential leaks during extended play

**Player Feedback:**
- Visual indicators: Lives counter, speed gauge, brick count
- Game-over screen: Clear win/loss message
- UI state: Buttons respond to hover/click (visual feedback)

## 11. Related C4 Views

- [System Context](../c4/system-context.md) *(to be generated)*
- [Containers](../c4/containers.md) *(to be generated)*
- [Components](../c4/components.md) *(to be generated)*
- [Deployment](../c4/deployment.md) *(to be generated)*

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

**Planned Slices:**
1. **Slice 1 — Game Loop & Renderer** (US-001: Game setup and display)
2. **Slice 2 — Ball Physics & Collision** (US-002: Ball physics and collision detection)
3. **Slice 3 — Paddle Control & Input** (US-003: Paddle control with arrow keys)
4. **Slice 4 — Lives & Game Over** (US-004: Lives system and game-over screen)
5. **Slice 5 — Victory & Menu Navigation** (US-005: Victory screen and menu)
6. **Slice 6 — Speed Control & Settings** (US-006: Speed slider and difficulty adjustment)

## 13. Technical Constraints

1. **No External Dependencies** — Game must use only vanilla HTML/CSS/ES6 JavaScript.
2. **Single Canvas Rendering** — All game visuals rendered on one `<canvas>` element.
3. **60 FPS Target** — Game loop must maintain consistent frame rate using `requestAnimationFrame`.
4. **Deterministic Physics** — Ball position must be predictable and not subject to floating-point errors (use fixed time step or careful delta-time handling).
5. **Single Collision Per Frame** — Only one collision is resolved per frame to prevent tunneling.
6. **Keyboard-Only Game Control** — Paddle controlled exclusively by arrow keys during gameplay.
7. **Mouse-Only Menu Control** — Menu navigation controlled exclusively by mouse/pointer clicks.
8. **No Audio in V1** — Sound effects and background music are out of scope.

## 14. Open Questions

1. **Ball Initial Speed** — What is the exact initial velocity magnitude (pixels/second) before speed multiplier?
2. **Paddle Speed** — What is the max paddle movement speed (pixels/second)?
3. **Brick Dimensions** — What are the exact width/height of each brick?
4. **Canvas Dimensions** — What are the playfield dimensions (width × height in pixels)?
5. **Ball Radius** — What is the exact ball radius (pixels)?
6. **Collision Detection Precision** — Should we use AABB only, or add swept-sphere detection for very fast balls?
7. **Frame Time Handling** — Should physics use fixed time step (e.g., 16.67ms per frame) or variable delta-time?
8. **Default Speed Multiplier** — Confirm default is 1.0x (medium speed).
9. **Speed Slider Persistence** — Should localStorage store speed preference across page reloads?
10. **Brick Color Pattern** — Should bricks follow a rainbow pattern (5 colors for 5 rows) or random colors?

---

**Status:** Architecture approved and ready for C4 diagrams and implementation slices.
