# Architecture — Breakout Game Engine

## 1. Architecture Principles

- **Vanilla JavaScript First** — No external dependencies; all functionality built with standard JavaScript, HTML, and CSS
- **Separation of Concerns** — Clear boundaries between game engine, physics, collision detection, input handling, rendering, and state management
- **Single Responsibility** — Each module owns one aspect of the game (e.g., physics engine handles motion only, collision system handles collisions only)
- **Predictable Physics** — Frame-based deterministic physics with constant velocity and discrete collision detection
- **Responsive Input** — Keyboard input processed every frame to ensure paddle control is never laggy
- **Observable State** — Game state changes are explicit; all mutations flow through a central state machine
- **Testable Components** — Core logic (physics, collisions) is decoupled from rendering to enable unit testing

## 2. System Overview

Breakout is a single-page vanilla JavaScript game running in the browser. The system comprises:

- **Game Loop** — Runs at fixed frame rate, driving all simulation and rendering
- **Game Engine** — Orchestrates initialization, state transitions, and lifecycle management
- **Physics Engine** — Simulates ball motion with constant velocity and wall/ceiling bouncing
- **Collision Detector** — Detects ball collisions with walls, ceiling, paddle, bricks, and bottom boundary
- **Input Handler** — Processes keyboard input (arrow keys) for paddle movement
- **Renderer** — Draws game board, bricks, paddle, ball, UI, and game states to canvas
- **State Machine** — Manages five game states (Menu, Active, Pause, Win, Loss) and transitions
- **Game State** — Holds lives, brick grid, ball position/velocity, paddle position, and speed setting

All components share immutable interface contracts; no component directly modifies another component's internal state.

## 3. Architectural Style

This is a **monolithic single-page application** using the **classic game loop architecture** with **layered separation**:

```
┌─────────────────────────────────────────┐
│           Game Loop (requestAnimFrame)  │
├─────────────────────────────────────────┤
│  State Machine   │  Input Handler       │
├─────────────────────────────────────────┤
│  Physics Engine  │  Collision Detector  │
├─────────────────────────────────────────┤
│           Renderer (Canvas)             │
├─────────────────────────────────────────┤
│    Shared Game State (Lives, Bricks)    │
└─────────────────────────────────────────┘
```

- **Presentation Layer** — Renderer converts game state to visual output
- **Logic Layer** — Physics, collision detection, state transitions
- **Input Layer** — Keyboard and UI event handlers
- **Data Layer** — Immutable game state object

## 4. Main Technical Boundaries

### Game Board (Canvas Container)
- Fixed dimensions (800×600px, configurable)
- Defines playable area with left, right, top boundaries
- Bottom boundary triggers life loss (no wall bounce)

### Ball Entity
- Position: (x, y) in pixels
- Velocity: (vx, vy) in pixels per frame
- Radius: 4px (fixed)
- Speed control: magnitude multiplier from slider (0.5x to 3x)

### Paddle Entity
- Position: x coordinate of left edge
- Fixed height: 10px
- Width: 80px (fixed)
- Confined to [0, canvas_width - paddle_width]
- Y position: canvas_height - 15px

### Brick Grid
- 5 rows × 8 columns = 40 bricks initially
- Each brick: 75×15px
- Positioned with 5px padding
- State: active/destroyed (boolean per brick)

### Game State Machine
```
Menu ←→ Active ←→ Pause (optional)
  ↓      ↓ ↑       ↓
Menu ← Win/Loss ← Active
```

- **Menu**: Show title, speed slider, start button
- **Active**: Run game loop, process input, simulate physics
- **Pause**: Freeze simulation, show resume/menu buttons
- **Win**: All bricks destroyed, show victory screen
- **Loss**: Lives = 0, show game over screen

## 5. Key Components

### 5.1 Game Engine (Orchestrator)
**Responsibility**: Initialization, state transitions, lifecycle management
- Creates canvas and 2D context
- Initializes all subsystems (physics, input, renderer)
- Manages game loop lifecycle (start, pause, resume, reset)
- Triggers state transitions
- Updates shared game state

**Interfaces**:
- `new GameEngine(canvas_element, config)`
- `start()` — begin active gameplay
- `pause()` — freeze simulation
- `resume()` — unpause simulation
- `reset()` — reset to menu state
- `updateState(gameState)` — merge state changes

### 5.2 Physics Engine
**Responsibility**: Update ball position, detect bounces
- Update ball position: `x += vx, y += vy` each frame
- Bounce off left/right walls: reverse `vx`
- Bounce off ceiling: reverse `vy`
- Bounce off paddle: reverse `vy`, adjust `vx` based on hit location
- Handle out-of-bounds (bottom): trigger life loss

**Interfaces**:
- `update(ball, paddle, bounds)` → updated ball
- `bounceWall(vx, vy, bounds)` → new velocity
- `bouncePaddle(vx, vy, ball, paddle)` → new velocity with angle adjustment
- `isOutOfBounds(y, bounds)` → boolean

### 5.3 Collision Detector
**Responsibility**: Detect collisions, identify brick destruction
- Detect ball-wall collisions
- Detect ball-ceiling collisions
- Detect ball-paddle collisions
- Detect ball-brick collisions
- Return collision info: type, surface normal, affected brick

**Interfaces**:
- `detectCollisions(ball, paddle, bricks, bounds)` → collision list
- `checkBallBrickCollision(ball, brick)` → collision info or null
- `checkBallPaddleCollision(ball, paddle)` → collision info or null
- `getBrickIndex(x, y)` → index or null

### 5.4 Input Handler
**Responsibility**: Capture keyboard input, apply to paddle
- Listen for keydown: ArrowLeft, ArrowRight
- Listen for keyup to stop movement
- Update paddle position based on input state
- Only process input when game is in Active state

**Interfaces**:
- `addListeners(callback)`
- `removeListeners()`
- `getInputState()` → {leftPressed, rightPressed}
- `updatePaddleFromInput(paddle, inputState, bounds)`

### 5.5 Renderer
**Responsibility**: Draw all game elements to canvas
- Draw game board background
- Draw paddle
- Draw ball
- Draw bricks (only active ones)
- Draw UI: lives counter, brick count, speed slider, state messages
- Handle state-specific rendering (Menu, Active, Win, Loss)

**Interfaces**:
- `render(gameState, gameMode)` — draw entire frame
- `clear()` — clear canvas
- `drawBoard()`
- `drawPaddle(paddle)`
- `drawBall(ball)`
- `drawBricks(bricks)`
- `drawUI(lives, brickCount, speed)`
- `drawMenu()`, `drawWin()`, `drawLoss()`

### 5.6 State Machine
**Responsibility**: Manage state transitions and validation
- Track current state (Menu, Active, Pause, Win, Loss)
- Define allowed transitions
- Execute transition logic (reset state, freeze physics, etc.)
- Detect win/loss conditions each frame

**Interfaces**:
- `getState()` → current state
- `transition(newState)` → boolean (success/failure)
- `canTransition(from, to)` → boolean
- `checkWinCondition(bricks)` → boolean
- `checkLossCondition(lives)` → boolean

### 5.7 Game State (Data Container)
**Responsibility**: Hold all game data in a single immutable object
```javascript
{
  lives: 3,
  bricks: [
    { x: 10, y: 20, width: 75, height: 15, active: true },
    // ... 39 more
  ],
  ball: { x: 400, y: 500, vx: 0, vy: 0, radius: 4 },
  paddle: { x: 360, width: 80, height: 10 },
  speed: 1.0, // 0.5x to 3x multiplier
  canvasWidth: 800,
  canvasHeight: 600
}
```

## 6. Key Interfaces

### Ball Position Update
```javascript
// Physics updates position each frame
ball.x += ball.vx
ball.y += ball.vy

// Collision system detects and reverses velocity
if (collidesWithWall) {
  ball.vx = -ball.vx
}
if (collidesWithCeiling) {
  ball.vy = -ball.vy
}
if (collidesWithPaddle) {
  ball.vy = -ball.vy
  // Adjust ball.vx based on paddle hit location
  const hitOffset = ball.x - paddle.x
  const offsetPercent = hitOffset / paddle.width
  ball.vx = (offsetPercent - 0.5) * maxAngle
}
if (collidesWithBrick) {
  brick.active = false
  ball.vy = -ball.vy
  // or ball.vx = -ball.vx depending on collision side
}
if (ball.y > canvasHeight) {
  lives--
  ball.x = paddle.x + paddle.width / 2
  ball.y = paddle.y - 20
  ball.vx = 0
  ball.vy = 0
}
```

### Speed Slider to Velocity Magnitude
```javascript
// Slider value: 0 (leftmost) to 100 (rightmost)
const sliderPercent = sliderValue / 100
const minMagnitude = 2 // pixels per frame
const maxMagnitude = 6
const magnitude = minMagnitude + (maxMagnitude - minMagnitude) * sliderPercent

// Apply to ball velocity
const angle = Math.atan2(ball.vy, ball.vx)
ball.vx = magnitude * Math.cos(angle)
ball.vy = magnitude * Math.sin(angle)
```

### State Transition Matrix
```
Menu + "Start" → Active (initialize ball velocity from speed slider)
Menu + "Quit" → Menu (no-op)
Active + "Pause" → Pause (freeze physics)
Pause + "Resume" → Active (unfreeze)
Pause + "Menu" → Menu (reset state)
Active + lives=0 → Loss (automatic)
Active + bricks=0 → Win (automatic)
Win + "PlayAgain" → Menu (reset state)
Loss + "TryAgain" → Menu (reset state)
```

### Collision Detection Contract
Collision detection returns structured info:
```javascript
{
  type: "wall" | "ceiling" | "paddle" | "brick" | "none",
  surface: "left" | "right" | "top" | "bottom",
  brickIndex: number | null, // if type === "brick"
  collision_x: number,
  collision_y: number
}
```

## 7. Data Architecture

### Game State Shape
```javascript
{
  mode: "Menu" | "Active" | "Pause" | "Win" | "Loss",
  lives: number,         // 0–3
  brickCount: number,    // 0–40
  bricks: Brick[],       // Array of 40 bricks
  ball: Ball,            // { x, y, vx, vy, radius }
  paddle: Paddle,        // { x, width, height }
  speed: number,         // 0.5–3.0 (multiplier)
  canvasWidth: number,
  canvasHeight: number,
  gameStartTime: number  // timestamp for diagnostics
}
```

### Persistence
- No persistent storage required for MVP (no high scores, saves)
- Speed slider value stored in memory only during session
- All state reset on "Play Again" or page reload

### Event Flow
```
User Input (arrow keys)
  ↓
Input Handler updates paddle position
  ↓
Physics Engine updates ball position
  ↓
Collision Detector detects collisions
  ↓
Game State updated (lives, bricks, ball, paddle)
  ↓
State Machine checks win/loss conditions
  ↓
Renderer draws updated state
  ↓
(next frame via requestAnimFrame)
```

## 8. Security Architecture

### Input Sanitization
- Keyboard events validated by event type (keydown, keyup)
- No user input stored in external systems
- Canvas rendering is deterministic (no XSS vectors)

### Scope Isolation
- All game logic scoped to canvas container
- No global variables polluting window scope
- Event listeners cleaned up on game reset

### Data Validation
- Speed slider clamped to [0, 100] range
- Paddle position clamped to canvas boundaries
- Ball velocity normalized to prevent overflow

## 9. Deployment Strategy

### Target Environment
- Modern browser with HTML5 Canvas API (no polyfills needed)
- ES6+ JavaScript support (arrow functions, const/let, destructuring)
- Single HTML file with embedded JavaScript and CSS

### Build Artifacts
- Single `index.html` with all CSS and JavaScript inlined or via `<script>` tags
- No build step required (vanilla JavaScript)
- Static file hosting compatible

### Performance Targets
- 60 FPS target (16.67ms per frame)
- Sub-1ms input latency (keyboard response)
- No jank or frame drops on modern hardware

## 10. Observability Strategy

### Console Logging
- Physics engine logs collision events (debug mode)
- State machine logs transitions (debug mode)
- Input handler logs key events (debug mode)

### Metrics
- Frame rate (FPS) counter (optional, on-screen)
- Bricks destroyed count (on-screen)
- Lives remaining (on-screen)
- Speed slider value (on-screen)

### Error Handling
- Canvas context availability check on init
- Graceful fallback if requestAnimFrame unavailable
- Input listener error handling (event handler exceptions caught)

### Debugging Aids
- Visual collision boxes toggle (debug mode)
- Physics state dump to console
- State machine transition log

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

## 13. Technical Constraints

1. **Vanilla JavaScript Only** — No npm packages, no transpilation, no build tools
2. **Canvas 2D API** — Only 2D rendering, no WebGL or 3D
3. **Fixed Frame Rate** — Assume 60 FPS, no time-delta calculations
4. **No Async Operations** — All physics and collisions synchronous within frame
5. **No Network I/O** — Game is entirely client-side
6. **No Audio** — Out of scope (product spec section 5)
7. **Keyboard Input Only** — Arrow keys for paddle, mouse for UI (no touch)

## 14. Open Questions

1. **Exact Brick Grid Layout** — Confirmed: 5 rows × 8 columns (40 bricks), 75×15px, 5px padding
2. **Ball Speed Range** — Slider range 0.5x to 3x multiplier on base magnitude (2–6 px/frame)
3. **Paddle Size** — Fixed at 80×10px (not adjustable)
4. **Paddle Angle Variation** — Yes, hit location affects horizontal velocity; center = straight up, edges = 45° angles
5. **Life Loss Animation** — Immediate ball reset; no delay or fade animation (keep simple)
6. **Visual Styling** — Classic arcade colors (paddle blue, bricks red, ball white, bg dark)
7. **Pause Button** — Included in Active state with spacebar or button UI
8. **Collision Overlap Prevention** — No tunneling; use discrete collision detection with velocity clamping

**Resolved**: All questions from product-spec.md are addressed by this architecture.
