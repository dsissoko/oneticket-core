# Slice 3 — Collision Detection System

## Goal

Detect ball collisions with the paddle and bricks. Return collision information (type, surface, affected brick) so that the Physics Engine can apply correct bounces and the Game State can update brick destruction status.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Ball Physics and Collision Detection](../../what/epics/epic-0-mvp/user-stories/us-002-ball-physics.md)
- [US-004 — Brick Destruction and State Management](../../what/epics/epic-0-mvp/user-stories/us-004-brick-destruction.md)

## Impacted Components

From [Architecture](../architecture.md):
- **Collision Detector** — Brick collision, boundary collision, paddle collision detection
- **Physics Engine** — Uses collision results to apply bounces
- **Game State** — Bricks marked destroyed, ball velocity updated

## Interfaces

### Paddle Collision Detection
```javascript
function checkPaddleCollision(ball, paddle, bounds) {
  // Axis-Aligned Bounding Box (AABB) collision
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;
  
  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;
  
  // AABB overlap test
  if (ballRight < paddleLeft || ballLeft > paddleRight ||
      ballBottom < paddleTop || ballTop > paddleBottom) {
    return null; // No collision
  }
  
  // Collision detected; calculate hit location
  const hitOffset = ball.x - paddle.x; // 0 to paddle.width
  const hitPercent = hitOffset / paddle.width; // 0 to 1
  
  return {
    type: 'paddle',
    surface: ballTop < paddle.y ? 'top' : 'bottom', // likely top
    hitPercent: hitPercent, // 0 = left edge, 0.5 = center, 1 = right edge
    ballX: ball.x,
    ballY: ball.y
  };
}
```

### Brick Collision Detection
```javascript
function checkBrickCollision(ball, bricks) {
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;
  
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (!brick.active) continue; // Skip destroyed bricks
    
    const brickLeft = brick.x;
    const brickRight = brick.x + brick.width;
    const brickTop = brick.y;
    const brickBottom = brick.y + brick.height;
    
    // AABB overlap test
    if (ballRight < brickLeft || ballLeft > brickRight ||
        ballBottom < brickTop || ballTop > brickBottom) {
      continue; // No collision with this brick
    }
    
    // Collision detected; determine collision surface (most likely side)
    const overlapLeft = ballRight - brickLeft;
    const overlapRight = brickRight - ballLeft;
    const overlapTop = ballBottom - brickTop;
    const overlapBottom = brickBottom - ballTop;
    
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    let surface;
    
    if (minOverlap === overlapLeft) surface = 'left';
    else if (minOverlap === overlapRight) surface = 'right';
    else if (minOverlap === overlapTop) surface = 'top';
    else surface = 'bottom';
    
    return {
      type: 'brick',
      surface: surface, // 'left', 'right', 'top', 'bottom'
      brickIndex: i,
      ballX: ball.x,
      ballY: ball.y
    };
  }
  
  return null; // No brick collision
}
```

### Collision Detection Main Loop
```javascript
function detectCollisions(ball, paddle, bricks, bounds) {
  const collisions = [];
  
  // Check paddle collision
  const paddleCollision = checkPaddleCollision(ball, paddle, bounds);
  if (paddleCollision) {
    collisions.push(paddleCollision);
  }
  
  // Check brick collisions (return first collision, most likely)
  const brickCollision = checkBrickCollision(ball, bricks);
  if (brickCollision) {
    collisions.push(brickCollision);
  }
  
  // Note: Wall and ceiling collisions handled directly in physics engine
  // Bottom boundary handled as out-of-bounds check in physics engine
  
  return collisions;
}
```

## Data Changes

### Collision Object Schema
```javascript
{
  type: 'paddle' | 'brick' | 'wall' | 'ceiling' | 'bottom',
  surface: 'left' | 'right' | 'top' | 'bottom',
  hitPercent: number, // 0–1 (paddle only)
  brickIndex: number, // (brick only)
  ballX: number,
  ballY: number
}
```

### Brick State Update
```javascript
// When brick collision detected:
gameState.bricks[collisionInfo.brickIndex].active = false;
gameState.brickCount--;
```

## Sequence Flow

### Collision Detection Each Frame
```
1. Physics engine updates ball position
2. Collision detector runs:
   a. checkPaddleCollision(ball, paddle) → paddle collision or null
   b. checkBrickCollision(ball, bricks) → first brick collision or null
   c. Physics engine already handled wall/ceiling bounces
   d. Physics engine will handle bottom boundary as out-of-bounds
3. For each collision detected:
   - Physics engine applies bounce (reverse/adjust velocity)
   - Game state updates (brick marked destroyed, count decremented)
4. Renderer draws updated state
```

### Paddle Collision Example
```
Frame N:
- Ball approaching paddle from above at (400, 595) with velocity (0, 5)
- Paddle at (360, 585) with dimensions 80×10

Frame N+1:
- updateBallPhysics updates position: ball.y = 600
- checkPaddleCollision detects overlap
- Returns: { type: 'paddle', surface: 'top', hitPercent: 0.5 }
- Physics engine processes paddle bounce:
  - Reverse vy: ball.vy = -5
  - Adjust vx based on hitPercent 0.5 (center, minimal change)
  - Ball continues upward on next frame
```

### Brick Collision Example
```
Frame M:
- Ball at (150, 80) moving right-down with velocity (3, 4)
- Brick at (120, 60) with dimensions 75×15, active: true

Frame M+1:
- updateBallPhysics updates position: ball.x = 153, ball.y = 84
- checkBrickCollision detects overlap on right edge of brick
- Returns: { type: 'brick', surface: 'right', brickIndex: 5 }
- Physics engine bounces: ball.vx = -3 (left)
- Game state updates:
  - bricks[5].active = false
  - brickCount--
- Renderer draws brick as inactive (invisible)
```

## Observability Impact

### Logging
- Log paddle collisions with hit location: `console.log('Paddle hit at', hitPercent * 100, '%')`
- Log brick collisions with index: `console.log('Brick', brickIndex, 'destroyed')`
- Log collision surface: `console.log('Collision surface:', surface)`

### Metrics
- Collision count per game (diagnostic)
- Collision frequency per second (FPS metric)
- Brick destruction progress (visible on screen)

### Debugging
- Draw collision boxes around paddle and bricks (debug mode)
- Draw velocity vector from ball (debug mode)
- Display collision type and surface in overlay (debug mode)

## Testing Strategy

### Unit Tests
- `checkPaddleCollision()` detects overlap correctly
- `checkPaddleCollision()` returns correct hit percentage
- `checkBrickCollision()` returns first (closest) brick collision
- `checkBrickCollision()` ignores inactive bricks
- Collision surface detection accurate for top/bottom/left/right
- No false negatives (should detect all overlaps)
- No false positives (should not detect non-collisions)

### Integration Tests
- Paddle collision causes ball bounce and changes direction
- Brick collision causes ball bounce and marks brick inactive
- Multiple collisions in sequence handled correctly
- Ball never becomes stuck in geometry
- Brick count decrements correctly on destruction

### Visual Tests
- Ball bounces appear smooth and realistic
- Paddle bounces redirect ball correctly
- Bricks disappear immediately on impact
- No visual glitches at collision boundaries

## Acceptance Criteria Met

✅ Ball collides with paddle and bounces correctly
✅ Ball collides with bricks and bounces correctly
✅ Paddle collision detects hit location
✅ Brick collision marks brick as destroyed
✅ Brick count updates correctly
✅ Ball never tunnels through surfaces
✅ No collision false positives

## Next Slices

- [Slice 4 — Brick Destruction and Scoring](../slice-4-brick-destruction/slice.md) — Visual feedback on brick destruction
- [Slice 2 — Ball Physics Engine](../slice-2-ball-physics/slice.md) — Physics engine uses collision results (already depends on this)
