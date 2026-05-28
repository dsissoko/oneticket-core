# Slice 5 — Game States and Life Management

## Goal

Implement a complete game state machine managing four states (MENU, PLAYING, VICTORY, DEFEAT) with integrated life management system. This slice covers state transitions, life initialization, decrement logic on ball loss, display of remaining lives in the HUD, and victory/defeat condition detection with screen transitions.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-005 — Life Management and Game Over States](../../what/epics/epic-0-mvp/user-stories/us-005-lives-and-gameover.md)

## Impacted Components

From `architecture.md`:

- **Game State Manager** — Responsible for state storage, transitions, and lifecycle management
- **Game Engine** — Responsible for triggering life loss detection and state transitions
- **Physics Engine** — Detects when ball falls below paddle (boundary condition)
- **Menu UI** — Renders Game Over and Victory screens with appropriate buttons
- **Game Loop** — Conditional execution based on state (PLAYING vs other states)

## Interfaces

### Game State Container

```javascript
{
  state: 'MENU' | 'PLAYING' | 'VICTORY' | 'DEFEAT',
  lives: number,        // Current remaining lives (0-3)
  ballSpeed: number,    // Pixels per second (from settings)
  bricks: Array,        // Remaining brick objects
  ball: Object,         // Ball position, velocity, radius
  paddle: Object,       // Paddle position, width, height
}
```

### State Manager Interface

```javascript
// State query
getState() → string            // Returns current state name

// State transitions
setState(newState: string) → void
  // Valid transitions:
  // MENU → PLAYING
  // PLAYING → VICTORY
  // PLAYING → DEFEAT
  // VICTORY/DEFEAT → MENU

// Life management
initializeLives() → void       // Set lives to 3
decrementLife() → void         // Reduce lives by 1, trigger state transition if lives === 0
getLives() → number            // Return current life count

// Game reset
resetGame() → void             // Clear all state, return to initial PLAYING setup
```

### Event Emissions (for UI Updates)

```javascript
// Events triggered by state changes:
- 'stateChanged' { newState, previousState }
- 'lifeDecremented' { remainingLives }
- 'ballReset' { position }
```

## Data Changes

### Game State Additions

- `state` field: Added to track 4-state FSM (MENU, PLAYING, VICTORY, DEFEAT)
- `lives` field: Added, initialized to 3, decremented on ball loss
- `initialLives`: Constant, set to 3 per product spec

### Stored Entities

No database changes — all state is in-memory.

### Defaults at Game Start

```javascript
{
  state: 'PLAYING',
  lives: 3,
  ballSpeed: 300,           // pixels/second (configurable via settings)
  bricks: createBrickWall(), // 5 rows
  ball: { x: centerX, y: 50, vx: 0, vy: 150, radius: 8 },
  paddle: { x: centerX - 40, y: gameHeight - 20, width: 80, height: 10 }
}
```

## Sequence Flow

### A. Game Initialization (Start of Session)

```
1. Load HTML/CSS
2. Initialize canvas and dimensions
3. Set gameState.state = 'MENU'
4. Render main menu (Start, Settings, Quit buttons)
5. Wait for user input
```

### B. Transition: MENU → PLAYING (User Clicks Start)

```
1. User clicks "Start" button in menu
2. Hide menu UI
3. Initialize game state:
   - gameState.state = 'PLAYING'
   - gameState.lives = 3
   - gameState.bricks = createBrickWall() [5 rows, 12 bricks/row]
   - gameState.ball = { x: centerX, y: 50, vx: 0, vy: 150, radius: 8 }
   - gameState.paddle = { x: centerX - 40, y: gameHeight - 20 }
4. Start game loop at 60 FPS
5. Render canvas with game elements
6. Render HUD: "Lives: 3", brick count
```

### C. Core Gameplay Loop (PLAYING State)

```
Each frame (60 FPS):
  1. physics.updateBall(deltaTime)
  2. physics.detectCollisions()
  3. Handle brick collisions → destroy bricks
  4. Handle paddle collision → bounce ball
  5. Handle wall/ceiling collisions → bounce ball
  
  6. CHECK: Is ball below paddle?
     YES → Life Loss Sequence (see below)
     NO  → Continue
  
  7. CHECK: Remaining bricks > 0?
     NO  → Transition to VICTORY (see below)
     YES → Continue
  
  8. Render canvas with current state
  9. Render HUD: "Lives: X", remaining brick count
```

### D. Life Loss Sequence (Ball Falls Below Paddle)

```
TRIGGER: ball.y > gameHeight + ball.radius (ball below bottom edge)

1. Decrement life count:
   gameState.lives -= 1
   
2. Reset ball position:
   gameState.ball = { x: centerX, y: 50, vx: 0, vy: 150 }
   
3. Reset paddle position:
   gameState.paddle.x = centerX - 40  // center
   
4. Update HUD immediately (lives: X)
   
5. Check life condition:
   IF gameState.lives === 0:
     → Transition to DEFEAT (see below)
   ELSE:
     → Resume PLAYING state, continue loop
```

### E. Transition: PLAYING → VICTORY (All Bricks Destroyed)

```
TRIGGER: gameState.bricks.length === 0 (after any collision or check in loop)

1. Stop game loop
2. gameState.state = 'VICTORY'
3. Render Victory screen:
   - Title: "VICTORY!"
   - Brick count: "0/60"
   - Buttons: "Replay", "Quit"
4. Wait for user input
```

### F. Transition: PLAYING → DEFEAT (Lives Exhausted)

```
TRIGGER: gameState.lives === 0 (after life decrement)

1. Stop game loop
2. gameState.state = 'DEFEAT'
3. Render Game Over screen:
   - Title: "GAME OVER"
   - Final life count: "0"
   - Buttons: "Replay", "Quit"
4. Wait for user input
```

### G. Transition: VICTORY/DEFEAT → MENU (User Clicks Replay or Quit)

```
IF user clicks "Replay":
  1. Reset full game state:
     - gameState.state = 'PLAYING'
     - gameState.lives = 3
     - gameState.bricks = createBrickWall()
     - gameState.ball = reset to start
     - gameState.paddle = reset to center
  2. Hide victory/defeat screen
  3. Resume game loop
  
IF user clicks "Quit":
  1. gameState.state = 'MENU'
  2. Hide victory/defeat screen
  3. Clear all game state
  4. Render main menu
  5. Stop game loop
```

## Observability Impact

### Logging Points

For development debugging (remove in production):

```javascript
// State transitions
console.log(`[STATE] Transitioned from ${previousState} to ${newState}`)

// Life events
console.log(`[LIFE] Lost a life. Remaining: ${gameState.lives}`)
console.log(`[LIFE] Ball reset to (${centerX}, 50)`)

// Game conditions
console.log(`[GAME] Victory condition met: 0 bricks remaining`)
console.log(`[GAME] Defeat condition met: 0 lives remaining`)

// HUD updates
console.log(`[HUD] Lives display updated to: ${gameState.lives}`)
```

### Metrics/Instrumentation (for V2)

- Time spent in PLAYING state (session duration)
- Number of lives lost per session
- Average frames until victory/defeat
- State transition counts per session

### Error Conditions to Monitor

- Invalid state transitions (should never occur)
- Lives counter going negative (should never occur)
- Ball y-position calculation errors (rapid fluctuations)
- Brick array corruption during destruction

## Testing Strategy

### Unit Tests

- Life decrement: `lives = 3` → `lives = 2` after loss
- State transitions: Verify valid transition paths
- Reset: After loss, ball/paddle return to correct positions
- Victory detection: When `bricks.length === 0`, state transitions to VICTORY
- Defeat detection: When `lives === 0`, state transitions to DEFEAT

### Integration Tests

- Full session: Menu → Playing → Life Loss → Replay → Menu
- Complete game: Menu → Playing → All bricks destroyed → Victory screen → Quit → Menu
- Game over: Menu → Playing → 3 life losses → Defeat screen → Replay → Playing

### Manual Testing

- Verify HUD updates display correctly and immediately
- Check ball/paddle reset positions visually
- Confirm screen transitions (victory/defeat) render properly
- Test Replay button resets game cleanly
- Test Quit button returns to main menu

---

## Acceptance Criteria Mapping

This slice fully implements the acceptance criteria from US-005:

✅ **Feature: Life Display and Management**
- Life counter initialized to 3 → `setState('PLAYING')` initializes `lives = 3`
- Life counter visible in HUD → HUD renders `Lives: ${lives}`
- Life counter decrements → `decrementLife()` reduces by 1
- Ball/paddle reset after loss → Both reset to initial positions
- Game continues after loss (unless lives = 0) → Loop resumes

✅ **Feature: Game Over Detection and Transition**
- Game Over screen appears when lives = 0 → State transitions to DEFEAT
- Game Over screen displays title and options → UI renders with "GAME OVER", "Replay", "Quit"
- Replay button resets state → `setState('PLAYING')` reinitializes all data
- Quit button returns to menu → `setState('MENU')` clears game state

✅ **Feature: Ball Reset After Life Loss**
- Ball resets to initial position → `ball = { x: centerX, y: 50 }`
- Ball velocity reset → `ball.vy = 150` (from ballSpeed config)
- Paddle resets to center → `paddle.x = centerX - 40`
