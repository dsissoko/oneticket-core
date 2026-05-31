# US-001 — Gameplay Mechanics

## Story

**As a** player

**I want** to play a game where a ball bounces off walls, paddle, and bricks with physics-based collisions

**So that** I experience classic Breakout arcade mechanics with authentic, responsive gameplay

## Expected Behavior

The core game engine simulates a ball moving through a 2D playfield with real-time collision detection against static boundaries (screen edges), a player-controlled paddle, and destructible bricks. The ball maintains constant velocity magnitude and reflects off colliders at physically correct angles. The game loop runs at 60 FPS with delta-time independent physics updates using `requestAnimationFrame`. Collision detection uses Axis-Aligned Bounding Box (AABB) algorithm to resolve impacts between the ball and all colliders in priority order: walls → paddle → bricks.

## Acceptance Criteria

```gherkin
Scenario: Ball bounces off walls and screen boundaries
  Given the game is running
  When the ball moves toward a wall (top, left, or right)
  Then it bounces off the wall with correct reflection angle
  And the ball velocity magnitude remains constant
  And the ball is pushed to the edge of the collider before reflection

Scenario: Ball bounces off paddle with angle variation
  Given a paddle exists on screen
  When the ball collides with the paddle
  Then the ball reflects upward with angle variation based on hit location
  And hitting the paddle center creates a vertical reflection
  And hitting the paddle edge deflects at a steeper angle
  And the ball remains within the screen bounds after bounce

Scenario: Brick is destroyed on ball impact
  Given a brick exists at position (x, y) in the wall
  When the ball collides with the brick
  Then the brick is destroyed and removed from game state
  And the brick is no longer rendered
  And the ball reflects away from the brick
  And the destroyed brick count increments

Scenario: All bricks destroyed triggers victory
  Given the brick wall is populated (5 rows × 10 columns = 50 bricks)
  When all bricks are destroyed
  Then the ball stops moving
  And the game state transitions to Victory
  And the victory screen is displayed
  And the player can click Replay or Quit

Scenario: Ball exits bottom of screen triggers life loss
  Given the player has N remaining lives (N >= 1)
  When the ball falls below the bottom screen edge
  Then the player loses 1 life
  And the ball resets to the center of the screen
  And the paddle resets to its starting position
  And the game resumes if N > 1, or transitions to Defeat if N == 0
  And life count on HUD updates immediately
```

## Technical Details

### Game Engine Architecture

- **Physics Loop**: Uses `requestAnimationFrame` for 60 FPS rendering and update cycle
- **Delta Time**: Frame-rate independent updates using elapsed time since last frame
- **Ball Properties**:
  - Position: (x, y) coordinates
  - Velocity: (vx, vy) vector; magnitude constant, direction changes on collision
  - Radius: ~5 pixels for collision bounds
  - Starting velocity: magnitude determined by speed slider (3–8 pixels/ms)

- **Paddle Properties**:
  - Position: (x, y) at bottom-center of screen
  - Dimensions: 60 pixels wide × 10 pixels tall
  - Speed: 4 pixels/frame (direction keyboard input)
  - Constraints: cannot move beyond left/right screen edges

- **Brick Properties**:
  - Grid: 5 rows × 10 columns (50 total)
  - Dimensions: 40 pixels wide × 15 pixels tall
  - State: active (rendereable) or destroyed (removed from grid)
  - Spacing: 10 pixels horizontal, 5 pixels vertical

- **Screen Boundaries**:
  - Canvas: 400 pixels wide × 600 pixels tall
  - Collision zones: top, left, right edges (bottom exits the ball)

### Collision Detection (AABB Algorithm)

1. **Check Phase**: Test ball bounding box against colliders
   - Walls (top, left, right)
   - Paddle hitbox
   - Brick hitboxes (sorted top-to-bottom for priority)

2. **Resolution Phase**: For each collision:
   - Determine collision normal (direction of impact)
   - Reflect ball velocity: `v' = v - 2(v·n)n`
   - Push ball outside collider bounds to prevent re-collision

3. **Handling Order**:
   - Walls first (always reflect)
   - Paddle second (reflect with angle variation)
   - Bricks last (reflect and destroy)

### Physics Rules

- **Elastic Collisions**: Ball never loses energy; velocity magnitude constant
- **Reflection Formula**: For surface normal **n**, reflected velocity is `v' = v - 2(v·n)n`
- **Paddle Hit Angles**:
  - Center hit (paddle middle 20px): reflect straight up (0° deviation)
  - Edge hit (paddle outer 20px each): ±30° angle deflection
- **No Spin**: Ball movement is purely translational; no rotation or curve

### Rendering

- Canvas 2D context for drawing:
  - Ball: filled circle, white or light color
  - Paddle: filled rectangle, player color (cyan/white)
  - Bricks: filled rectangles, colored by row (red, orange, yellow, green, blue)
  - Boundaries: thin lines for screen edges (optional)

## Story Points Estimation

**13 points** (Large)

### Rationale

- **Complexity**: Physics engine with delta-time updates, AABB collision detection, reflection math
- **Scope**: Ball, paddle, 50 bricks, wall boundaries, game state transitions
- **Testing**: Multiple collision scenarios, edge cases (corner hits, simultaneous collisions), frame-rate independence
- **Integration**: Core loop ties to paddle input, brick destruction, life system, and game state management

## Technical Risks

### Risk 1: Collision Detection Accuracy
- **Risk**: AABB may miss collisions at high ball speeds or produce false positives at corners
- **Mitigation**: 
  - Clamp maximum ball speed (ensure ball diameter < min frame distance)
  - Add "continuous collision detection" for fast-moving objects
  - Test corner cases (paddle edge, brick corners)
  - Log all collision events during development

### Risk 2: Physics Feel & Responsiveness
- **Risk**: Reflection angles or paddle feel may not match arcade classic; players perceive input lag
- **Mitigation**:
  - Prototype reflection formula with manual tests
  - Profile input-to-screen latency; target <50 ms
  - Use `requestAnimationFrame` for timing, avoid `setTimeout`
  - Validate 60 FPS performance on target browsers

### Risk 3: Simultaneous Multiple Collisions
- **Risk**: Ball may collide with paddle and brick in same frame; resolution order matters
- **Mitigation**:
  - Define clear collision priority: walls → paddle → bricks
  - Only process one reflection per frame per object type
  - Log collision sequence for debugging

### Risk 4: Screen Boundary Edge Cases
- **Risk**: Ball may escape through corners or get stuck at edges
- **Mitigation**:
  - Always push ball outside collider bounds after reflection
  - Test corner reflections (top-left, top-right)
  - Verify no "sticky" behavior at screen boundaries

## Dependencies

- **US-002** (Paddle Control): Paddle input system required for collision testing
- **US-003** (Ball Physics): May be the same story; core engine is physics + collision detection
- **Game Canvas**: Assumes Canvas 2D context is available and cleared per frame

## Definition of Done

- [ ] Game engine loop runs at stable 60 FPS
- [ ] Delta-time based updates are frame-rate independent
- [ ] Ball reflects correctly off walls, paddle, and bricks with proper angles
- [ ] All 50 bricks are destroyable on ball collision
- [ ] Paddle collision includes angle variation (center vs. edges)
- [ ] Ball reset and life loss occur when ball exits bottom
- [ ] Victory state triggered when brick count reaches 0
- [ ] Collision detection completes in <1 ms per frame
- [ ] No jank or stuttering during continuous gameplay
- [ ] Unit tests for reflection math, AABB detection, and game state transitions
- [ ] Integration tests for full gameplay loop (start → collision → brick destruction → victory/defeat)

## Related Epic

[Epic 0 — MVP Breakout](epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
