# Slice 1 — Game Board and Paddle Setup

## Goal

Initialize the HTML5 canvas, set up the game board with fixed dimensions, position the paddle at the bottom center, and arrange bricks in a 5×8 grid. This slice establishes the visual foundation and static entities for gameplay.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Game Setup and Initialization](../../what/epics/epic-0-mvp/user-stories/us-001-game-setup.md)
- [US-003 — Paddle Control and Movement](../../what/epics/epic-0-mvp/user-stories/us-003-paddle-control.md) — depends on paddle position

## Impacted Components

From [Architecture](../architecture.md):
- **Game Engine** — Initialization of canvas and 2D context
- **Renderer** — Canvas clear, board draw, paddle draw, brick draw
- **Game State** — Initialization of bricks array and paddle position

## Interfaces

### Game Initialization
```javascript
// Initialize game board
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameState = {
  canvasWidth: 800,
  canvasHeight: 600,
  paddle: {
    x: (800 - 80) / 2,  // centered
    width: 80,
    height: 10,
    y: 600 - 15          // 15px from bottom
  },
  bricks: initializeBricks(5, 8, 75, 15, 5), // 5 rows, 8 cols, 75×15px bricks, 5px padding
  ball: { x: 400, y: 500, vx: 0, vy: 0, radius: 4 }
};
```

### Brick Grid Generation
```javascript
function initializeBricks(rows, cols, brickWidth, brickHeight, padding) {
  const bricks = [];
  const startX = (800 - (cols * brickWidth + (cols - 1) * padding)) / 2;
  const startY = 30;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      bricks.push({
        x: startX + col * (brickWidth + padding),
        y: startY + row * (brickHeight + padding),
        width: brickWidth,
        height: brickHeight,
        active: true
      });
    }
  }
  return bricks; // Array of 40 bricks
}
```

### Canvas Rendering
```javascript
function renderGameBoard(ctx, gameState) {
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
  
  // Draw bricks
  ctx.fillStyle = '#ff4444';
  gameState.bricks.forEach(brick => {
    if (brick.active) {
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      ctx.strokeStyle = '#cccccc';
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    }
  });
  
  // Draw paddle
  ctx.fillStyle = '#4444ff';
  ctx.fillRect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height);
  
  // Draw ball
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, 2 * Math.PI);
  ctx.fill();
}
```

## Data Changes

### Game State Initialization
- Initialize 40 brick objects in a 5×8 grid
- Set paddle position: centered horizontally, 15px from bottom
- Set ball starting position: centered above paddle
- Set canvas dimensions: 800×600px

### Brick Object Schema
```javascript
{
  x: number,           // left edge in pixels
  y: number,           // top edge in pixels
  width: 75,           // fixed
  height: 15,          // fixed
  active: true         // destroyed bricks set to false
}
```

### Paddle Object Schema
```javascript
{
  x: number,           // left edge in pixels (updates with input)
  width: 80,           // fixed
  height: 10,          // fixed
  y: 585               // fixed (600 - 15)
}
```

## Sequence Flow

### Initialization (on page load)
```
1. Game Engine receives canvas element from DOM
2. Game Engine creates 2D context: ctx = canvas.getContext('2d')
3. Game Engine initializes Game State:
   - Set canvas dimensions (800×600)
   - Call initializeBricks(5, 8, 75, 15, 5) → 40 brick objects
   - Set paddle position: x = 360, y = 585
   - Set ball position: x = 400, y = 500
4. Renderer clears canvas with dark background
5. Renderer draws all 40 bricks in grid layout
6. Renderer draws paddle at center-bottom
7. Renderer draws ball at center
8. Game state is ready for next phase (input handling, physics)
```

### Frame Rendering Loop
```
Each frame (60 FPS):
1. (Physics and input update state)
2. Renderer.clear() — fill canvas with background color
3. Renderer.drawBoard() — draw grid lines or visual boundaries
4. Renderer.drawBricks(gameState.bricks) — iterate and draw active bricks only
5. Renderer.drawPaddle(gameState.paddle) — draw paddle rectangle
6. Renderer.drawBall(gameState.ball) — draw ball circle
7. (Next frame)
```

## Observability Impact

### Logging
- Log canvas context acquisition: `console.log('Canvas 2D context ready')`
- Log brick grid initialization: `console.log('40 bricks initialized, 5 rows × 8 cols')`
- Log paddle position: `console.log('Paddle: x=360, y=585')`

### Metrics
- Frame render time (should be < 5ms on modern hardware)
- Canvas API calls per frame (baseline: ~43 calls — 1 clear + 40 brick draws + 2 entity draws)

### Debugging
- Visual inspection: All 40 bricks visible on screen
- Brick count validation: `gameState.bricks.filter(b => b.active).length === 40`
- Paddle centering validation: `gameState.paddle.x + gameState.paddle.width/2 === gameState.canvasWidth/2`
- Ball centering validation: `gameState.ball.x === gameState.canvasWidth/2`

## Testing Strategy

### Unit Tests
- `initializeBricks()` returns exactly 40 bricks
- Each brick has correct x, y, width, height, active properties
- Paddle position is centered: `paddle.x === (canvasWidth - paddleWidth) / 2`
- Ball starting position is above paddle: `ball.y < paddle.y`

### Visual Tests
- All 40 bricks visible and evenly spaced
- Paddle centered at bottom
- Ball visible above paddle
- No overlapping elements
- Color scheme correct (red bricks, blue paddle, white ball, dark background)

## Acceptance Criteria Met

✅ Canvas created and rendered in DOM with dimensions 800×600
✅ Playable area boundaries defined
✅ Paddle positioned at center-bottom with dimensions 80×10px
✅ Bricks arranged in 5 rows of 8 columns, 75×15px each
✅ Ball positioned centered above paddle, radius 4px
✅ All elements graphically visible and correctly sized
✅ No physics or collision logic yet (foundation only)

## Next Slices

- [Slice 2 — Ball Physics Engine](../slice-2-ball-physics/slice.md) — Move ball with constant velocity
- [Slice 5 — Game State Management](../slice-5-game-state-management/slice.md) — Add state machine and menu
