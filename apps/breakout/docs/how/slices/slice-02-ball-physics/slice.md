# Slice 2 — Ball Physics & Collision Detection

## Goal

Implement the physics engine and collision detector so the ball moves realistically, bounces off walls, ceiling, paddle, and bricks, and destroys bricks on impact. This slice provides the core gameplay loop: ball movement, collision resolution, and brick destruction.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Ball Physics and Collision](../../../what/epics/epic-0-mvp/user-stories/us-002-ball-physics.md)

## Impacted Components

1. **Physics Engine** (`physics.js`)
   - Update ball position each frame: `x += vx * dt`, `y += vy * dt`
   - Apply speed multiplier to velocity: `vx *= speedMultiplier`, `vy *= speedMultiplier`
   - Handle variable delta-time for frame-independent movement

2. **Collision Detector** (`collisionDetector.js`)
   - Detect floor collision (ball below paddle) → Trigger "ball-lost" event
   - Detect brick collision → Reflect ball, destroy brick
   - Detect paddle collision → Angle-dependent reflection
   - Detect wall/ceiling collision → Reflect ball
   - Ensure only one collision resolved per frame (prevent tunneling)

3. **Game State** (`gameState.js`)
   - Support ball velocity updates: `vx`, `vy`
   - Support brick destruction: remove from `bricks` array
   - Track collision events for state transitions

4. **Game Loop** (`gameLoop.js`)
   - Call `physics.update(deltaTime)` each frame
   - Call `collisionDetector.detectAndResolve(gameState)` each frame
   - Handle collision resolution side effects (brick removal, life decrement)

5. **Renderer** (`renderer.js`)
   - Render ball at updated position each frame

## Interfaces

### Physics → Game State
```javascript
physics.update(deltaTime, gameState)
// Updates: gameState.ball.x, gameState.ball.y, gameState.ball.vx, gameState.ball.vy
// Applies speed multiplier to ball velocity
```

### Collision Detector → Game State
```javascript
const collision = collisionDetector.detectAndResolve(gameState)
// Returns: { type, object, impact } or null
// Modifies: gameState.ball.vx, gameState.ball.vy (reflection)
//           gameState.bricks (removes destroyed brick)
// Emits: "ball-lost" | "brick-destroyed" | "paddle-bounce" | null
```

### Game Loop → Physics & Collision
```javascript
physics.update(deltaTime, gameState)
const collision = collisionDetector.detectAndResolve(gameState)

if (collision.type === "ball-lost") {
  gameState.decrementLives()
}
if (collision.type === "brick-destroyed") {
  // Brick already removed by detector
}
```

## Data Changes

**Ball State After Physics Update:**
```javascript
ball: {
  x: number,  // Updated position
  y: number,  // Updated position
  vx: number, // Velocity × speedMultiplier
  vy: number, // Velocity × speedMultiplier
  radius: 5
}
```

**Collision Data:**
```javascript
{
  type: "floor" | "brick" | "paddle" | "wall" | "ceiling",
  object: brick | paddle | wall,  // Reference to colliding object
  impact: { x, y },               // Impact point
  side: "top" | "bottom" | "left" | "right"
}
```

**Brick Destruction:**
- Brick removed from `gameState.bricks` array immediately after collision
- ID used to find and splice brick from array

## Sequence Flow

```
Per Frame:
1. Input → Update paddle velocity (handled elsewhere)
2. Physics.update(deltaTime)
   a. ball.x += ball.vx * deltaTime
   b. ball.y += ball.vy * deltaTime
   c. Apply speed multiplier to velocities
3. CollisionDetector.detectAndResolve()
   a. Check floor collision
      - If ball.y + ball.radius > canvas.height
      - Return { type: "ball-lost" }
   b. Check brick collisions
      - For each brick in gameState.bricks
      - If circle-rect intersection
      - Reflect ball based on impact side
      - Remove brick from array
      - Return { type: "brick-destroyed" }
   c. Check paddle collision
      - If circle-rect intersection
      - Reflect ball with angle based on paddle impact position
      - Return { type: "paddle-bounce" }
   d. Check wall collisions
      - If ball.x - radius < 0 or ball.x + radius > canvas.width
      - Reverse ball.vx
   e. Check ceiling collision
      - If ball.y - radius < 0
      - Reverse ball.vy
4. Handle collision results
   - If "ball-lost": gameState.decrementLives()
5. Renderer.draw(gameState)
   - Ball rendered at new position
```

## Observability Impact

**Console Logging (debug only):**
- Log collision events: "Brick #12 destroyed", "Ball lost", "Paddle bounce"
- Log ball velocity: "Ball speed: vx=150, vy=200 (px/s)"
- Log delta-time: "Frame time: 16.67ms" (every 10 frames)

**Visual Feedback:**
- Ball moves smoothly across screen
- Ball bounces off walls visibly
- Bricks disappear on impact (smooth destruction)
- Ball bounces off paddle with angle variation

## Notes

- Ball starts with zero velocity; Slice 3 (paddle control) or Slice 5 (menu) will set initial velocity on game start
- Paddle collision angle depends on impact position: center = vertical, edges = angled (implement later if needed for MVP)
- Floor collision triggers "ball-lost" event (life decrement happens in Game Loop)
- Speed multiplier affects velocity magnitude but not direction

---

**Status:** Ready for implementation. No blockers.
