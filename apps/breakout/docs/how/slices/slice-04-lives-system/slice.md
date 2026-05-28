# Slice 4 — Lives System & Game Over Screen

## Goal

Implement the lives management system: track remaining lives, decrement on ball loss, display lives counter during play, and show a game-over screen when lives reach zero with "Play Again" and "Return to Menu" options.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-004 — Gestion des vies et écran de game over](../../../what/epics/epic-0-mvp/user-stories/us-004-lives-and-gameover.md)

## Impacted Components

1. **Game State** (`gameState.js`)
   - Track `lives` (0-3)
   - Method `decrementLives()` to decrement and check for game over
   - Method `resetLives()` to reset to 3 on new game
   - Method `isGameOver()` to check if `lives === 0`

2. **Renderer** (`renderer.js`)
   - Render lives counter prominently during gameplay
   - Render game-over screen when `phase === "gameover"`
   - Display message: "Game Over" or "You Lose!"
   - Display "Play Again" and "Return to Menu" buttons

3. **Game Loop** (`gameLoop.js`)
   - After collision detection, handle "ball-lost" event
   - Call `gameState.decrementLives()`
   - Check `gameState.isGameOver()`
   - Transition to "gameover" phase if lives reach 0
   - Otherwise, respawn ball above paddle

4. **Menu Controller** (`menuController.js`)
   - Handle "Play Again" button click → Reset game state, transition to "playing"
   - Handle "Return to Menu" button click → Reset game state, transition to "menu"

5. **Input Handler** (`inputHandler.js`)
   - Disable keyboard input when `phase === "gameover"`

## Interfaces

### Game State → Lives Management
```javascript
gameState.decrementLives()
// Modifies: gameState.lives--
// Returns: boolean (true if game is now over, false otherwise)

gameState.resetLives()
// Modifies: gameState.lives = 3

gameState.isGameOver()
// Returns: boolean (lives === 0)
```

### Game Loop → Collision Handling
```javascript
const collision = collisionDetector.detectAndResolve(gameState)

if (collision && collision.type === "ball-lost") {
  gameState.decrementLives()
  
  if (gameState.isGameOver()) {
    gameState.phase = "gameover"
  } else {
    respawnBall(gameState)
  }
}
```

### Menu Controller → Game State
```javascript
menuController.handlePlayAgain(gameState)
// Modifies: gameState.phase = "playing", gameState.lives = 3, resets ball/paddle
// Triggers: renderer.draw() to show game screen

menuController.handleReturnToMenu(gameState)
// Modifies: gameState.phase = "menu", resets all game state
// Triggers: renderer.draw() to show menu
```

### Renderer → Game Over Screen
```javascript
renderer.drawGameOverScreen(gameState)
// Displays: "Game Over" message
// Displays: "Play Again" and "Return to Menu" buttons
// Attaches: click listeners to buttons (via menuController)
```

## Data Changes

**Game State During Lives Management:**
```javascript
{
  phase: "playing" | "gameover",
  lives: 0 | 1 | 2 | 3,
  ball: { /* position and velocity */ },
  paddle: { /* position */ },
  // ... other fields
}
```

**Ball Respawn Logic:**
- When ball is lost and `lives > 0`:
  - Reset ball position: `ball.x = paddle.x`, `ball.y = paddle.y - 20`
  - Reset ball velocity: `ball.vx = 0`, `ball.vy = 0`
  - Ball waits for paddle to intercept it before moving

## Sequence Flow

```
Per Frame (during gameplay):
1. Physics, input, collision detection (previous slices)
2. If collision.type === "ball-lost":
   a. gameState.decrementLives()
   b. If gameState.lives === 0:
      - Set gameState.phase = "gameover"
      - Renderer will draw game-over screen next frame
   c. Else (lives > 0):
      - Respawn ball above paddle (x = paddle.x, y = paddle.y - 20)
      - Ball velocity reset to zero
      - Game continues in "playing" phase

Game Over Screen (phase === "gameover"):
1. Renderer.draw() calls drawGameOverScreen()
2. Display: "Game Over" message
3. Display: "Play Again" button
4. Display: "Return to Menu" button
5. Click listeners attached to buttons (no other input accepted)

User Interaction on Game Over Screen:
1. Click "Play Again"
   a. menuController.handlePlayAgain()
   b. Reset gameState: phase = "playing", lives = 3, respawn ball/paddle
   c. Renderer draws gameplay screen
2. Click "Return to Menu"
   a. menuController.handleReturnToMenu()
   b. Reset gameState: phase = "menu"
   c. Renderer draws menu screen
```

## Observability Impact

**Console Logging (debug only):**
- Log lives update: "Lives decremented: 3 → 2"
- Log game over: "Game Over! Lives exhausted"
- Log respawn: "Ball respawned above paddle"

**Visual Feedback:**
- Lives counter visible and updated in real-time: "Lives: 3" → "Lives: 2" → "Lives: 1" → "Lives: 0"
- Game-over screen appears with clear message
- Buttons respond to hover and click (visual feedback)

## Notes

- Ball respawn position: centered above paddle (at `paddle.x`, `paddle.y - 20`)
- Ball respawn velocity: zero (waits for first collision or gameplay to resume)
- Game-over screen blocks all game input; only menu button clicks accepted
- "Play Again" preserves speed multiplier setting (set in Slice 6)
- "Return to Menu" resets everything (phase, lives, bricks, ball, paddle)

---

**Status:** Ready for implementation. Depends on Slices 1-3 completion.
