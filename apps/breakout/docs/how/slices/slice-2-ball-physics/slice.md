# Slice 2 — Ball Physics Engine

## Goal

Implement ball motion physics with constant velocity and bouncing off walls and ceiling. The ball moves in a straight line each frame, bounces off vertical walls (left/right) and the ceiling (top) by reversing the appropriate velocity component.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Ball Physics and Collision Detection](../../what/epics/epic-0-mvp/user-stories/us-002-ball-physics.md)
- [US-007 — Speed Slider Control for Ball Velocity](../../what/epics/epic-0-mvp/user-stories/us-007-speed-control.md)

## Impacted Components

From [Architecture](../architecture.md):
- **Physics Engine** — Ball position update, wall bounce, ceiling bounce, speed multiplier
- **Renderer** — Ball draw (already implemented in Slice 1)
- **Game State** — Ball position and velocity

## Interfaces

### Ball Update
```javascript
function updateBallPhysics(ball, bounds, speed) {
  // Update position based on velocity
  ball.x += ball.vx;
  ball.y += ball.vy;
  
  // Apply wall bounces
  if (ball.x - ball.radius < bounds.left) {
    ball.x = ball.radius;
    ball.vx = -ball.vx; // bounce right
  }
  if (ball.x + ball.radius > bounds.right) {
    ball.x = bounds.right - ball.radius;
    ball.vx = -ball.vx; // bounce left
  }
  
  // Apply ceiling bounce
  if (ball.y - ball.radius < bounds.top) {
    ball.y = ball.radius;
    ball.vy = -ball.vy; // bounce down
  }
  
  // Check out of bounds (bottom) — handled in collision detector
  if (ball.y > bounds.bottom) {
    return { outOfBounds: true };
  }
  
  return { outOfBounds: false };
}
```

### Speed Multiplier
```javascript
function updateBallSpeed(ball, sliderValue) {
  // sliderValue: 0–100 (from UI slider)
  const speedMultiplier = 0.5 + (sliderValue / 100) * 2.5; // 0.5x to 3x
  
  // Get current velocity magnitude and direction
  const magnitude = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  if (magnitude === 0) return; // Ball at rest (initial state)
  
  const angle = Math.atan2(ball.vy, ball.vx);
  
  // Calculate base velocity (at 1x speed, magnitude = 4 px/frame)
  const baseSpeed = 4;
  const newMagnitude = baseSpeed * speedMultiplier;
  
  // Apply new magnitude
  ball.vx = newMagnitude * Math.cos(angle);
  ball.vy = newMagnitude * Math.sin(angle);
}
```

### Launch Ball from Paddle
```javascript
function launchBallFromPaddle(ball, paddle, initialSpeed) {
  // Position ball above center of paddle
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - 20;
  
  // Initial velocity: upward at initial speed
  const speedMultiplier = 0.5 + (initialSpeed / 100) * 2.5;
  const baseSpeed = 4;
  const magnitude = baseSpeed * speedMultiplier;
  
  ball.vx = 0; // launch straight up
  ball.vy = -magnitude; // negative = upward
}
```

## Data Changes

### Ball Object Schema
```javascript
{
  x: number,      // center x in pixels
  y: number,      // center y in pixels
  vx: number,     // velocity x component (pixels per frame)
  vy: number,     // velocity y component (pixels per frame)
  radius: 4       // fixed
}
```

### Speed Slider Values
- **Range**: 0 (very slow) to 100 (very fast)
- **Speed Multiplier**: 0.5x to 3x
- **Base Speed**: 4 pixels per frame (at 1x multiplier)
- **Min Velocity**: 2 px/frame (0.5x)
- **Max Velocity**: 12 px/frame (3x) — magnitude, not component

## Sequence Flow

### Game Start (from Menu → Active)
```
1. Game State: speed slider value = 50 (medium, 1.5x)
2. Game Engine calls launchBallFromPaddle(ball, paddle, 50)
3. Ball position set to center-above paddle
4. Ball velocity set to (0, -6) — straight up at 1.5x speed
5. Physics engine ready to update on next frame
```

### Each Frame During Active State
```
1. updateBallPhysics(ball, bounds, speed) called
2. Ball position updated: x += vx; y += vy
3. Wall bounce check:
   - If x - radius < 0: set x = radius; negate vx
   - If x + radius > 800: set x = 800 - radius; negate vx
4. Ceiling bounce check:
   - If y - radius < 0: set y = radius; negate vy
5. Out of bounds check:
   - If y > 600: return {outOfBounds: true}
6. Collision detector runs (next slice)
7. Renderer draws ball at new position
```

### Speed Adjustment During Play
```
1. Player moves speed slider from 50 to 75
2. Input handler captures slider change
3. updateBallSpeed(ball, 75) called
4. Current angle preserved: angle = atan2(vy, vx)
5. New magnitude calculated: 4 * (0.5 + 75/100 * 2.5) = 10 px/frame
6. New velocity: vx = 10 * cos(angle); vy = 10 * sin(angle)
7. Ball continues on same trajectory at faster speed
```

## Observability Impact

### Logging
- Log ball velocity on launch: `console.log('Ball launched with speed:', magnitude, 'px/frame')`
- Log wall bounces (debug): `console.log('Wall bounce:', ball.x, ball.y)`
- Log ceiling bounce (debug): `console.log('Ceiling bounce at y=', ball.y)`
- Log speed changes: `console.log('Speed updated to', speedMultiplier, 'x')`

### Metrics
- Frame update time for physics (should be < 1ms)
- Ball velocity magnitude (observable in debug UI or logs)
- Bounce count per game (diagnostic)

### Debugging
- Display ball position and velocity in corner (optional debug mode)
- Display velocity vector as arrow from ball (optional)
- Log collision detections vs bounces

## Testing Strategy

### Unit Tests
- `updateBallPhysics()` increments position correctly each frame
- Wall bounce reverses vx, preserves vy
- Ceiling bounce reverses vy, preserves vx
- Ball never passes through boundaries (position clamped)
- `updateBallSpeed()` preserves direction angle
- Speed multiplier correct for all slider values
- `launchBallFromPaddle()` positions ball above center, sets velocity straight up

### Integration Tests
- Ball moves continuously in Active state
- Ball bounces off all four boundaries (walls × 2, ceiling × 1)
- Multiple bounces in sequence work correctly
- Speed changes mid-flight work correctly
- Out of bounds detection triggers correctly

### Visual Tests
- Ball visible moving across screen
- Bounces appear smooth and realistic
- Speed slider changes ball speed noticeably
- No jittering or visual glitches

## Acceptance Criteria Met

✅ Ball moves with constant velocity each frame
✅ Ball bounces off left wall (vx reversed)
✅ Ball bounces off right wall (vx reversed)
✅ Ball bounces off ceiling (vy reversed)
✅ Ball speed proportional to slider setting (0.5x to 3x)
✅ Velocity magnitude updated immediately when slider changes
✅ Direction of motion preserved during speed changes
✅ Out of bounds detection triggers when y > canvas height

## Next Slices

- [Slice 3 — Collision Detection System](../slice-3-collision-detection/slice.md) — Detect collisions with paddle and bricks
- [Slice 7 — Win/Loss Conditions](../slice-7-win-loss-conditions/slice.md) — Handle out of bounds
