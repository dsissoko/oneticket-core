# Slice 2 — Ball Physics and Wall Collision

## Goal

Implement the complete ball physics system including continuous movement via game loop with `requestAnimationFrame`, velocity-based position updates, and elastic bouncing behavior off all walls (left, right, ceiling). This slice delivers the core mechanical foundation for responsive ball movement and wall collision handling.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Ball Physics and Bouncing Mechanics](../../what/epics/epic-0-mvp/user-stories/us-002-ball-physics.md)

## Impacted Components

From `architecture.md`:
- **Game Engine** — Game loop using `requestAnimationFrame`, state transitions (MENU → PLAYING)
- **Physics Engine** — Ball position updates, velocity calculations, wall collision detection and resolution
- **Rendering** — Ball rendering on each frame update

## Interfaces

### Input
- Game state: `PLAYING` flag (from Game State Manager)
- Ball object: `{ x, y, vx, vy, radius }`
- Canvas dimensions: width, height
- Speed multiplier from settings: affects initial ball velocity

### Output (Rendered)
- Ball positioned and drawn at updated (x, y) on every animation frame
- Smooth, continuous movement across canvas at 60 FPS

### Data State Updates
```javascript
// Before each frame:
ball: {
  x: <updated position>,
  y: <updated position>,
  vx: <velocity component, may reverse on wall hit>,
  vy: <velocity component, may reverse on ceiling hit>,
  radius: 5
}
```

## Data Changes

### New Data Structures
1. **Ball Physics State**
   - Position: (x, y) updated every frame
   - Velocity: (vx, vy) components in pixels/second
   - Radius: collision boundary (typically 5px)
   - Speed multiplier: factor applied to base velocity from settings

2. **Wall Collision State**
   - Canvas boundaries: (0, 0) to (width, height)
   - Wall positions: left (0), right (width), top/ceiling (0)
   - Collision detection state: which walls are active

3. **Game Loop Timing**
   - Last frame timestamp
   - Delta time: time elapsed since last frame (in seconds)
   - Frame rate target: 60 FPS (16.67ms per frame)

### No Migrations Required
This is runtime physics state only; no persistent storage changes.

## Sequence Flow

### 1. Game State Transition
- User clicks "Start Game" from main menu
- Game state transitions from `MENU` to `PLAYING`
- Ball velocity is initialized with non-zero values (e.g., vx = 200, vy = -300, adjusted by speed multiplier)

### 2. Game Loop Initialization
- Register `gameLoop` callback with `requestAnimationFrame`
- Store initial timestamp from first frame
- Initialize `lastTime` variable

### 3. Per-Frame Update Sequence

#### 3a. Calculate Delta Time
```javascript
const deltaTime = (currentTime - lastTime) / 1000; // convert ms to seconds
lastTime = currentTime;
```

#### 3b. Update Ball Position
```javascript
ball.x += ball.vx * deltaTime;
ball.y += ball.vy * deltaTime;
```

#### 3c. Detect and Resolve Wall Collisions
- **Left wall collision** (ball.x - radius < 0):
  - Clamp position: `ball.x = ball.radius`
  - Reverse horizontal velocity: `ball.vx = Math.abs(ball.vx)` (move right)

- **Right wall collision** (ball.x + radius > canvasWidth):
  - Clamp position: `ball.x = canvasWidth - ball.radius`
  - Reverse horizontal velocity: `ball.vx = -Math.abs(ball.vx)` (move left)

- **Ceiling collision** (ball.y - radius < 0):
  - Clamp position: `ball.y = ball.radius`
  - Reverse vertical velocity: `ball.vy = Math.abs(ball.vy)` (move down)

#### 3d. Render Ball
```javascript
// Draw ball at current (x, y) position
ctx.fillStyle = '#fff'; // white ball
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
ctx.fill();
```

#### 3e. Schedule Next Frame
```javascript
requestAnimationFrame(gameLoop);
```

### 4. Game Loop Lifecycle
- Continues calling itself via `requestAnimationFrame` while game state is `PLAYING`
- Pauses (stops updating physics) when state transitions to menu, victory, or defeat
- Resumes physics updates when returning to `PLAYING`

## Observability Impact

### Logging
Add console logging for development debugging:
```javascript
console.log('Game loop started at:', timestamp);
console.log('Ball updated position:', { x: ball.x, y: ball.y });
console.log('Wall collision detected:', 'left' | 'right' | 'ceiling');
console.log('Ball velocity after bounce:', { vx: ball.vx, vy: ball.vy });
console.log('Delta time:', deltaTime.toFixed(3), 'seconds');
```

### Metrics
- Frame time per update cycle (should be close to 16.67ms for 60 FPS)
- Number of collision checks per frame
- Physics simulation accuracy (no ball tunneling through walls)

### Error Handling
- Gracefully handle zero or negative `deltaTime` (clamp to minimum)
- Log warnings if frame rate drops significantly below 60 FPS
- Validate ball position stays within bounds after collision resolution

## Acceptance Criteria (from US-002)

✅ Game loop runs at ~60 FPS using `requestAnimationFrame`
✅ Ball position updates smoothly every frame based on velocity and delta time
✅ Ball bounces off left wall (horizontal velocity reverses)
✅ Ball bounces off right wall (horizontal velocity reverses)
✅ Ball bounces off ceiling (vertical velocity reverses)
✅ Ball position does not penetrate or get stuck in walls
✅ Speed slider value correctly multiplies initial ball velocity
✅ Smooth continuous movement with no visible jittering or frame skips
✅ Collision detection responds immediately on wall contact
✅ Physics updates only occur when game state is `PLAYING`
✅ Console logs show no errors or warnings during gameplay

## Technical Notes

### Physics Calculations
- **Position update formula**: `position += velocity * deltaTime`
- **Velocity direction**: Positive X = rightward, negative X = leftward; positive Y = downward, negative Y = upward
- **Bounce behavior**: Reverse velocity component perpendicular to wall surface

### Collision Detection Strategy
- **Axis-aligned bounding box (AABB)** with circle radius
- Ball center at (x, y) with radius r collides when:
  - Left: `x - r < 0`
  - Right: `x + r > width`
  - Ceiling: `y - r < 0`

### Delta Time Handling
- Essential for frame-rate independent physics
- Handles variable frame rates gracefully
- Prevents ball from moving too far in a single frame (no tunneling)

### Speed Multiplier Integration
- Retrieve multiplier from settings: `speedMult` (range: 0.5 to 2.0)
- Apply to initial velocity: `initialVelocity * speedMult`
- Allows difficulty adjustment without code changes

### Wall Positions
- All walls are canvas edges
- No wall objects in data structure — just boundary checks
- Collision detection is O(1) for all wall collisions

## Dependencies and Ordering

**This slice depends on:**
- [Slice 1 — Game Setup](../slice-1-game-setup/slice.md) (for initialized ball object and canvas)
- Architecture definition of game loop and physics engine

**This slice enables:**
- [Slice 3 — Paddle Rendering and Keyboard Input](../slice-3-paddle-input/slice.md) (paddle input needed for paddle collision)
- [Slice 4 — Brick Grid and Ball-Brick Collision](../slice-4-brick-collision/slice.md) (ball physics needed before brick collision)
- [Slice 5 — Life Tracking and Victory/Defeat Conditions](../slice-6-life-tracking/slice.md) (ball falling below screen triggers life loss)

**Can be implemented in parallel with:**
- Slice 2 — Paddle Rendering and Keyboard Input (no dependencies between them)

## Implementation Checklist

- [ ] Implement `gameLoop(timestamp)` function with `requestAnimationFrame` integration
- [ ] Calculate `deltaTime` from timestamp difference (in seconds)
- [ ] Update ball position using velocity and delta time
- [ ] Detect left wall collision and reverse horizontal velocity
- [ ] Detect right wall collision and reverse horizontal velocity
- [ ] Detect ceiling collision and reverse vertical velocity
- [ ] Clamp ball position to prevent penetration
- [ ] Render ball at updated position on canvas
- [ ] Test with various speed multiplier values
- [ ] Verify no console errors or warnings
- [ ] Manual testing: observe smooth ball movement and bounces
- [ ] Confirm physics only update when state is `PLAYING`
