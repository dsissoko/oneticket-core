# Component Diagram — Breakout Game Physics and Collision System

## Overview

This diagram details the **Physics Engine** and **Game Engine** components, showing their internal structure and interactions with supporting modules. This level of detail is useful for developers implementing collision detection and game loop logic.

## C4 Component Diagram

```mermaid
C4Component
  title Component Diagram - Breakout Core Game Loop

  Container(state_mgr, "State Manager", "JavaScript", "Stores and updates game state")
  Container(input_hdlr, "Input Handler", "JavaScript", "Keyboard/mouse events")
  Container(renderer, "Renderer", "JavaScript", "Canvas/DOM rendering")
  Container(menu_sys, "Menu System", "JavaScript", "Screen navigation")

  Container_Boundary(game_engine_c, "Game Engine") {
    Component(loop, "Main Loop", "JavaScript", "requestAnimationFrame callback; orchestrates each frame")
    Component(init, "Initializer", "JavaScript", "Sets up initial game state and objects")
    Component(state_machine, "State Machine", "JavaScript", "Manages gameState transitions")
    Component(win_check, "Win Condition Checker", "JavaScript", "Detects when all bricks destroyed")
    Component(lose_check, "Lose Condition Checker", "JavaScript", "Detects when lives = 0")
  }

  Container_Boundary(physics_c, "Physics Engine") {
    Component(ball_update, "Ball Updater", "JavaScript", "Updates ball position based on velocity")
    Component(collision_detect, "Collision Detector", "JavaScript", "AABB collision testing")
    Component(collision_resolve, "Collision Resolver", "JavaScript", "Applies bounce/deflection response")
    Component(bounds_check, "Bounds Checker", "JavaScript", "Detects out-of-bounds (lost life)")
  }

  Container_Boundary(game_objects_c, "Game Objects") {
    Component(ball_obj, "Ball", "Object", "x, y, vx, vy, radius, speed")
    Component(paddle_obj, "Paddle", "Object", "x, y, width, height, velocity")
    Component(brick_obj, "Brick Array", "Array", "Array of brick objects with destroyed flag")
    Component(wall_obj, "Walls", "Object", "Implicit boundaries (top, left, right, bottom)")
  }

  Rel(loop, ball_update, "Calls each frame", "deltaTime")
  Rel(loop, collision_detect, "Calls each frame")
  Rel(loop, collision_resolve, "Calls on collision")
  Rel(loop, bounds_check, "Calls each frame")
  Rel(loop, win_check, "Calls each frame")
  Rel(loop, lose_check, "Calls each frame")
  Rel(loop, state_machine, "Updates state")
  Rel(loop, state_mgr, "Reads/writes", "getCurrentState()")
  Rel(loop, renderer, "Triggers render")
  Rel(loop, input_hdlr, "Polls input state")

  Rel(ball_update, ball_obj, "Modifies position")
  Rel(collision_detect, ball_obj, "Tests against")
  Rel(collision_detect, paddle_obj, "Tests against")
  Rel(collision_detect, brick_obj, "Tests against")
  Rel(collision_detect, wall_obj, "Tests against")
  Rel(collision_resolve, ball_obj, "Modifies velocity")
  Rel(collision_resolve, brick_obj, "Marks destroyed")
  Rel(bounds_check, ball_obj, "Checks position")

  Rel(state_machine, state_mgr, "Updates gameState")
  Rel(win_check, state_mgr, "Triggers win state")
  Rel(lose_check, state_mgr, "Triggers lose state")

  Rel(renderer, state_mgr, "Reads state")
  Rel(renderer, game_objects_c, "Reads objects")

  Rel(menu_sys, state_mgr, "Updates speed/state")
```

## Component Descriptions

### Game Engine Components

#### Main Loop (`loop`)
**Responsibility**: Core game loop executed every frame via `requestAnimationFrame`.

**Pseudocode:**
```javascript
function loop(timestamp) {
  const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert to seconds
  
  // 1. Input
  const input = inputHandler.getPaddleInput();
  
  // 2. Physics Update
  physics.updateBall(ball, deltaTime);
  physics.updatePaddle(paddle, input, deltaTime);
  
  // 3. Collision Detection
  const collisions = physics.detectCollisions(ball, paddle, bricks, walls);
  
  // 4. Collision Resolution
  collisions.forEach(collision => {
    physics.resolveCollision(ball, collision.object);
  });
  
  // 5. Boundary Check
  if (physics.isOutOfBounds(ball)) {
    lives--;
    if (lives > 0) resetBall();
  }
  
  // 6. Win/Lose Conditions
  if (bricksDestroyed === totalBricks) {
    gameState = "won";
  }
  if (lives === 0) {
    gameState = "lost";
  }
  
  // 7. Render
  renderer.render(gameState, { ball, paddle, bricks, lives });
  
  // 8. Schedule Next Frame
  requestAnimationFrame(loop);
}
```

#### Initializer (`init`)
**Responsibility**: Set up game state, allocate game objects, reset for new game.

**Initializes:**
- Ball: center position, initial velocity (0, 0) or gentle trajectory
- Paddle: center position, dimensions (e.g., width=80px, height=10px)
- Bricks: 50-element array in 5×10 grid, all with `destroyed=false`
- Walls: Implicit boundaries based on canvas size
- Lives: Set to 3
- Speed: Apply selected speed multiplier from State Manager

#### State Machine (`state_machine`)
**Responsibility**: Manage game state transitions.

**States:**
- `"menu"` → Player selecting speed
- `"playing"` → Ball in motion, gameplay active
- `"won"` → All bricks destroyed; display victory
- `"lost"` → Out of lives; display game over

**Transitions:**
```
menu → (player clicks Play) → playing
playing → (all bricks destroyed) → won
playing → (lives = 0) → lost
won/lost → (player clicks Play Again) → menu
```

#### Win Condition Checker (`win_check`)
**Responsibility**: Detect victory condition.

**Logic:**
```javascript
function checkWinCondition() {
  const activeBricks = bricks.filter(b => !b.destroyed).length;
  return activeBricks === 0;
}
```

**Action**: If true, set `gameState = "won"`

#### Lose Condition Checker (`lose_check`)
**Responsibility**: Detect loss condition.

**Logic:**
```javascript
function checkLoseCondition() {
  return lives === 0;
}
```

**Action**: If true, set `gameState = "lost"`

### Physics Engine Components

#### Ball Updater (`ball_update`)
**Responsibility**: Update ball position based on velocity and elapsed time.

**Algorithm:**
```javascript
function updateBall(ball, deltaTime) {
  ball.x += ball.vx * deltaTime;
  ball.y += ball.vy * deltaTime;
}
```

**Input:** Ball object, deltaTime (seconds since last frame)  
**Output:** Updated ball position

#### Collision Detector (`collision_detect`)
**Responsibility**: Test for intersections using AABB (Axis-Aligned Bounding Box).

**Algorithm:** For each obstacle, check if ball's bounding box overlaps:
```javascript
function detectCollision(ballBbox, obstacleBbox) {
  return !(ballBbox.right < obstacleBbox.left ||
           ballBbox.left > obstacleBbox.right ||
           ballBbox.bottom < obstacleBbox.top ||
           ballBbox.top > obstacleBbox.bottom);
}
```

**Input:** Ball position/radius, obstacle array (paddle, bricks, walls)  
**Output:** Array of collided objects with collision side (top/bottom/left/right)

#### Collision Resolver (`collision_resolve`)
**Responsibility**: Apply bounce response and object destruction.

**Response Logic:**

| Collision Type | Response |
|---|---|
| Ball ↔ Left/Right Wall | Invert `ball.vx` |
| Ball ↔ Ceiling | Invert `ball.vy` |
| Ball ↔ Paddle | Invert `ball.vy`; optionally adjust angle |
| Ball ↔ Brick | Invert `ball.vx` or `ball.vy` (based on side); set `brick.destroyed = true` |

**Pseudocode:**
```javascript
function resolveCollision(ball, obstacle) {
  if (obstacle.type === "wall") {
    if (obstacle.side === "left" || obstacle.side === "right") {
      ball.vx = -ball.vx;
    } else if (obstacle.side === "top") {
      ball.vy = -ball.vy;
    }
  } else if (obstacle.type === "paddle") {
    ball.vy = -ball.vy;
    // Optional: adjust angle based on hit position
    const hitPos = (ball.x - paddle.x) / paddle.width; // 0 to 1
    ball.vx = (hitPos - 0.5) * 300; // Adjust horizontal velocity
  } else if (obstacle.type === "brick") {
    obstacle.destroyed = true;
    if (collision_side === "top" || collision_side === "bottom") {
      ball.vy = -ball.vy;
    } else {
      ball.vx = -ball.vx;
    }
  }
}
```

#### Bounds Checker (`bounds_check`)
**Responsibility**: Detect when ball exits the bottom of the screen (out of bounds).

**Logic:**
```javascript
function isOutOfBounds(ball) {
  return ball.y - ball.radius > canvas.height;
}
```

**Action:** If true, decrement lives and reset ball position.

### Game Objects

#### Ball Object
**Properties:**
- `x` (number) — Horizontal position
- `y` (number) — Vertical position
- `vx` (number) — Horizontal velocity (pixels per second)
- `vy` (number) — Vertical velocity (pixels per second)
- `radius` (number) — Collision radius (e.g., 5px)

**Methods:**
- `reset(x, y)` — Reset position to center-top

#### Paddle Object
**Properties:**
- `x` (number) — Left edge position
- `y` (number) — Top edge position (fixed, usually near canvas.height - 20)
- `width` (number) — Paddle width (e.g., 80px)
- `height` (number) — Paddle height (e.g., 10px)
- `velocity` (number) — Movement speed (pixels per second, independent of ball speed)

**Methods:**
- `moveLeft(deltaTime)` — Move left, respecting screen bounds
- `moveRight(deltaTime)` — Move right, respecting screen bounds

#### Brick Array
**Structure:** Array of 50 brick objects
```javascript
[
  { x: 10, y: 20, width: 70, height: 15, destroyed: false },
  { x: 80, y: 20, width: 70, height: 15, destroyed: false },
  ...
]
```

**Grid Layout:** 5 rows × 10 columns
- Row spacing: 20px (each brick is 15px tall, 5px gap)
- Column spacing: 10px (each brick is 70px wide, 10px gap)

#### Walls Object
**Implicit Boundaries:**
```javascript
{
  top: { x: 0, y: 0, width: canvas.width, height: 0 },
  left: { x: 0, y: 0, width: 0, height: canvas.height },
  right: { x: canvas.width, y: 0, width: 0, height: canvas.height },
  bottom: { x: 0, y: canvas.height, width: canvas.width, height: 0 } // Out of bounds
}
```

## Interaction Sequences

### Frame Execution Sequence

```
1. requestAnimationFrame → loop()
2. Input poll → inputHandler.getInput()
3. Physics update → ball and paddle positions
4. Collision detection → find overlaps
5. Collision resolution → apply bounces, mark bricks destroyed
6. Bounds check → detect lost lives
7. Win/lose checks → update gameState if needed
8. Renderer → draw everything
9. Schedule next frame
```

### Brick Destruction Sequence

```
1. Ball moves toward brick
2. Collision detector finds overlap
3. Collision resolver:
   a. Sets brick.destroyed = true
   b. Inverts ball velocity component
4. Renderer skips drawing destroyed bricks
5. Win checker counts non-destroyed bricks
6. If count = 0, triggers "won" state
```

## Performance Considerations

- **Collision Detection Complexity**: O(n) per frame where n = 50 bricks (acceptable)
- **Brick Filtering**: Iterate full array; mark destroyed rather than splice (cheaper)
- **Frame Time Budget**: Target < 16ms per frame for 60 FPS
- **Canvas Clearing**: Clear canvas once per frame before redrawing

## Testing Strategy

### Unit Tests (Per Component)

- **Ball Updater**: Verify position changes correctly with velocity and deltaTime
- **Collision Detector**: Test AABB intersection with various positions
- **Collision Resolver**: Verify velocity inversion and brick destruction
- **Conditions**: Test win/lose detection with specific game states

### Integration Tests

- **Full Frame Cycle**: Ball moves, collides, updates state, renders
- **Win Scenario**: Start with 1 brick, destroy it, verify "won" state
- **Lose Scenario**: Start with 1 life, let ball exit, verify "lost" state

### Manual Tests

- Play through full game (menu → gameplay → win/lose)
- Test all speed levels
- Verify collision behavior at high velocities
- Check paddle movement responsiveness
