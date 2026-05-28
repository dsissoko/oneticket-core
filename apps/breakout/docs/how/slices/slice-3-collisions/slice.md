# Slice 3 — Paddle, Brick Collisions & Life Management

## Goal

Implement a comprehensive collision detection and response system that handles ball interactions with paddle (bounce with angle variation), bricks (bounce + destruction with callback), and screen bottom (life loss). This slice unifies all collision logic beyond walls, enabling full gameplay mechanics: paddle control response, brick destruction, and life loss conditions.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Ball Physics and Bouncing Mechanics](../../what/epics/epic-0-mvp/user-stories/us-002-ball-physics.md)
- [US-004 — Brick Destruction and Victory Condition](../../what/epics/epic-0-mvp/user-stories/us-004-brick-destruction.md)

## Impacted Components

From `architecture.md`:
- **Physics Engine** — Paddle collision detection and angle calculation, brick collision detection and destruction callback, bottom screen boundary detection (life loss)
- **Game Engine** — Callback integration for brick destruction, life decrement on ball loss
- **Input Handler** — Paddle position input from keyboard (left/right/neutral)
- **Game State Manager** — Life counter management, transitions to defeat state when lives reach 0

## Interfaces

### Input
- Ball object: `{ x, y, vx, vy, radius }`
- Paddle object: `{ x, y, width, height }`
- Bricks array: `[{ x, y, width, height, active: boolean }, ...]`
- Canvas dimensions: `{ width, height }`
- Lives state: `number` (current lives remaining)
- Game state: `'PLAYING'` flag

### Output (Callbacks)
- **Paddle collision**: Ball velocity updated with angle variation
- **Brick collision**: Brick marked inactive (destroyed), ball velocity reversed, destruction callback triggered `onBrickDestroyed(brickIndex)`
- **Bottom boundary**: Lives decremented, ball reset to start position, callback `onLifeLost()`

### Data State Updates
```javascript
// Ball after paddle collision:
ball: {
  vx: <angle-varied velocity>,
  vy: <reversed upward>,
  x: <clamped to paddle area>,
  y: <above paddle surface>
}

// Brick after collision:
bricks[index]: {
  x, y, width, height,
  active: false  // was true before collision
}

// Lives after bottom collision:
lives: <decremented by 1>
ball: { x, y, vx, vy }  // reset to start position
```

## Data Changes

### New Data Structures
1. **Paddle Collision State**
   - Paddle position: `{ x, y, width, height }`
   - Impact zone divisions: left edge (1/3), center (1/3), right edge (1/3)
   - Angle variation factor: multiplier applied to vx based on impact zone
   - Collision flag: whether paddle was hit this frame

2. **Brick Collision State**
   - Active bricks: only `active: true` bricks participate in collision
   - Destroyed bricks: marked `active: false` after collision
   - Collision surface detection: which edge (top, bottom, left, right) was hit

3. **Life Loss State**
   - Bottom boundary threshold: `y > canvasHeight`
   - Lives counter: decremented on each bottom boundary cross
   - Ball reset position: original start position (centered horizontally above paddle)

### No Migrations Required
Runtime collision state only; no persistent storage changes.

## Sequence Flow

### 1. Paddle Collision Detection & Resolution

#### 1a. Check if Ball Intersects Paddle Bounds
- Paddle bounding box: `paddle.x` to `paddle.x + paddle.width`, `paddle.y` to `paddle.y + paddle.height`
- Ball circle: center `(ball.x, ball.y)` with radius `ball.radius`
- AABB circle collision test: check if circle center is within paddle bounds (with radius tolerance)

```javascript
function checkPaddleCollision(ball, paddle) {
  // Simplified AABB-circle collision
  const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
  const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
  
  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  
  return (distX * distX + distY * distY) < (ball.radius * ball.radius);
}
```

#### 1b. Calculate Impact Zone (Left/Center/Right)
- Divide paddle width into 3 equal zones
- Determine which zone the ball's x-coordinate falls into
- Zone assignment:
  - **Left zone** (0–⅓): angle factor = -0.5 (increase leftward vx)
  - **Center zone** (⅓–⅔): angle factor = 0 (no angle, straight bounce)
  - **Right zone** (⅔–1): angle factor = +0.5 (increase rightward vx)

```javascript
function calculatePaddleAngle(ball, paddle) {
  const paddleCenter = paddle.x + paddle.width / 2;
  const ballRelativeX = ball.x - paddleCenter;
  const halfPaddleWidth = paddle.width / 2;
  
  // Map ball position to angle factor (-0.5 to +0.5)
  const angleFactor = (ballRelativeX / halfPaddleWidth) * 0.5;
  return angleFactor;
}
```

#### 1c. Apply Bounce with Angle Variation
- Reverse vertical velocity: `ball.vy = Math.abs(ball.vy)` (upward)
- Apply horizontal angle: `ball.vx += angleFactor * ball.vx`
- Clamp position above paddle: `ball.y = paddle.y - ball.radius`

```javascript
function resolvePaddleCollision(ball, paddle) {
  const angleFactor = calculatePaddleAngle(ball, paddle);
  
  // Bounce upward
  ball.vy = -Math.abs(ball.vy);
  
  // Apply angle variation
  ball.vx += angleFactor * ball.vx;
  
  // Clamp position
  ball.y = paddle.y - ball.radius;
  
  console.log('Paddle collision: angle factor =', angleFactor.toFixed(2));
}
```

### 2. Brick Collision Detection & Resolution

#### 2a. Iterate Over All Active Bricks
- Loop through `bricks` array
- Skip bricks with `active: false`
- Check collision for each active brick

#### 2b. AABB-Circle Collision Test (per brick)
```javascript
function checkBrickCollision(ball, brick) {
  const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
  const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
  
  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  
  return (distX * distX + distY * distY) < (ball.radius * ball.radius);
}
```

#### 2c. Determine Hit Surface
- Calculate which edge of the brick was hit (top, bottom, left, right)
- Compare distances from ball center to each edge
- Example: if `(ball.y - brick.y) < (brick.y + brick.height - ball.y)` → hit top edge

```javascript
function determineBrickSurface(ball, brick) {
  const topDist = Math.abs(ball.y - brick.y);
  const bottomDist = Math.abs(ball.y - (brick.y + brick.height));
  const leftDist = Math.abs(ball.x - brick.x);
  const rightDist = Math.abs(ball.x - (brick.x + brick.width));
  
  const minDist = Math.min(topDist, bottomDist, leftDist, rightDist);
  
  if (minDist === topDist || minDist === bottomDist) {
    return 'VERTICAL'; // reverse vy
  } else {
    return 'HORIZONTAL'; // reverse vx
  }
}
```

#### 2d. Resolve Collision: Bounce + Destroy
```javascript
function resolveBrickCollision(ball, brick, brickIndex) {
  const surface = determineBrickSurface(ball, brick);
  
  // Mark brick as destroyed
  brick.active = false;
  
  // Bounce ball
  if (surface === 'VERTICAL') {
    ball.vy = -ball.vy; // reverse vertical
  } else {
    ball.vx = -ball.vx; // reverse horizontal
  }
  
  // Callback: brick destroyed
  onBrickDestroyed(brickIndex);
  
  console.log('Brick destroyed at index:', brickIndex);
}
```

#### 2e. Callback: Brick Destruction Handler
- Trigger callback `onBrickDestroyed(brickIndex)`
- Update brick count: `activeBrickCount--`
- Check victory condition: if `activeBrickCount === 0`, transition to `VICTORY` state

```javascript
function onBrickDestroyed(brickIndex) {
  activeBrickCount--;
  
  if (activeBrickCount === 0) {
    console.log('All bricks destroyed! Victory!');
    gameState = 'VICTORY';
  }
}
```

### 3. Bottom Boundary Detection & Life Loss

#### 3a. Check if Ball Falls Below Screen
```javascript
function checkBottomBoundary(ball, canvasHeight) {
  return ball.y - ball.radius > canvasHeight;
}
```

#### 3b. Life Loss & Ball Reset
- Decrement lives: `lives--`
- Trigger callback: `onLifeLost()`
- Reset ball position to start (centered horizontally above paddle)

```javascript
function resolveBottomBoundary(ball, paddle, canvasHeight) {
  // Reset ball position
  ball.x = paddle.x + paddle.width / 2;  // centered on paddle
  ball.y = paddle.y - 50;                 // above paddle
  ball.vx = 200; // reset to base velocity
  ball.vy = -300;
  
  // Decrement lives
  lives--;
  
  // Callback
  onLifeLost();
  
  console.log('Life lost! Lives remaining:', lives);
}
```

#### 3c. Callback: Life Loss Handler
- Check defeat condition: if `lives === 0`, transition to `DEFEAT` state
- Continue gameplay if lives > 0

```javascript
function onLifeLost() {
  if (lives === 0) {
    console.log('Game Over!');
    gameState = 'DEFEAT';
  } else {
    console.log('Continue playing. Lives:', lives);
  }
}
```

### 4. Full Collision Update Sequence (Per Frame)

Called once per game loop update when `gameState === 'PLAYING'`:

```javascript
function updateCollisions(ball, paddle, bricks, canvasHeight) {
  // 1. Paddle collision (highest priority)
  if (checkPaddleCollision(ball, paddle)) {
    resolvePaddleCollision(ball, paddle);
    return; // paddle collision excludes brick collisions this frame
  }
  
  // 2. Brick collisions (check all active bricks)
  for (let i = 0; i < bricks.length; i++) {
    if (!bricks[i].active) continue;
    
    if (checkBrickCollision(ball, bricks[i])) {
      resolveBrickCollision(ball, bricks[i], i);
      return; // only one brick collision per frame
    }
  }
  
  // 3. Bottom boundary (life loss)
  if (checkBottomBoundary(ball, canvasHeight)) {
    resolveBottomBoundary(ball, paddle, canvasHeight);
    return;
  }
}
```

## Observability Impact

### Logging
```javascript
// Paddle collision
console.log('Paddle collision detected at X:', ball.x.toFixed(1), 'Impact zone:', zone);

// Brick collision
console.log('Brick collision:', { brickIndex, surface, activeBricksRemaining });

// Bottom boundary
console.log('Ball fell! Lives:', lives, 'Game state:', gameState);

// Victory/Defeat transitions
console.log('Victory! All bricks destroyed.');
console.log('Defeat! No lives remaining.');
```

### Metrics
- Number of paddle collisions per game session
- Number of bricks destroyed (active brick count → 0)
- Number of ball losses (life count decrements)
- Collision detection accuracy (no missed collisions or false positives)

### Error Handling
- Validate ball does not penetrate brick or paddle (clamp position)
- Handle edge case: ball collides with multiple bricks in one frame (process first collision only)
- Handle edge case: paddle position out of bounds (clamp to canvas)
- Log warnings if collision detection takes excessive time

## Acceptance Criteria (from US-002 & US-004)

✅ Ball-paddle collision detected when ball enters paddle bounds
✅ Paddle collision reverses ball vertical velocity (upward bounce)
✅ Ball angle varies based on paddle impact zone (left/center/right)
✅ Left paddle edge increases leftward ball velocity
✅ Right paddle edge increases rightward ball velocity
✅ Center paddle hit produces straight (no angle) bounce
✅ Ball-brick collision detected for all active bricks
✅ Brick marked inactive (destroyed) on collision
✅ Ball bounces off brick with correct velocity reversal
✅ Brick destruction callback triggered on collision
✅ Victory condition checked after each brick destruction
✅ Ball falls below screen boundary (y > canvasHeight)
✅ Life decremented on bottom boundary cross
✅ Ball reset to start position after life loss
✅ Defeat condition checked when lives reach 0
✅ Game state transitions to VICTORY or DEFEAT as appropriate
✅ No collision overlaps or tunneling
✅ Console logs show collision events (no errors)

## Technical Notes

### Collision Detection Strategy
- **AABB-Circle collision**: Simple, fast, suitable for arcade game
- **Per-frame priority**: Paddle > Bricks > Bottom boundary (process one collision per frame)
- **O(n) complexity**: Check all bricks each frame (linear scan acceptable for small n)

### Velocity Reversal Rules
- **Paddle**: Reverse vy (vertical), modify vx (horizontal) based on angle zone
- **Brick (vertical surface)**: Reverse vy only
- **Brick (horizontal surface)**: Reverse vx only
- **Bottom boundary**: No velocity change, just reset position

### Angle Variation Calculation
- **Formula**: `angleFactor = (ballRelativeX / halfPaddleWidth) * 0.5`
- **Range**: -0.5 (far left) to +0.5 (far right)
- **Application**: `vx += angleFactor * vx` (scales existing horizontal velocity)
- **Effect**: Creates responsive, skill-based paddle control without extreme angle swings

### Brick Surface Detection
- **Distance-based**: Find closest edge of brick to ball center
- **Vertical surfaces** (top/bottom): Reverse vy
- **Horizontal surfaces** (left/right): Reverse vx
- **Robustness**: Handles grazing collisions and corners gracefully

### Ball Reset Position
- **X coordinate**: Centered on paddle horizontally (`paddle.x + paddle.width / 2`)
- **Y coordinate**: Above paddle (`paddle.y - 50` or similar offset)
- **Velocity**: Reset to base velocity (e.g., vx=200, vy=-300) scaled by speed multiplier
- **Prevents immediate re-collision**: Adequate spacing prevents immediate re-loss

## Dependencies and Ordering

**This slice depends on:**
- [Slice 1 — Game Setup](../slice-1-game-setup/slice.md) (initialized ball, paddle, bricks objects)
- [Slice 2 — Ball Physics and Wall Collision](../slice-2-ball-physics/slice.md) (ball movement and wall bounces)
- Paddle input (from US-003, separate slice)

**This slice enables:**
- [Slice 5 — Game State Machine and Menus](../slice-5-game-states/slice.md) (transitions to VICTORY/DEFEAT)
- [Slice 6 — Life Tracking and Victory/Defeat Conditions](../slice-6-life-tracking/slice.md) (life display and end-game logic)

**Can be implemented in parallel with:**
- Paddle rendering and input (independent collision system)

## Implementation Checklist

- [ ] Implement `checkPaddleCollision(ball, paddle)` function
- [ ] Implement `calculatePaddleAngle(ball, paddle)` to determine impact zone
- [ ] Implement `resolvePaddleCollision(ball, paddle)` with angle variation
- [ ] Implement `checkBrickCollision(ball, brick)` function
- [ ] Implement `determineBrickSurface(ball, brick)` function
- [ ] Implement `resolveBrickCollision(ball, brick, brickIndex)` function
- [ ] Implement `onBrickDestroyed(brickIndex)` callback handler
- [ ] Implement `checkBottomBoundary(ball, canvasHeight)` function
- [ ] Implement `resolveBottomBoundary(ball, paddle, canvasHeight)` function
- [ ] Implement `onLifeLost()` callback handler
- [ ] Implement `updateCollisions(ball, paddle, bricks, canvasHeight)` frame-loop integration
- [ ] Test paddle collision with all three impact zones
- [ ] Test brick collision with multiple bricks
- [ ] Test bottom boundary and life loss
- [ ] Test victory condition (all bricks destroyed)
- [ ] Test defeat condition (no lives remaining)
- [ ] Verify no collision overlaps or penetration
- [ ] Verify callbacks fire correctly
- [ ] Console logs show all collision events (no errors)
- [ ] Manual gameplay testing: verify ball bounces as expected in all scenarios
