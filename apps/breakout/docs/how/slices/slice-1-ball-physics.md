# Slice 1 — Ball Physics and Collision

## Overview

This slice implements the core ball physics engine and collision detection system. It adds velocity-based movement for the ball, detects all collision types (walls, ceiling, paddle, bricks, floor), resolves collisions with appropriate velocity reversals, and prevents tunneling through obstacles.

## Related User Stories

- **US-002** — Ball Physics and Collision: Ball bounces realistically on bricks, walls, ceiling, and paddle

## Technical Components to Implement

### 1. Enhanced Physics Module (`js/physics.js` - extension)

**Purpose:** Update ball and paddle positions based on velocity and delta time.

**Responsibilities:**
- Update ball position: `x += vx * dt`, `y += vy * dt`
- Update paddle position based on input velocity
- Clamp paddle to screen bounds
- Apply speed multiplier to ball velocity
- Handle initial ball velocity setup

**Key Methods:**
```javascript
class Physics {
  constructor(gameState) {
    this.gameState = gameState;
    this.ballSpeed = 200; // pixels per second (initial)
  }
  
  update(deltaTime) {
    // Update ball position
    this.gameState.ball.x += this.gameState.ball.vx * deltaTime;
    this.gameState.ball.y += this.gameState.ball.vy * deltaTime;
    
    // Update paddle position
    this.gameState.paddle.x += this.gameState.paddle.vx * deltaTime;
    
    // Clamp paddle to bounds
    this.clampPaddleToBounds();
  }
  
  applySpeedMultiplier(multiplier) {
    // Scale ball velocity by factor (0.5 - 2.0)
  }
  
  initializeBallVelocity() {
    // Set initial ball velocity (angle ~45 degrees upward)
    const angle = Math.PI / 4; // 45 degrees
    const speed = this.ballSpeed;
    this.gameState.ball.vx = speed * Math.cos(angle);
    this.gameState.ball.vy = -speed * Math.sin(angle);
  }
  
  clampPaddleToBounds() {
    const { paddle } = this.gameState;
    const canvasWidth = 800; // From renderer or config
    paddle.x = Math.max(paddle.width / 2, Math.min(paddle.x, canvasWidth - paddle.width / 2));
  }
}
```

### 2. Enhanced Collision Detector Module (`js/collisionDetector.js`)

**Purpose:** Detects and resolves all collision types with priority ordering.

**Responsibilities:**
- Check floor collision (ball lost)
- Check brick collision (destroy brick, reflect ball)
- Check paddle collision (angle-dependent reflection)
- Check wall/ceiling collision (simple reflection)
- Prevent tunneling (resolve only one collision per frame)
- Return collision event type for state updates

**Key Methods:**
```javascript
class CollisionDetector {
  constructor(gameState) {
    this.gameState = gameState;
  }
  
  detectAndResolve(gameState) {
    const { ball, paddle, bricks } = gameState;
    
    // Priority 1: Floor collision (ball lost)
    if (this.checkFloorCollision(ball)) {
      return { type: 'ball-lost', data: {} };
    }
    
    // Priority 2: Brick collision
    const brickHit = this.checkBrickCollision(ball, bricks);
    if (brickHit) {
      this.reflectBall(ball, brickHit.side);
      gameState.removeBrick(brickHit.brick.id);
      return { type: 'brick-destroyed', data: { brick: brickHit.brick } };
    }
    
    // Priority 3: Paddle collision
    if (this.checkPaddleCollision(ball, paddle)) {
      this.reflectBallFromPaddle(ball, paddle);
      return { type: 'paddle-bounce', data: {} };
    }
    
    // Priority 4: Wall/ceiling collision
    if (this.checkWallCollision(ball)) {
      this.reflectBall(ball, 'vertical');
    }
    if (this.checkCeilingCollision(ball)) {
      this.reflectBall(ball, 'horizontal');
    }
    
    return { type: 'none', data: {} };
  }
  
  checkFloorCollision(ball) {
    // Ball below play area (y > canvas height)
    return ball.y > 600 + ball.radius;
  }
  
  checkBrickCollision(ball, bricks) {
    // AABB collision detection
    for (const brick of bricks) {
      if (this.intersectsCircleRect(ball, brick)) {
        // Determine which side was hit
        const side = this.detectCollisionSide(ball, brick);
        return { brick, side };
      }
    }
    return null;
  }
  
  checkPaddleCollision(ball, paddle) {
    // Circle-rect collision
    return this.intersectsCircleRect(ball, paddle);
  }
  
  checkWallCollision(ball) {
    return ball.x - ball.radius < 0 || ball.x + ball.radius > 800;
  }
  
  checkCeilingCollision(ball) {
    return ball.y - ball.radius < 0;
  }
  
  intersectsCircleRect(ball, rect) {
    // Find closest point on rect to circle center
    const closestX = Math.max(rect.x - rect.width/2, Math.min(ball.x, rect.x + rect.width/2));
    const closestY = Math.max(rect.y - rect.height/2, Math.min(ball.y, rect.y + rect.height/2));
    
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    
    return (dx * dx + dy * dy) < (ball.radius * ball.radius);
  }
  
  detectCollisionSide(ball, rect) {
    // Determine which side of rect the ball hit (top, bottom, left, right)
    const overlapLeft = (ball.x + ball.radius) - (rect.x - rect.width/2);
    const overlapRight = (rect.x + rect.width/2) - (ball.x - ball.radius);
    const overlapTop = (ball.y + ball.radius) - (rect.y - rect.height/2);
    const overlapBottom = (rect.y + rect.height/2) - (ball.y - ball.radius);
    
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    
    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
      return minOverlap === overlapLeft ? 'left' : 'right';
    } else {
      return minOverlap === overlapTop ? 'top' : 'bottom';
    }
  }
  
  reflectBall(ball, side) {
    // Simple reflection based on collision side
    if (side === 'left' || side === 'right') {
      ball.vx = -ball.vx;
    } else if (side === 'top' || side === 'bottom') {
      ball.vy = -ball.vy;
    }
  }
  
  reflectBallFromPaddle(ball, paddle) {
    // Angle-dependent reflection based on impact position
    // Impact position relative to paddle center: [-1, 1]
    const impactPos = (ball.x - paddle.x) / (paddle.width / 2);
    const clampedImpact = Math.max(-1, Math.min(1, impactPos));
    
    // Center hit: straight up; edges: angled
    const angle = clampedImpact * (Math.PI / 3); // ±60 degrees max
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    
    ball.vx = speed * Math.sin(angle);
    ball.vy = -speed * Math.cos(angle); // Always upward
  }
}
```

### 3. Game Loop Integration (`js/gameLoop.js` - enhancement)

**Purpose:** Integrate collision detection into main loop.

**Responsibilities:**
- Call `collisionDetector.detectAndResolve()` after physics update
- Handle collision events (ball-lost, brick-destroyed)
- Update game state based on collision results

**Integration Point:**
```javascript
run(timestamp) {
  if (!this.lastTimestamp) this.lastTimestamp = timestamp;
  const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
  this.lastTimestamp = timestamp;
  
  this.inputHandler.update();
  this.physics.update(deltaTime);
  
  // NEW: Collision detection
  const collision = this.collisionDetector.detectAndResolve(this.gameState);
  if (collision.type === 'ball-lost') {
    this.handleBallLost();
  } else if (collision.type === 'brick-destroyed') {
    this.checkWinCondition();
  }
  
  this.renderer.draw(this.gameState);
  this.checkGameState();
  
  if (this.gameState.phase === 'playing') {
    requestAnimationFrame((t) => this.run(t));
  }
}

handleBallLost() {
  this.gameState.decrementLives();
  if (this.gameState.isGameOver()) {
    this.gameState.setPhase('gameover');
  } else {
    // Reset ball position
    this.resetBallPosition();
  }
}

resetBallPosition() {
  const { ball, paddle } = this.gameState;
  ball.x = paddle.x;
  ball.y = paddle.y - 30;
  this.physics.initializeBallVelocity();
}

checkWinCondition() {
  if (this.gameState.bricks.length === 0) {
    this.gameState.setPhase('victory');
  }
}
```

## Dependencies & Technical Sequence

```
Slice 0 (Game Foundation)
    ↓
Slice 1 (Ball Physics & Collision)
    ├── Depends: GameState, Physics, Renderer, GameLoop
    ├── Extends: physics.js, collisionDetector.js, gameLoop.js
    └── Integrates: Collision events into game state
```

## Target Files

```
apps/breakout/
├── js/
│   ├── physics.js           (enhanced with velocity initialization)
│   ├── collisionDetector.js (new - implements all collision types)
│   └── gameLoop.js          (enhanced with collision handling)
```

## Collision Resolution Algorithm

```
Frame Loop:
  1. Update ball position (physics)
  2. Detect collision type in priority order
  3. If collision found:
     a. Reflect ball velocity (or apply paddle formula)
     b. Handle game state changes (destroy brick, decrement lives)
     c. Return collision event
  4. Return to rendering (no further collisions this frame)
```

## Acceptance Criteria

- **Criterion 1** — When ball hits side wall, horizontal velocity inverts and ball stays in bounds
- **Criterion 2** — When ball hits ceiling, vertical velocity inverts and ball stays in bounds
- **Criterion 3** — When ball hits paddle, it bounces upward with angle dependent on impact position
- **Criterion 4** — When ball hits brick, brick is destroyed and ball bounces away
- **Criterion 5** — Only one collision is resolved per frame (no multi-hit tunneling)
- **Criterion 6** — Ball position and velocity update at each frame (60 FPS)
- **Criterion 7** — Collision detection is sufficiently precise to prevent tunneling

## Testing Strategy

### Unit Tests
- Floor collision detection correctly identifies ball below play area
- Brick collision detection identifies intersections
- Paddle collision detection works with various ball positions
- Velocity reflection calculations produce correct new velocities
- Angle-dependent paddle reflection produces expected trajectories

### Integration Tests
- Ball bounces correctly through walls, ceiling, paddle, bricks in sequence
- Brick removal updates game state correctly
- Ball lost event triggers life decrement
- Win condition detects when all bricks are destroyed

### Manual Testing
- Play game and observe ball behavior
- Visually verify bounces are realistic and not stuck
- Confirm ball never tunnels through obstacles
- Test paddle reflection at center and edges
- Destroy all bricks to confirm win condition

## Implementation Notes

1. **Ball Speed:** Default 200 pixels/second (adjustable via speedMultiplier)
2. **Collision Detection Precision:** Use AABB for bricks/paddle, circle-rect for accuracy
3. **Reflection Formula:** Mirror velocity component perpendicular to surface
4. **Paddle Angle Formula:** `angle = impactPos * ±60°`, where impactPos is normalized [-1, 1]
5. **Frame Delta Time:** Calculate from requestAnimationFrame timestamps (milliseconds to seconds)
6. **Floating Point:** Use standard JavaScript numbers; no special precision handling needed

## Related Slices

- **Slice 0** — Game Foundation (prerequisite)
- **Slice 2** — Paddle Control (paddle input affects paddle position, which collides)
- **Slice 3** — Lives System (ball-lost event decrements lives)
- **Slice 4** — Victory Menu (brick-destroyed and win condition triggers)

---

**Status:** Ready for implementation  
**Priority:** High (critical for core gameplay)  
**Estimated Effort:** 3-4 days
