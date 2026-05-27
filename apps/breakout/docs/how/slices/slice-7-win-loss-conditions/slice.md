# Slice 7 — Win/Loss Conditions and Final Integration

## Goal

Implement automatic detection of game-ending conditions (all bricks destroyed = win, lives = 0 = loss) and trigger appropriate state transitions. Ensure all seven slices work together in a complete game loop.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Ball Physics and Collision Detection](../../what/epics/epic-0-mvp/user-stories/us-002-ball-physics.md)
- [US-005 — Life Management and Game Over](../../what/epics/epic-0-mvp/user-stories/us-005-life-management.md)
- [US-006 — Game State Transitions](../../what/epics/epic-0-mvp/user-stories/us-006-game-states.md)

## Impacted Components

From [Architecture](../architecture.md):
- **State Machine** — Automatic state transitions to Win/Loss
- **Game Engine** — Orchestrate condition checking
- **Renderer** — Display Win/Loss screens
- **Physics Engine** — Handle ball out-of-bounds as life loss

## Interfaces

### Condition Checking
```javascript
function checkGameConditions(gameState, stateMachine) {
  const currentState = stateMachine.getState();
  
  if (currentState !== 'Active') {
    return; // Only check during active gameplay
  }
  
  // Win condition: all bricks destroyed
  if (gameState.brickCount === 0) {
    console.log('Win condition detected: all bricks destroyed');
    stateMachine.transition('Win');
    return;
  }
  
  // Loss condition: no lives remaining
  if (gameState.lives === 0) {
    console.log('Loss condition detected: no lives remaining');
    stateMachine.transition('Loss');
    return;
  }
}
```

### Ball Out-of-Bounds Handler
```javascript
function handleBallOutOfBounds(gameState, stateMachine) {
  // Ball fell below paddle
  gameState.lives--;
  
  console.log('Ball lost. Lives remaining:', gameState.lives);
  
  // Reset ball to starting position
  gameState.ball.x = gameState.paddle.x + gameState.paddle.width / 2;
  gameState.ball.y = gameState.paddle.y - 20;
  gameState.ball.vx = 0;
  gameState.ball.vy = 0;
  
  // Check loss condition immediately
  if (gameState.lives === 0) {
    stateMachine.transition('Loss');
  }
}
```

### Complete Game Loop Integration
```javascript
function gameLoop(gameState, stateMachine, inputHandler, renderer) {
  const currentState = stateMachine.getState();
  
  switch (currentState) {
    case 'Menu':
      renderer.renderMenu(gameState);
      break;
      
    case 'Active':
      // 1. Input processing
      inputHandler.updatePaddleFromInput(gameState.paddle, {
        left: 0,
        right: gameState.canvasWidth,
        top: 0,
        bottom: gameState.canvasHeight
      });
      
      // 2. Physics update
      const outOfBounds = updateBallPhysics(
        gameState.ball,
        {
          left: 0,
          right: gameState.canvasWidth,
          top: 0,
          bottom: gameState.canvasHeight
        }
      );
      
      if (outOfBounds.outOfBounds) {
        handleBallOutOfBounds(gameState, stateMachine);
      }
      
      // 3. Collision detection
      const collisions = detectCollisions(
        gameState.ball,
        gameState.paddle,
        gameState.bricks,
        {
          left: 0,
          right: gameState.canvasWidth,
          top: 0,
          bottom: gameState.canvasHeight
        }
      );
      
      // 4. Apply bounces and state changes
      collisions.forEach(collision => {
        switch (collision.type) {
          case 'paddle':
            applyPaddleBounce(gameState.ball, gameState.paddle, collision);
            break;
          case 'brick':
            applyBrickBounce(gameState.ball, collision);
            destroyBrick(gameState, collision.brickIndex);
            break;
        }
      });
      
      // 5. Check game conditions
      checkGameConditions(gameState, stateMachine);
      
      // 6. Render
      renderer.renderGame(gameState);
      break;
      
    case 'Pause':
      renderer.renderPauseScreen(gameState);
      break;
      
    case 'Win':
      renderer.renderWinScreen(gameState);
      break;
      
    case 'Loss':
      renderer.renderLossScreen(gameState);
      break;
  }
}
```

### Win Screen Rendering
```javascript
function renderWinScreen(ctx, gameState) {
  // Draw frozen game state in background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Draw bricks and entities (for context)
  drawBricks(ctx, gameState.bricks);
  drawPaddle(ctx, gameState.paddle);
  drawBall(ctx, gameState.ball);
  
  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Victory title
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('YOU WIN!', gameState.canvasWidth / 2, 150);
  
  // Stats section
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText('All bricks destroyed!', gameState.canvasWidth / 2, 250);
  
  ctx.font = '16px Arial';
  ctx.fillText(`Bricks Destroyed: 40`, gameState.canvasWidth / 2, 300);
  ctx.fillText(`Lives Remaining: ${gameState.lives}`, gameState.canvasWidth / 2, 340);
  
  // Play Again button
  const buttonX = gameState.canvasWidth / 2;
  const buttonY = 420;
  const buttonWidth = 200;
  const buttonHeight = 50;
  
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(buttonX - buttonWidth / 2, buttonY, buttonWidth, buttonHeight);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PLAY AGAIN', buttonX, buttonY + 33);
  
  // Save button hitbox for click detection
  gameState.uiElements = gameState.uiElements || {};
  gameState.uiElements.playAgainButton = {
    x: buttonX - buttonWidth / 2,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
}
```

### Loss Screen Rendering
```javascript
function renderLossScreen(ctx, gameState) {
  // Draw frozen game state in background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Draw bricks and entities
  drawBricks(ctx, gameState.bricks);
  drawPaddle(ctx, gameState.paddle);
  drawBall(ctx, gameState.ball);
  
  // Red overlay
  ctx.fillStyle = 'rgba(200, 0, 0, 0.5)';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Game Over title
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', gameState.canvasWidth / 2, 150);
  
  // Stats section
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText('No lives remaining', gameState.canvasWidth / 2, 250);
  
  ctx.font = '16px Arial';
  const bricksDestroyed = 40 - gameState.brickCount;
  ctx.fillText(`Bricks Destroyed: ${bricksDestroyed}`, gameState.canvasWidth / 2, 300);
  ctx.fillText(`Lives Lost: 3`, gameState.canvasWidth / 2, 340);
  
  // Try Again button
  const buttonX = gameState.canvasWidth / 2;
  const buttonY = 420;
  const buttonWidth = 200;
  const buttonHeight = 50;
  
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(buttonX - buttonWidth / 2, buttonY, buttonWidth, buttonHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TRY AGAIN', buttonX, buttonY + 33);
  
  // Save button hitbox for click detection
  gameState.uiElements = gameState.uiElements || {};
  gameState.uiElements.tryAgainButton = {
    x: buttonX - buttonWidth / 2,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
}
```

## Data Changes

### No new data types required
All necessary state already present in previous slices:
- `gameState.lives` — decremented on ball loss
- `gameState.brickCount` — decremented on brick destruction
- `stateMachine.currentState` — transitions to Win or Loss

## Sequence Flow

### Active State Frame Loop (Complete)
```
Each frame at 60 FPS:
1. Input Handler: process arrow keys → update paddle.x
2. Physics Engine: update ball.x, ball.y
3. Physics Engine: detect wall/ceiling bounces → reverse velocity
4. Physics Engine: check out-of-bounds
   - If out of bounds: handleBallOutOfBounds()
     - lives--
     - ball.x = paddle center
     - ball.y = above paddle
     - ball.vx = 0
     - ball.vy = 0
     - Check if lives == 0 (loss condition)
5. Collision Detector: detect paddle and brick collisions
6. Apply collision responses:
   - Paddle collision: apply bounce with angle adjustment
   - Brick collision: destroy brick, apply bounce
7. Check game conditions:
   - If brickCount == 0: transition to Win
   - If lives == 0: transition to Loss
8. Renderer: draw current state
9. (Next frame via requestAnimFrame)
```

### Win Condition Path
```
Frame N: gameState.brickCount = 1
- Ball collides with last brick
- Brick marked destroyed
- gameState.brickCount = 0

Frame N+1:
- checkGameConditions() runs
- Detects: brickCount == 0
- Calls: stateMachine.transition('Active' → 'Win')
- State Machine updates currentState = 'Win'

Frame N+2:
- gameLoop() executes 'Win' case
- renderWinScreen() draws victory screen
- Game waits for "Play Again" click
```

### Loss Condition Path
```
Frame M: gameState.lives = 1
- Ball falls below paddle
- Physics engine detects out-of-bounds
- handleBallOutOfBounds() called
  - lives-- → lives = 0
  - ball reset
  - checkGameConditions() called from handler
  - Detects: lives == 0
  - Calls: stateMachine.transition('Active' → 'Loss')

Frame M+1:
- gameLoop() executes 'Loss' case
- renderLossScreen() draws game over screen
- Game waits for "Try Again" click
```

### Return to Menu from Win
```
1. Win screen displayed
2. Player clicks "Play Again" button
3. Input handler detects click in button hitbox
4. Calls: stateMachine.transition('Win' → 'Menu')
5. Game State: resetGameState()
   - lives = 3
   - brickCount = 40
   - all bricks.active = true
   - ball reset
6. Next frame: gameLoop() executes 'Menu' case
7. Menu screen displayed again
```

## Observability Impact

### Logging
- Log condition checks each frame (debug mode): `console.log('Conditions checked. Lives:', lives, 'Bricks:', brickCount)`
- Log game-ending conditions: `console.log('WIN!' or 'LOSS!')`
- Log state transitions: `console.log('State transition:', from, '→', to)`

### Metrics
- Time to completion (if win)
- Bricks destroyed count (at loss)
- Lives lost count
- Game state transitions

### Debugging
- Display game conditions in corner: "Lives: 2, Bricks: 10"
- Display current state
- Show condition check results

## Testing Strategy

### Unit Tests
- `checkGameConditions()` triggers Win when brickCount === 0
- `checkGameConditions()` triggers Loss when lives === 0
- `checkGameConditions()` does nothing if both conditions false
- `handleBallOutOfBounds()` decrements lives
- `handleBallOutOfBounds()` resets ball position
- `handleBallOutOfBounds()` checks loss condition

### Integration Tests
- Game loop completes without errors
- All seven slices work together
- Win state reachable (destroy all bricks)
- Loss state reachable (lose all lives)
- Win/Loss screen buttons work
- Return to Menu resets state correctly
- Win condition checked after each brick destruction
- Loss condition checked after each life loss

### End-to-End Tests
- Complete game from Menu → Active → Win
- Complete game from Menu → Active → Loss
- Multiple games in sequence (Menu → Active → Loss → Menu → Active → Win)
- Speed slider affects gameplay correctly
- Paddle responds to input
- Ball physics accurate
- Collisions work correctly

### Visual Tests
- Win screen displays correctly
- Loss screen displays correctly
- Win/Loss buttons visible and clickable
- Game board visible in background of Win/Loss screens
- No visual glitches or overlaps
- Text readable and properly centered
- Button hover/click feedback (optional)

## Acceptance Criteria Met

✅ Ball loss (out of bounds) decrements lives
✅ Life counter never exceeds 3
✅ Game over when lives reach 0
✅ Loss screen displays with stats and replay button
✅ All bricks destroyed triggers win condition
✅ Win screen displays with victory message
✅ Return to Menu from Win/Loss resets game state
✅ Button clicks transition states correctly
✅ No console errors
✅ Game runs smoothly at 60 FPS

## Complete Game Flow

```
┌─────────────────────────────────────────────┐
│ 1. Slice 1: Game Board & Paddle Setup       │
│    - Canvas created                         │
│    - 40 bricks in 5×8 grid                 │
│    - Paddle centered at bottom              │
│    - Ball positioned above paddle           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 5. Slice 5: Game State Management           │
│    - State Machine: Menu state              │
│    - Menu screen displayed                  │
│    - Speed slider visible                   │
│    - Awaiting "Start Game" click            │
└─────────────────────────────────────────────┘
                    ↓ Start clicked
┌─────────────────────────────────────────────┐
│ Menu → Active Transition                    │
│ - Game state reset                          │
│ - Lives = 3                                 │
│ - Ball ready to launch                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Active Game Loop (60 FPS):                  │
│                                             │
│ 3. Slice 3: Collision Detection System      │
│    - Detect paddle/brick collisions         │
│                                             │
│ 2. Slice 2: Ball Physics Engine             │
│    - Update ball position                   │
│    - Wall/ceiling bounces                   │
│    - Apply collision bounces                │
│                                             │
│ 4. Slice 4: Brick Destruction               │
│    - Mark bricks destroyed                  │
│    - Decrement brick count                  │
│                                             │
│ 6. Slice 6: Speed Control                   │
│    - Apply speed slider to velocity         │
│                                             │
│ 7. Slice 7: Win/Loss Conditions             │
│    - Check if brickCount = 0 (WIN)          │
│    - Check if lives = 0 (LOSS)              │
│    - Trigger state transition               │
│                                             │
│ 1. Slice 1: Rendering                       │
│    - Draw all entities                      │
│    - Draw UI overlays                       │
└─────────────────────────────────────────────┘
                    ↓
        ┌────────────┴────────────┐
        ↓                         ↓
   [WIN]                      [LOSS]
   Screen                     Screen
   Victory                    Game Over
   Message                    Message
```

## Next Steps

All user stories US-001 through US-007 are covered by these seven slices:

- **US-001** → Slice 1 (Game Setup)
- **US-002** → Slice 2 (Ball Physics), Slice 3 (Collision)
- **US-003** → Slice 5 (Input/Paddle), Slice 6 (Speed)
- **US-004** → Slice 3 (Collision), Slice 4 (Brick Destruction)
- **US-005** → Slice 7 (Life Management)
- **US-006** → Slice 5 (State Management), Slice 7 (Conditions)
- **US-007** → Slice 6 (Speed Control)

The implementation is ready for development phase.
