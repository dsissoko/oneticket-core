# Slice 5 — Game State Management and Transitions

## Goal

Implement a state machine managing five game states (Menu, Active, Pause, Win, Loss) and enforce valid transitions between them. Display state-specific UI for each mode and ensure game logic only runs when appropriate.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-003 — Paddle Control and Movement](../../what/epics/epic-0-mvp/user-stories/us-003-paddle-control.md)
- [US-005 — Life Management and Game Over](../../what/epics/epic-0-mvp/user-stories/us-005-life-management.md)
- [US-006 — Game State Transitions](../../what/epics/epic-0-mvp/user-stories/us-006-game-states.md)

## Impacted Components

From [Architecture](../architecture.md):
- **State Machine** — Manage state tracking and transitions
- **Game Engine** — Orchestrate transitions
- **Input Handler** — Only process input in Active state
- **Physics Engine** — Only update physics in Active state
- **Renderer** — Render different UI for each state

## Interfaces

### State Machine
```javascript
class GameStateMachine {
  constructor(initialState = 'Menu') {
    this.currentState = initialState;
    this.validTransitions = {
      'Menu': ['Active'],
      'Active': ['Pause', 'Win', 'Loss'],
      'Pause': ['Active', 'Menu'],
      'Win': ['Menu'],
      'Loss': ['Menu']
    };
  }
  
  canTransition(fromState, toState) {
    return this.validTransitions[fromState]?.includes(toState) ?? false;
  }
  
  transition(newState) {
    if (!this.canTransition(this.currentState, newState)) {
      console.warn(`Cannot transition from ${this.currentState} to ${newState}`);
      return false;
    }
    console.log(`State transition: ${this.currentState} → ${newState}`);
    this.currentState = newState;
    return true;
  }
  
  getState() {
    return this.currentState;
  }
}
```

### State-Specific Game Logic
```javascript
function updateGameLoop(gameState, stateMachine) {
  const currentState = stateMachine.getState();
  
  switch (currentState) {
    case 'Menu':
      // Render menu, listen for start button
      renderMenu(gameState);
      break;
      
    case 'Active':
      // Run full game loop
      handleInput(gameState);
      updateBallPhysics(gameState);
      detectCollisions(gameState);
      applyBounces(gameState);
      checkGameConditions(gameState, stateMachine);
      renderGame(gameState);
      break;
      
    case 'Pause':
      // Freeze physics, show pause menu
      renderGameWithPauseOverlay(gameState);
      break;
      
    case 'Win':
      // Show victory screen
      renderWinScreen(gameState);
      break;
      
    case 'Loss':
      // Show game over screen
      renderLossScreen(gameState);
      break;
  }
}
```

### State Reset on Transition
```javascript
function resetGameState(gameState) {
  // Reset lives
  gameState.lives = 3;
  
  // Reset bricks
  gameState.bricks.forEach(brick => {
    brick.active = true;
  });
  gameState.brickCount = 40;
  
  // Reset ball
  gameState.ball.x = gameState.canvasWidth / 2;
  gameState.ball.y = gameState.canvasHeight - 100;
  gameState.ball.vx = 0;
  gameState.ball.vy = 0;
  
  // Reset paddle
  gameState.paddle.x = (gameState.canvasWidth - gameState.paddle.width) / 2;
  
  // Speed remains at current setting
  // gameState.speed unchanged
}
```

### Menu State Rendering
```javascript
function renderMenu(ctx, gameState) {
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('BREAKOUT', gameState.canvasWidth / 2, 80);
  
  // Instructions
  ctx.font = '16px Arial';
  ctx.fillStyle = '#cccccc';
  ctx.fillText('Use arrow keys to move the paddle', gameState.canvasWidth / 2, 150);
  ctx.fillText('Destroy all bricks to win', gameState.canvasWidth / 2, 180);
  
  // Speed slider section
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Ball Speed:', 100, 280);
  
  // Draw slider (simplified visualization)
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#4444ff';
  drawSlider(ctx, 100, 300, 200, 20, gameState.speed * 100);
  
  // Start button
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(gameState.canvasWidth / 2 - 75, 400, 150, 50);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('START GAME', gameState.canvasWidth / 2, 432);
}

function drawSlider(ctx, x, y, width, height, value) {
  // Draw track
  ctx.fillStyle = '#333333';
  ctx.fillRect(x, y, width, height);
  
  // Draw thumb
  const thumbX = x + (width * value / 100);
  ctx.fillStyle = '#4444ff';
  ctx.fillRect(thumbX - 5, y - 5, 10, height + 10);
}
```

### Active State with Full Game Rendering
```javascript
function renderGame(ctx, gameState) {
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Draw game board
  drawBricks(ctx, gameState.bricks);
  drawPaddle(ctx, gameState.paddle);
  drawBall(ctx, gameState.ball);
  
  // Draw UI overlay
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Lives: ${gameState.lives}`, 20, 30);
  ctx.textAlign = 'right';
  ctx.fillText(`Bricks: ${gameState.brickCount}`, gameState.canvasWidth - 20, 30);
  
  // Optional: pause hint
  ctx.fillStyle = '#888888';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Press SPACE to pause', gameState.canvasWidth / 2, gameState.canvasHeight - 10);
}
```

### Win State Rendering
```javascript
function renderWinScreen(ctx, gameState) {
  // Draw game board behind overlay
  renderGame(ctx, gameState);
  
  // Draw semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Victory message
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('YOU WIN!', gameState.canvasWidth / 2, gameState.canvasHeight / 2 - 50);
  
  // Stats
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Arial';
  ctx.fillText(`Bricks Destroyed: ${40}`, gameState.canvasWidth / 2, gameState.canvasHeight / 2 + 30);
  
  // Play Again button
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(gameState.canvasWidth / 2 - 75, gameState.canvasHeight / 2 + 80, 150, 50);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('PLAY AGAIN', gameState.canvasWidth / 2, gameState.canvasHeight / 2 + 112);
}
```

### Loss State Rendering
```javascript
function renderLossScreen(ctx, gameState) {
  // Draw game board behind overlay
  renderGame(ctx, gameState);
  
  // Draw semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Game Over message
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', gameState.canvasWidth / 2, gameState.canvasHeight / 2 - 50);
  
  // Stats
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Arial';
  ctx.fillText(`Bricks Destroyed: ${40 - gameState.brickCount}`, gameState.canvasWidth / 2, gameState.canvasHeight / 2 + 30);
  
  // Try Again button
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(gameState.canvasWidth / 2 - 75, gameState.canvasHeight / 2 + 80, 150, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('TRY AGAIN', gameState.canvasWidth / 2, gameState.canvasHeight / 2 + 112);
}
```

## Data Changes

### Game State Additions
```javascript
{
  mode: 'Menu' | 'Active' | 'Pause' | 'Win' | 'Loss'
}
```

## Sequence Flow

### Game Initialization
```
1. Page loads
2. Game Engine creates canvas, initializes Game State
3. State Machine initialized: currentState = 'Menu'
4. Game loop starts (requestAnimFrame)
5. Each frame: updateGameLoop(gameState, stateMachine)
   - currentState is 'Menu'
   - renderMenu() displays title, speed slider, start button
   - Awaiting user input
```

### Menu → Active Transition
```
1. User clicks "START GAME" button
2. Input handler detects click
3. Game Engine calls: stateMachine.transition('Active')
4. State Machine validates: 'Menu' → 'Active' allowed
5. Game State reset: resetGameState(gameState)
6. Next frame: updateGameLoop executes 'Active' case
   - Input handler begins processing arrow keys
   - Physics engine updates ball position
   - Collision detection runs
   - Renderer draws full game board
```

### Active → Pause Transition
```
1. User presses SPACE key
2. Input handler detects space
3. Game Engine calls: stateMachine.transition('Pause')
4. State Machine validates: 'Active' → 'Pause' allowed
5. Next frame: updateGameLoop executes 'Pause' case
   - Physics engine paused (no update)
   - Renderer draws game with pause overlay
   - Awaiting resume or menu selection
```

### Active → Loss Transition (Automatic)
```
1. Ball passes bottom boundary
2. Physics engine detects out-of-bounds
3. Game State: lives--
4. If lives === 0:
   - Game Engine calls: stateMachine.transition('Loss')
5. Next frame: updateGameLoop executes 'Loss' case
   - renderLossScreen() displays game over message
   - Awaiting "TRY AGAIN" or menu input
```

### Loss → Menu Transition
```
1. User clicks "TRY AGAIN" button
2. Input handler detects click
3. Game Engine calls: stateMachine.transition('Menu')
4. Game State: resetGameState()
5. Next frame: updateGameLoop executes 'Menu' case
   - renderMenu() displays start menu again
```

## Observability Impact

### Logging
- Log state transitions: `console.log('State:', stateMachine.getState())`
- Log invalid transitions: `console.warn('Cannot transition to', newState)`

### Metrics
- Current game state (displayed in debug corner)
- State change timestamps (for diagnostics)

### Debugging
- Display current state in corner: "State: Active"
- Log state machine transitions to console
- Highlight clickable UI elements (debug mode)

## Testing Strategy

### Unit Tests
- `canTransition()` returns true for valid transitions
- `canTransition()` returns false for invalid transitions
- `transition()` updates currentState on valid change
- `transition()` returns false on invalid change
- `resetGameState()` resets all values correctly

### Integration Tests
- Menu → Active transition works
- Active → Pause transition works
- Active → Win/Loss automatic transitions work
- Return to Menu from Win/Loss states works
- Game state reset after transition
- Input disabled in non-Active states

### Visual Tests
- Menu screen displays correctly
- Active game renders with lives and brick count
- Pause overlay appears
- Win screen shows victory message
- Loss screen shows game over message
- Buttons clickable and functional

## Acceptance Criteria Met

✅ Game starts in Menu state
✅ Menu displays title and start button
✅ Menu → Active transition on start click
✅ Speed slider visible and adjustable in Menu
✅ Active state runs full game loop
✅ Pause state freezes physics
✅ Automatic transition to Win when bricks = 0
✅ Automatic transition to Loss when lives = 0
✅ Win/Loss screens display with return button
✅ Return to Menu resets game state
✅ All state transitions valid

## Next Slices

- [Slice 6 — Speed Adjustment and UI Controls](../slice-6-speed-control/slice.md) — Speed slider integration
- [Slice 7 — Win/Loss Conditions](../slice-7-win-loss-conditions/slice.md) — Condition checking logic
