# Slice 3 — Paddle Control & Input Handling

## Goal

Implement keyboard input handling so the player can control the paddle with left/right arrow keys. The paddle responds immediately to keypresses, moves smoothly, and stays within screen bounds.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-003 — Contrôle de la raquette](../../../what/epics/epic-0-mvp/user-stories/us-003-paddle-control.md)

## Impacted Components

1. **Input Handler** (`inputHandler.js`)
   - Listen to `keydown` events (arrow keys)
   - Listen to `keyup` events to clear movement
   - Update `gameState.paddle.vx` based on key state
   - Ignore non-arrow keys (no diagonal or modifier combinations)

2. **Physics Engine** (`physics.js`)
   - Update paddle position each frame: `paddle.x += paddle.vx * dt`
   - Clamp paddle X to screen bounds: `[0, canvas.width - paddle.width]`

3. **Game Loop** (`gameLoop.js`)
   - Call `inputHandler.update(gameState)` at start of each frame
   - Physics already updates paddle position (from Slice 2)

4. **Game State** (`gameState.js`)
   - Paddle velocity field: `paddle.vx`
   - Support paddle position clamping

5. **Renderer** (`renderer.js`)
   - Render paddle at updated position each frame

## Interfaces

### Input Handler → Game State
```javascript
inputHandler.onKeyDown(event, gameState)
// If event.key === "ArrowLeft": gameState.paddle.vx = -paddleSpeed
// If event.key === "ArrowRight": gameState.paddle.vx = paddleSpeed

inputHandler.onKeyUp(event, gameState)
// If event.key === "ArrowLeft" or "ArrowRight": gameState.paddle.vx = 0
```

### Physics → Game State (Paddle Movement)
```javascript
physics.update(deltaTime, gameState)
// Updates paddle position:
// gameState.paddle.x += gameState.paddle.vx * deltaTime
// Clamps: gameState.paddle.x = clamp(paddle.x, 0, canvas.width - paddle.width)
```

## Data Changes

**Paddle State During Movement:**
```javascript
paddle: {
  x: number,          // Updated position (clamped)
  y: number,          // Fixed at bottom
  width: number,      // Fixed (e.g., 60px)
  height: number,     // Fixed (e.g., 10px)
  vx: number,         // -paddleSpeed, 0, or +paddleSpeed
}
```

**Input State (Internal to InputHandler):**
```javascript
{
  keysPressed: {
    ArrowLeft: boolean,
    ArrowRight: boolean
  }
}
```

## Sequence Flow

```
Per Frame:
1. InputHandler.update(gameState)
   a. Check if ArrowLeft key is held
      - If yes: gameState.paddle.vx = -paddleSpeed (e.g., -300 px/s)
   b. Check if ArrowRight key is held
      - If yes: gameState.paddle.vx = +paddleSpeed (e.g., +300 px/s)
   c. If neither: gameState.paddle.vx = 0

2. Physics.update(deltaTime)
   a. paddle.x += paddle.vx * deltaTime
   b. Clamp paddle.x:
      - If paddle.x < 0: paddle.x = 0
      - If paddle.x + paddle.width > canvas.width: paddle.x = canvas.width - paddle.width

3. Renderer.draw(gameState)
   a. Render paddle at updated x position

Key Events (Global Listeners):
- keydown: Detect ArrowLeft/ArrowRight, update keysPressed map
- keyup: Detect ArrowLeft/ArrowRight release, clear from keysPressed map
```

## Observability Impact

**Console Logging (debug only):**
- Log input events: "ArrowLeft pressed", "ArrowRight released"
- Log paddle position: "Paddle X: 350 px" (every 10 frames)
- Log paddle velocity: "Paddle vx: 300 px/s" or "Paddle vx: 0 px/s"

**Visual Feedback:**
- Paddle moves smoothly left/right in response to key presses
- Paddle stops moving immediately when key released
- Paddle never moves off-screen (clamped at edges)

## Notes

- Paddle velocity is set by input handler; physics engine applies velocity to position
- No acceleration or deceleration; paddle moves at constant speed while key held
- Key hold detection uses `keydown`/`keyup` event listeners to allow smooth continuous movement
- Modifier keys (Shift, Ctrl) with arrows are ignored (not handled)
- Diagonal movement not supported; only left or right

---

**Status:** Ready for implementation. No blockers.
