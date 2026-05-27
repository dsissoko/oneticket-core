# Architecture — Breakout Game

## 1. Architecture Principles

1. **Zero Dependencies** — Pure vanilla JavaScript, HTML5, CSS3 with no external npm packages or frameworks
2. **Separation of Concerns** — Clear boundary between game logic (Model), rendering (View), and input handling (Controller)
3. **Performance-First** — Optimized for modern browsers using `requestAnimationFrame` for 60 FPS gameplay
4. **Extensibility** — Modular component structure allows future additions (levels, bonuses, scores persistence)
5. **Simplicity** — Direct DOM manipulation or Canvas rendering without abstraction layers
6. **Deterministic Physics** — Predictable collision detection and ball physics for fair gameplay

## 2. System Overview

**Breakout** is a pure client-side arcade game running entirely in the browser. The application consists of:

- A **Game Engine** managing the main update loop and state transitions
- A **Renderer** displaying game objects and UI states (menu, gameplay, win/lose screens)
- A **Physics Engine** calculating ball movement, collision detection, and rebounding
- An **Input Handler** capturing keyboard and mouse events for player control
- A **State Manager** tracking game state, lives, brick count, and speed settings
- A **Menu System** providing speed selection and navigation between game states

**No external APIs are called**. All game data, logic, and rendering is self-contained.

## 3. Architectural Style

**Model-View-Controller (MVC) adapted for Vanilla JS Game Development**

```
┌─────────────────────────────────────┐
│           INPUT HANDLER             │
│  (Keyboard/Mouse Event Listeners)   │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌─────────────┐
        │   STATE     │
        │  MANAGER    │
        │ (Game State)│
        └──────┬──────┘
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
 ┌────────┐ ┌────────┐ ┌────────────┐
 │ GAME   │ │PHYSICS│ │  RENDERER  │
 │ENGINE  │ │ENGINE │ │(Canvas/DOM)│
 │(Loop)  │ │(Logic)│ │            │
 └────────┘ └────────┘ └────────────┘
```

### Layers:

1. **Model (State Manager + Game Engine)**
   - Maintains game state: `gameState`, `lives`, `score`, `speed`
   - Manages game objects: Ball, Paddle, Bricks, Walls
   - Applies physics and collision resolution
   - Enforces game rules

2. **View (Renderer)**
   - Draws game objects to canvas (ball, paddle, bricks, walls)
   - Renders UI overlays (HUD, menus, win/lose screens)
   - Responds to state changes by re-rendering

3. **Controller (Input Handler)**
   - Listens to keyboard (arrow keys) and mouse events
   - Updates input state (pressed keys)
   - Provides input data to the game engine

## 4. Main Technical Boundaries

### Game Objects (Entities)

| Component | Responsibility | Properties |
|-----------|-----------------|------------|
| **Ball** | Physics body that bounces | x, y, vx, vy, radius, speed |
| **Paddle** | Player-controlled racket | x, y, width, height, velocity |
| **Brick** | Destructible obstacle | x, y, width, height, destroyed |
| **Wall** | Collision boundaries | x, y, width, height (implicit) |

### System Boundaries

| Boundary | Description |
|----------|-------------|
| **Game Engine Loop** | Orchestrates update → physics → collision → render cycle every frame |
| **Physics Simulator** | Updates positions based on velocity; applies gravity (none in Breakout); handles rebounding |
| **Collision System** | AABB (Axis-Aligned Bounding Box) detection; resolves collisions and applies response (bounce) |
| **Input Subsystem** | Converts keyboard/mouse events into actionable commands (move paddle left/right) |
| **Renderer** | Converts game state into visual representation on Canvas or DOM |
| **Menu System** | Manages screen states and transitions (title → speed menu → game → win/lose) |

## 5. Key Components

### 5.1 Game Engine (`gameEngine.js`)

**Responsibility**: Main update loop and state orchestration.

**Key Methods:**
- `update(deltaTime)` — Updates all game objects and checks game conditions
- `render()` — Triggers renderer to draw current state
- `loop(timestamp)` — Main animation frame callback
- `start()` — Initializes a new game
- `reset()` — Resets state for a new match

**State Machine:**
```
menu → playing → won/lost → menu
```

### 5.2 Physics Engine (`physics.js`)

**Responsibility**: Ball movement and collision detection.

**Key Methods:**
- `updateBall(ball, deltaTime)` — Updates ball position based on velocity
- `detectCollisions(ball, paddle, bricks, walls)` — Returns list of collided objects
- `resolveBallCollision(ball, object)` — Handles bounce/deflection
- `checkBallOutOfBounds(ball)` — Detects if ball has exited bottom of screen

**Collision Response Logic:**
- **Ball ↔ Walls**: Invert `vx` (left/right walls) or `vy` (ceiling)
- **Ball ↔ Paddle**: Invert `vy`; optionally adjust angle based on hit position
- **Ball ↔ Brick**: Invert `vx` or `vy` depending on collision side; mark brick as destroyed
- **Ball ↔ Bottom**: Out of bounds → lose life; reset ball position

### 5.3 Renderer (`renderer.js`)

**Responsibility**: Visual representation of game state.

**Rendering Targets:**
- Canvas element (primary) or DOM (fallback)
- Draws game objects (rectangles/circles for ball, paddle, bricks)
- Renders HUD (lives counter, brick count)
- Overlays menu screens (speed selector, win/lose screens)

**Key Methods:**
- `render(gameState, gameObjects)` — Main render function
- `drawGameboard(ball, paddle, bricks, walls)` — Draws playfield
- `drawMenu(currentSpeed)` — Draws speed selection menu
- `drawGameOverScreen()` — Draws loss screen
- `drawWinScreen()` — Draws victory screen

### 5.4 Input Handler (`input.js`)

**Responsibility**: Keyboard and mouse event capturing.

**Key Methods:**
- `handleKeyDown(event)` — Sets pressed key in state
- `handleKeyUp(event)` — Clears key from state
- `handleMouseClick(event)` — Routes click to appropriate handler
- `getPaddleInput()` — Returns current paddle movement direction (-1, 0, or 1)

**Tracked Input:**
- `ArrowLeft` / `ArrowRight` — Paddle movement
- `Enter` → Start game / Select menu option
- Mouse clicks → Speed selection, "Play" button

### 5.5 State Manager (`state.js`)

**Responsibility**: Game state and configuration storage.

**State Shape:**
```javascript
{
  gameState: "menu" | "playing" | "won" | "lost",
  lives: number,
  bricksDestroyed: number,
  speedLevel: number (0-4),
  speedMultiplier: 0.5 | 0.75 | 1.0 | 1.5 | 2.0,
  paddle: { x, y, width, height },
  ball: { x, y, vx, vy, radius },
  bricks: [{ x, y, destroyed: boolean }, ...],
  walls: { top, left, right, bottom }
}
```

**Key Methods:**
- `getState()` — Returns current state
- `setState(partial)` — Merges updates into state
- `resetGame()` — Initializes fresh game state
- `setSpeed(level)` — Updates speed multiplier

### 5.6 Menu System (`menu.js`)

**Responsibility**: Navigation between game screens.

**Screens:**
1. **Title Screen** — "Play" button → Speed Menu
2. **Speed Menu** — Select ball speed (5 levels) → Game Start
3. **Game Board** — Playfield with HUD
4. **Win Screen** — Victory message + "Play Again"
5. **Lose Screen** — Game Over message + "Play Again"

**Transitions:**
- Speed Menu → "Play" → Game Board
- Game Board → Win/Lose → Win/Lose Screen
- Win/Lose Screen → "Play Again" → Speed Menu

## 6. Key Interfaces

### Interface: Ball Collision Response

```javascript
// Input
{
  ball: { x, y, vx, vy, radius },
  obstacle: { x, y, width, height, type: "wall" | "paddle" | "brick" }
}

// Output (modified ball or destruction flag)
{
  ball: { x, y, vx: -vx, vy: -vy | vy, ... },
  destroyed: false | true
}
```

### Interface: Input to Paddle Movement

```javascript
// Input
{
  inputX: -1 | 0 | 1  // -1 = left, 0 = no input, 1 = right
}

// Output (paddle position update)
{
  paddle: { x: newX, y, width, height }
}
```

### Interface: Game State to Renderer

```javascript
// Input
{
  gameState: "menu" | "playing" | "won" | "lost",
  lives: number,
  bricksDestroyed: number,
  ball: { x, y, radius },
  paddle: { x, y, width, height },
  bricks: [{ x, y, destroyed: boolean }, ...],
  speedLevel: number
}

// Output: Canvas/DOM rendering (visual only)
```

## 7. Data Architecture

### Game Object Storage

All game objects are stored in memory during gameplay:

- **Ball**: Single instance `{ x, y, vx, vy, radius }`
- **Paddle**: Single instance `{ x, y, width, height }`
- **Bricks**: Array of 50 objects `[{ x, y, width, height, destroyed }, ...]`
- **Walls**: Implicit boundaries (screen dimensions)

### Persistence

**Default**: No persistence. Game state is lost on page reload.

**Future Option**: localStorage could store:
- High score
- Last selected speed
- Settings preferences

### Performance Considerations

- Brick array (50 elements) is pre-allocated at game start
- Destroyed bricks are marked with `destroyed: true` flag rather than removed from array (cheaper than splice)
- Collision detection iterates only non-destroyed bricks

## 8. Security Architecture

**Scope**: Single-player, client-only game with no backend.

**No Security Concerns:**
- No user authentication
- No data transmission
- No external API calls
- No SQL/database access
- No user data storage

**Future Considerations** (if leaderboard added):
- Validate score calculations client-side before submission
- Add CORS headers if backend is introduced

## 9. Deployment Strategy

### Deployment Units

- Single HTML file (`index.html`)
- Single JavaScript bundle (or separate modules imported via `<script>`)
- Single CSS stylesheet (`styles.css`)

### Browser Requirements

- ES6+ JavaScript support (arrow functions, const/let, template literals)
- Canvas API (requestAnimationFrame)
- Modern CSS3 (flexbox, grid)

### Target Platforms

- Desktop browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers: Chrome, Safari (lowest priority; not optimized for touch)

### Deployment Method

Static file hosting (GitHub Pages, Netlify, Vercel, or simple HTTP server):

```
GET /index.html → HTML
GET /src/main.js → JavaScript
GET /src/styles.css → CSS
```

No build step required (pure vanilla JS).

## 10. Observability Strategy

### Logging

**Debug Level** (console.log):
- Frame rate and deltaTime
- Ball position and velocity
- Collision events
- State transitions

**Error Level** (console.error):
- Canvas initialization failures
- Missing DOM elements
- Null reference exceptions

### Monitoring

**Browser Console:**
- Check for JavaScript errors
- Monitor frame rate (FPS) in DevTools Performance tab

**Future Enhancements:**
- Send error events to external logging service (optional)
- Record gameplay metrics (average game duration, win rate) if leaderboard is added

### Performance Metrics

- **Frame Rate**: Target 60 FPS; measure with `requestAnimationFrame` timestamps
- **Collision Detection Time**: O(n) where n = 50 bricks; acceptable for MVP
- **Render Time**: Measure Canvas draw calls; target < 16ms per frame

## 11. Related C4 Views

- [System Context Diagram](../c4/system-context.md)
- [Container Diagram](../c4/containers.md)
- [Component Diagram](../c4/components.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for vertical implementation slices derived from this architecture.

## 13. Technical Constraints

| Constraint | Rationale | Impact |
|-----------|-----------|--------|
| Zero npm dependencies | Keep application lightweight; avoid build complexity | Limited to vanilla JS; no external libraries |
| Canvas or DOM rendering | Support older browsers; avoid WebGL complexity | CPU rendering; acceptable for 2D game |
| Single-threaded execution | Simplify state management; avoid race conditions | Main game loop blocked by long operations |
| AABB collision detection | Simple, fast, sufficient for rectangular objects | Cannot handle rotated rectangles or complex shapes |
| No persistent storage | MVP scope; reduce complexity | Scores and settings lost on page reload |
| 50-brick limit (5×10 grid) | Manage collision detection performance | Fixed difficulty; extensible to dynamic grids |

## 14. Open Questions

1. **Canvas vs DOM Rendering** — Should we use HTML5 Canvas (recommended for performance) or DOM manipulation (simpler)?
   - **Recommendation**: Canvas for consistent 60 FPS performance.

2. **Speed Configuration Persistence** — Should the last selected speed be remembered across browser sessions?
   - **Recommendation**: Implement localStorage read/write for better UX.

3. **Paddle Collision Angle** — Should ball angle change based on where it hits the paddle (center vs. edge)?
   - **Recommendation**: Simple Y-inversion for MVP; consider angle modulation as future enhancement.

4. **Collision Tunneling** — How to prevent the ball from "tunneling" through thin bricks or the paddle?
   - **Recommendation**: Use frame-by-frame AABB with `dt`-scaled movement; or implement swept circle-rectangle tests.

5. **Mobile Touch Support** — Should we add touch controls for paddle movement on mobile?
   - **Recommendation**: Out of scope for MVP; consider for v1.1 if platform is important.

6. **Pause Feature** — Should the game support a pause state during gameplay?
   - **Recommendation**: Out of scope for MVP; add if user testing shows demand.

7. **Sound/Music** — Should we add audio feedback for collisions or background music?
   - **Recommendation**: Out of scope for MVP; no audio subsystem designed.

8. **Visual Theme** — What color scheme and sprite style should we use?
   - **Recommendation**: Retro arcade palette (neon colors on dark background) or classic arcade cabinet look.
