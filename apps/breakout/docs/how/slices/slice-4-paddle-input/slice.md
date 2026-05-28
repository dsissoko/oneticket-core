# Slice 4 — Paddle Input and Movement

## Goal

Enable responsive keyboard-driven paddle control through real-time event listening and frame-based position updates. This slice implements the complete input-to-output flow: keyboard events → player state (paddleDirection) → position calculation → screen boundary enforcement, allowing the player to control the paddle within canvas bounds during gameplay.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-003 — Contrôle de la Raquette avec les Flèches](../../what/epics/epic-0-mvp/user-stories/us-003-paddle-control.md)

## Impacted Components

From `architecture.md`:
- **Input Handler** — Keyboard event listeners (ArrowLeft, ArrowRight), state management for paddle direction
- **Game Engine** — Update loop integration for position calculations
- **Physics Engine** — Boundary collision detection and position clamping
- **Rendering** — Canvas updates reflecting paddle position each frame

## Interfaces

### Input Events
1. **Keyboard — keydown event**
   - Key: `ArrowLeft` → set `paddleDirection = -1`
   - Key: `ArrowRight` → set `paddleDirection = +1`

2. **Keyboard — keyup event**
   - Key: `ArrowLeft` or `ArrowRight` released → set `paddleDirection = 0`

### State Changes
```javascript
// Player input state
{
  paddleDirection: -1 | 0 | +1  // -1: left, 0: neutral, +1: right
}
```

### Output (Game Loop Integration)
```javascript
// Updated paddle position (read from game state after update)
{
  paddle: {
    x: number,           // clamped to [0, canvasWidth - paddleWidth]
    y: number,          // unchanged from initialization
    width: number,      // unchanged
    height: number      // unchanged
  }
}
```

### Data Contracts
- **paddleSpeed** (pixels/second): Configurable constant (recommend 400–600 px/s for responsive feel)
- **canvasWidth**: From game state (established in Slice 1)
- **paddleWidth**: From paddle object in game state (established in Slice 1)

## Data Changes

### New Game State Fields
```javascript
{
  // NEW: Paddle movement state
  paddleDirection: 0,      // -1, 0, or +1 (left, neutral, right)
  paddleSpeed: 500,        // pixels/second (configurable)
  
  // EXISTING: Paddle position (modified by this slice)
  paddle: {
    x: number,             // will be updated each frame
    y: number,            // unchanged
    width: number,        // unchanged
    height: number        // unchanged
  }
}
```

### No Data Migrations
- This slice adds no persistent data or schema changes
- State is transient within the game loop

## Sequence Flow

### 1. Page Load & Event Registration
- JavaScript initializes
- Attach `keydown` event listener to document/window
- Attach `keyup` event listener to document/window
- Log: "Keyboard input handlers registered"

### 2. Player Presses ArrowLeft
- `keydown` event fires with `event.key === "ArrowLeft"`
- Handler sets `gameState.paddleDirection = -1`
- No immediate position change (deferred to update phase)

### 3. Player Presses ArrowRight
- `keydown` event fires with `event.key === "ArrowRight"`
- Handler sets `gameState.paddleDirection = +1`
- No immediate position change (deferred to update phase)

### 4. Player Releases Arrow Key
- `keyup` event fires with `event.key === "ArrowLeft"` or `"ArrowRight"`
- Handler sets `gameState.paddleDirection = 0` (neutral)
- Paddle will no longer accelerate in the next frame

### 5. Game Loop — Update Phase (Each Frame)
- Game engine calls `update(deltaTime)`
- Input handler or game engine reads `paddleDirection` from state
- Calculate new paddle position:
  ```
  newX = paddle.x + (paddleDirection * paddleSpeed * deltaTime)
  ```
- Clamp position to screen boundaries:
  ```
  paddle.x = Math.max(0, Math.min(newX, canvasWidth - paddle.width))
  ```
- Update `gameState.paddle.x` with clamped position

### 6. Game Loop — Render Phase (Each Frame)
- Game engine calls `render(canvas)`
- Render paddle at new `paddle.x` position
- All subsequent collision checks in next frame use updated position

### 7. Rapid Direction Changes (Scenario 3)
- Player holds ArrowLeft: `paddleDirection = -1`, paddle moves left
- Player quickly releases ArrowLeft and presses ArrowRight:
  - `keyup(ArrowLeft)` → `paddleDirection = 0` (momentary pause)
  - `keydown(ArrowRight)` → `paddleDirection = +1` (immediate direction change)
  - Next frame: paddle velocity reverses and moves right immediately
  - **No lag**: Direction changes within single frame cycle

### 8. Collision Handling During Movement (Scenario 4)
- Paddle moves due to `paddleDirection`
- Ball collides with moving paddle
- Collision response (Slice 2) calculates bounce trajectory using paddle velocity
- Paddle continues responding to keyboard input without interruption

## Observability Impact

### Logging
Add development-mode console logging:
```javascript
// On input registration
console.log('Keyboard listeners attached for paddle control');

// On direction change
console.log('Paddle direction changed:', paddleDirection);  // -1, 0, or 1

// On position update (sample every N frames to avoid spam)
console.log('Paddle position:', paddle.x, 'clamped to bounds');

// On boundary collision
console.log('Paddle clamped at boundary:', paddle.x === 0 ? 'left' : 'right');
```

### Metrics
- **Input latency**: Time from keydown event to paddle movement on-screen
  - Target: <16ms (within single frame at 60 FPS)
- **Frame-to-frame position delta**: Should be smooth and proportional to `paddleDirection * paddleSpeed * deltaTime`

### Error Handling
```javascript
// Graceful degradation if keyboard events fail
try {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
} catch (e) {
  console.error('Failed to register keyboard listeners:', e);
  // Game continues without paddle control (fail-safe)
}

// Validate state before position update
if (typeof paddleDirection !== 'number' || paddleDirection < -1 || paddleDirection > 1) {
  console.warn('Invalid paddleDirection, resetting to 0');
  paddleDirection = 0;
}
```

## Acceptance Criteria (from US-003)

### Scenario 1: Player Moves Paddle Left ✅
- **Given:** Game in PLAYING state, paddle at center, keyboard ready
- **When:** Player presses and holds ArrowLeft
- **Then:** Paddle moves smoothly to the left
- **And:** Paddle stops at left boundary (x = 0)

**Implementation check:**
- `keydown('ArrowLeft')` → `paddleDirection = -1`
- Each frame: `newX = paddle.x - (paddleSpeed * deltaTime)`
- Clamped: `x = Math.max(0, newX)`
- Render reflects new position each frame

### Scenario 2: Player Moves Paddle Right ✅
- **Given:** Game in PLAYING state, paddle at center, keyboard ready
- **When:** Player presses and holds ArrowRight
- **Then:** Paddle moves smoothly to the right
- **And:** Paddle stops at right boundary (x = canvasWidth - paddleWidth)

**Implementation check:**
- `keydown('ArrowRight')` → `paddleDirection = +1`
- Each frame: `newX = paddle.x + (paddleSpeed * deltaTime)`
- Clamped: `x = Math.min(newX, canvasWidth - paddle.width)`
- Render reflects new position each frame

### Scenario 3: Rapid Direction Changes ✅
- **Given:** Game in PLAYING state, paddle moving left
- **When:** Player quickly releases ArrowLeft and presses ArrowRight
- **Then:** Paddle immediately changes direction and moves right
- **And:** No visible lag or delay

**Implementation check:**
- Tight coupling: `keyup` → `keydown` within same event tick
- `paddleDirection` updates immediately (not buffered)
- Next frame uses new direction value
- Frame time <16ms ensures perception of immediacy

### Scenario 4: Paddle Movement ≠ Collision Interference ✅
- **Given:** Game in PLAYING state, ball in motion, paddle moving
- **When:** Ball collides with paddle
- **Then:** Ball bounces correctly off paddle
- **And:** Paddle continues responding to keyboard input

**Implementation check:**
- Collision detection (Slice 2) reads current `paddle.x`
- Bounce calculation considers paddle velocity (optional: can enhance with paddle.dx if implemented)
- Paddle input handler operates independently of collision logic
- No state locking during collision

## Technical Notes

### Paddle Speed Configuration
Recommended range: **400–600 pixels/second**
- 400 px/s: Slower, more deliberate (casual gameplay)
- 500 px/s: Default, balanced (standard arcade feel)
- 600 px/s: Faster, snappier (expert/high difficulty)

At canvas width 800px and paddle width 100px:
- Time to cross screen at 500 px/s: ~1.4 seconds (reasonable range of motion)

### Event Handler Pattern
```javascript
function onKeyDown(event) {
  if (gameState.state !== 'PLAYING') return;  // Only during gameplay
  
  if (event.key === 'ArrowLeft') {
    gameState.paddleDirection = -1;
    event.preventDefault();  // Prevent browser scroll
  } else if (event.key === 'ArrowRight') {
    gameState.paddleDirection = +1;
    event.preventDefault();
  }
}

function onKeyUp(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    gameState.paddleDirection = 0;
    event.preventDefault();
  }
}
```

### Boundary Clamping
```javascript
function updatePaddlePosition(deltaTime) {
  const newX = gameState.paddle.x + 
               (gameState.paddleDirection * gameState.paddleSpeed * deltaTime);
  
  gameState.paddle.x = Math.max(
    0,
    Math.min(newX, gameState.canvasWidth - gameState.paddle.width)
  );
}
```

### Non-Blocking Input
- Events fire asynchronously; game loop continues running
- No `while` loops waiting for input (async/await not needed)
- Input state read during update phase, not during event handling

## Dependencies and Ordering

**This slice depends on:**
- Slice 1 — Game Setup (canvas, initial game state, paddle/brick/ball objects)
- Architecture documentation (paddle dimensions, canvas bounds)

**This slice enables:**
- Slice 5 — Game State Machine and Menus (menu navigation with keyboard, optional)
- Slice 2 — Ball Physics (paddle velocity can influence ball bounce trajectory)
- Full gameplay flow: input → physics → collision → rendering

**Sequence constraint:**
- Must be implemented after Slice 1 (requires initialized paddle object)
- Can be implemented in parallel with Slice 2 (ball physics) — no direct dependency
- Should complete before Slice 5 (game state transitions benefit from input infrastructure)

## Implementation Checklist

- [ ] Add `paddleDirection` (default 0) to game state
- [ ] Add `paddleSpeed` (default 500) to game state or constants
- [ ] Register `keydown` listener on document/window
- [ ] Register `keyup` listener on document/window
- [ ] Implement `onKeyDown` handler (ArrowLeft → -1, ArrowRight → +1)
- [ ] Implement `onKeyUp` handler (any arrow → 0)
- [ ] Implement `updatePaddlePosition(deltaTime)` in game engine
- [ ] Call `updatePaddlePosition` during game loop update phase
- [ ] Add boundary clamping math (Math.max, Math.min)
- [ ] Test rapid key presses and releases
- [ ] Verify paddle stays within bounds in all scenarios
- [ ] Test with different `paddleSpeed` values for feel
- [ ] Add console logs for development debugging
- [ ] Manual test: keyboard responsiveness (no lag)
- [ ] Manual test: paddle does not exit canvas
