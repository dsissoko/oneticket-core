# Slice 4 — Brick Destruction and Visual Feedback

## Goal

Provide immediate visual feedback when bricks are destroyed by the ball. Update the brick count display and ensure destroyed bricks remain invisible and non-collidable for the rest of the game.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-004 — Brick Destruction and State Management](../../what/epics/epic-0-mvp/user-stories/us-004-brick-destruction.md)

## Impacted Components

From [Architecture](../architecture.md):
- **Game State** — Brick active/destroyed state, brick count tracking
- **Renderer** — Render only active bricks, update brick count display
- **Collision Detector** — Mark bricks as destroyed (already in Slice 3)

## Interfaces

### Brick State Management
```javascript
// When brick destroyed (from Collision Detector):
function destroyBrick(gameState, brickIndex) {
  const brick = gameState.bricks[brickIndex];
  if (brick.active) {
    brick.active = false;
    gameState.brickCount--;
  }
}

// In collision detection loop:
const brickCollision = checkBrickCollision(ball, gameState.bricks);
if (brickCollision) {
  destroyBrick(gameState, brickCollision.brickIndex);
}
```

### Brick Rendering
```javascript
function drawBricks(ctx, bricks) {
  ctx.fillStyle = '#ff4444'; // red
  ctx.strokeStyle = '#cccccc'; // light gray outline
  ctx.lineWidth = 1;
  
  bricks.forEach(brick => {
    if (!brick.active) return; // Skip destroyed bricks
    
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  });
}
```

### Brick Count Display
```javascript
function drawUI(ctx, gameState) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  
  // Draw lives counter
  ctx.fillText(`Lives: ${gameState.lives}`, 20, 30);
  
  // Draw brick count
  ctx.fillText(`Bricks: ${gameState.brickCount}`, gameState.canvasWidth - 150, 30);
  
  // Draw speed display (optional)
  ctx.fillText(`Speed: ${(gameState.speed * 100).toFixed(0)}%`, 
    gameState.canvasWidth / 2 - 40, 30);
}
```

## Data Changes

### Brick Object
```javascript
{
  x: number,           // left edge in pixels
  y: number,           // top edge in pixels
  width: 75,           // fixed
  height: 15,          // fixed
  active: boolean      // true = visible and collidable, false = destroyed
}
```

### Game State Additions
```javascript
{
  brickCount: number   // Number of active bricks (40 initially, decrements to 0)
}
```

## Sequence Flow

### Initial State (Slice 1)
```
gameState.bricks = [ // 40 bricks
  { x: ..., y: ..., width: 75, height: 15, active: true },
  { x: ..., y: ..., width: 75, height: 15, active: true },
  // ... 40 total
]
gameState.brickCount = 40;
```

### Brick Destruction (Slice 3 + Slice 4)
```
Frame N:
- Ball collides with brick at index 5
- checkBrickCollision() returns collision info
- destroyBrick(gameState, 5) called
  - gameState.bricks[5].active = false
  - gameState.brickCount = 39
- Next frame: Renderer skips bricks[5] during drawBricks() loop
- UI displays "Bricks: 39"
```

### Progressive Destruction
```
Frame 0: brickCount = 40 (all visible)
Frame 150: Ball hits 3 bricks
Frame 150+: brickCount = 37 (only 37 visible on screen)
Frame 500: brickCount = 0 (no bricks visible, win condition detected)
```

## Observability Impact

### Logging
- Log brick destruction: `console.log('Brick destroyed. Remaining:', brickCount)`
- Log all bricks destroyed: `console.log('All bricks destroyed! Win condition!')`

### Metrics
- Bricks destroyed per game (diagnostic)
- Destruction rate (bricks per second)
- Progress toward win (brickCount / initial count)

### Visual Feedback
- Brick count display updated in real-time in top-right corner
- Destroyed bricks fade out or disappear instantly (visual choice)
- Optional: Small animation or flash when brick destroyed (enhancement, not MVP)

### Debugging
- Display brickCount prominently in corner
- Log when bricks[i].active changes
- Highlight destroyed bricks with different color (debug mode)

## Testing Strategy

### Unit Tests
- `destroyBrick()` sets active to false
- `destroyBrick()` decrements brickCount correctly
- `destroyBrick()` idempotent (calling twice has no extra effect)
- Renderer skips inactive bricks during draw
- Brick count display updates on destruction

### Integration Tests
- Ball collides with brick → brick destroyed → brickCount decrements
- Multiple sequential brick destructions work correctly
- Destroyed bricks never re-appear
- Brick count reaches 0 when all destroyed
- Win condition triggered when brickCount = 0

### Visual Tests
- Destroyed bricks disappear from screen
- Brick count updates visibly in UI
- All remaining bricks appear correctly positioned
- No visual artifacts during destruction

## Acceptance Criteria Met

✅ Brick destroyed on ball collision
✅ Destroyed brick immediately removed from screen (inactive)
✅ Brick count display updates correctly
✅ Brick count decreases by 1 per destruction
✅ Adjacent bricks remain unaffected
✅ Multiple sequential destructions work correctly
✅ Brick cannot be destroyed twice

## Next Slices

- [Slice 7 — Win/Loss Conditions and Final Integration](../slice-7-win-loss-conditions/slice.md) — Check win condition when brickCount = 0
- [Slice 5 — Game State Management and Transitions](../slice-5-game-state-management/slice.md) — State machine for transitions
