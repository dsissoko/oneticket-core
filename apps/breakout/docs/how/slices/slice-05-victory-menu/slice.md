# Slice 5 — Victory Screen & Menu Navigation

## Goal

Implement the main menu with start button, victory screen when all bricks are destroyed, and menu navigation between game, menu, victory, and game-over screens. Enable the player to start a game, restart after victory/loss, and return to the menu.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-005 — Victoire et Menu](../../../what/epics/epic-0-mvp/user-stories/us-005-victory-and-menu.md)

## Impacted Components

1. **Menu Controller** (`menuController.js`)
   - Render main menu with "Start" and "Options" buttons
   - Handle "Start" button click → transition to "playing" phase, launch ball
   - Handle "Options" button click → show speed slider (linked to Slice 6)
   - Handle "Play Again" button click → reset game, transition to "playing"
   - Handle "Return to Menu" button click → reset game, transition to "menu"

2. **Game State** (`gameState.js`)
   - Add `isVictory()` method: checks if `bricks.length === 0`
   - Support phase transitions: "menu" ↔ "playing" ↔ "victory" ↔ "gameover"
   - Method `resetGame()` to reinitialize bricks, ball, paddle, lives

3. **Renderer** (`renderer.js`)
   - Render main menu screen when `phase === "menu"`
   - Render victory screen when `phase === "victory"`
   - Display "Play Again" and "Return to Menu" buttons on victory screen
   - Show game board with lives counter during `phase === "playing"`

4. **Game Loop** (`gameLoop.js`)
   - After each collision, check `gameState.isVictory()`
   - If all bricks destroyed: transition to "victory" phase
   - Stop physics updates during "menu" and "victory" phases
   - Resume physics when transitioning to "playing"

5. **Input Handler** (`inputHandler.js`)
   - Disable keyboard input (arrow keys) during "menu", "victory", "gameover" phases
   - Enable keyboard input only during "playing" phase

6. **Index HTML** (`index.html`)
   - Add menu HTML structure with buttons (Start, Options, Play Again, Return to Menu)
   - Add victory screen HTML structure

## Interfaces

### Menu Controller → Game State
```javascript
menuController.handleStartGame(gameState)
// Modifies: gameState.phase = "playing"
//           gameState.lives = 3
//           gameState.bricks = createInitialLayout()
//           gameState.ball = { x: paddle.x, y: paddle.y - 20, vx: 150, vy: -150, radius: 5 }
//           gameState.paddle = { x: canvas.width / 2, y: canvas.height - 20, width: 60, height: 10, vx: 0 }

menuController.handlePlayAgain(gameState)
// Similar to handleStartGame but preserves speed multiplier

menuController.handleReturnToMenu(gameState)
// Modifies: gameState.phase = "menu"
//           resets all game state (lives, bricks, ball, paddle)
```

### Game Loop → Victory Check
```javascript
gameLoop.update() {
  // ... collision detection ...
  
  if (gameState.isVictory()) {
    gameState.phase = "victory"
  }
}
```

### Game State → Victory Detection
```javascript
gameState.isVictory()
// Returns: boolean (bricks.length === 0)

gameState.resetGame()
// Reinitializes:
//   phase: "menu"
//   lives: 3
//   bricks: [ /* 50 new bricks */ ]
//   ball: reset position/velocity
//   paddle: reset position/velocity
//   speedMultiplier: preserved (set in Slice 6)
```

### Renderer → Victory Screen
```javascript
renderer.drawVictoryScreen(gameState)
// Displays: "Victory!" message
// Displays: "Play Again" and "Return to Menu" buttons
// Attaches: click listeners to buttons
```

## Data Changes

**Menu Phase State:**
```javascript
{
  phase: "menu",
  lives: 3,          // Initial for display
  bricks: [...],     // Latest from last game or initial
  ball: null,        // Not displayed
  paddle: null,      // Not displayed
  speedMultiplier: 1.0 | <user-set value from Slice 6>
}
```

**Playing Phase State:**
```javascript
{
  phase: "playing",
  lives: 3 | 2 | 1 | 0,
  bricks: [ /* remaining bricks, decreasing */ ],
  ball: { x, y, vx, vy, radius },     // Moving, bouncing
  paddle: { x, y, width, height, vx }, // Responding to input
  speedMultiplier: <user-set value>
}
```

**Victory Phase State:**
```javascript
{
  phase: "victory",
  bricks: [],         // All destroyed
  lives: <remaining>, // Can have 1-3 lives left at victory
  ball: { /* final position */ },
  paddle: { /* final position */ }
}
```

## Sequence Flow

```
Application Startup:
1. Load index.html
2. Initialize gameState with phase = "menu"
3. Instantiate MenuController, Renderer, GameLoop
4. Renderer.draw() shows main menu

Main Menu Phase:
1. Display: "Start" button, "Options" button
2. User clicks "Start"
   a. menuController.handleStartGame(gameState)
   b. gameState.phase = "playing"
   c. gameState.lives = 3
   d. gameState.bricks = createInitialLayout() (50 bricks)
   e. gameState.ball = { x: paddle.x, y: paddle.y - 20, vx: 150, vy: -150 }
   f. Renderer draws gameplay screen

Playing Phase:
1. Game loop runs: input → physics → collision → render
2. Bricks destroyed on collision, removed from bricks array
3. Ball lost: lives decremented, ball respawned
4. Each frame, check gameState.isVictory()
   a. If bricks.length === 0:
      - gameState.phase = "victory"
      - Renderer draws victory screen (next frame)

Victory Phase:
1. Display: "Victory!" message
2. Display: "Play Again" and "Return to Menu" buttons
3. User clicks "Play Again"
   a. menuController.handlePlayAgain(gameState)
   b. gameState.phase = "playing"
   c. gameState.lives = 3 (reset)
   d. gameState.bricks = createInitialLayout() (new 50 bricks)
   e. gameState.ball = respawned position
   f. speedMultiplier preserved from menu
4. User clicks "Return to Menu"
   a. menuController.handleReturnToMenu(gameState)
   b. gameState.phase = "menu"
   c. All state reset to menu defaults
   d. Renderer draws main menu
```

## Observability Impact

**Console Logging (debug only):**
- Log phase transitions: "Phase transition: menu → playing", "Phase: victory"
- Log victory: "All bricks destroyed! Victory!"
- Log menu action: "Start game clicked", "Return to menu clicked"

**Visual Feedback:**
- Main menu displayed with clear buttons (hover/click feedback)
- Victory screen displayed with congratulatory message
- Buttons transition between screens smoothly
- Game board shown during "playing" phase
- Menu shown during "menu" and "options" phases

## Notes

- Victory check happens after collision detection each frame
- Ball remains on screen during victory screen (frozen state)
- Speed multiplier (Slice 6) is preserved across game sessions but resets to default on app reload
- "Start" button transitions from menu to playing; initial ball velocity set here (150, -150) or can be configured
- Menu buttons use `click` event listeners (mouse/pointer-driven, no keyboard for menu)

---

**Status:** Ready for implementation. Depends on Slices 1-4 completion.
