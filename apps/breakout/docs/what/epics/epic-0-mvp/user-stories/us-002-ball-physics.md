# US-002 — Ball Physics and Bouncing Mechanics

## Story

- **Summary:** Implement realistic ball movement with bouncing on walls, ceiling, paddle, and bricks so that the core gameplay loop feels responsive and predictable.

### Use Case:
- **As a** player
- **I want to** see the ball move continuously and bounce realistically off obstacles (walls, ceiling, paddle, and bricks)
- **so that** I can predict ball trajectory and time my paddle movements to keep the ball in play

## Expected Behavior

The ball should:
- Move across the canvas at a configurable speed
- Bounce off the left and right walls (reversing horizontal velocity)
- Bounce off the ceiling (reversing vertical velocity)
- Bounce off the paddle with angle variation based on impact point (center vs. edges)
- Bounce off bricks with velocity reversal
- Detect collisions accurately without getting stuck in obstacles
- Reset to a starting position when it falls below the bottom of the screen

### Ball Properties
- **Initial velocity:** Configurable via speed slider (affects both X and Y components)
- **Speed range:** Very slow to very fast (minimum and maximum multipliers)
- **Position:** Starts centered horizontally above the paddle
- **Direction:** Initially moves upward and at an angle

### Collision Behavior
- **Wall collisions:** Ball reverses horizontal direction
- **Ceiling collision:** Ball reverses vertical direction
- **Paddle collision:** Ball reverses vertical direction; angle depends on paddle impact zone (edges vs. center)
- **Brick collision:** Ball reverses direction perpendicular to brick surface hit
- **Corner/edge cases:** Ball does not get stuck in obstacles; collision resolution prevents overlap

## Acceptance Criteria

### Scenario 1: Ball moves continuously and bounces off walls
- **Given:** The game is running and the ball is in motion
- **and Given:** The ball is moving toward the left wall
- **When:** The ball collides with the left wall
- **Then:** The ball reverses its horizontal velocity and continues moving to the right

### Scenario 2: Ball bounces off the ceiling
- **Given:** The game is running and the ball is in motion
- **and Given:** The ball is moving upward toward the ceiling
- **When:** The ball reaches the top boundary
- **Then:** The ball reverses its vertical velocity and moves downward

### Scenario 3: Ball bounces off the paddle
- **Given:** The game is running and the ball is falling
- **and Given:** The paddle is positioned below the ball
- **When:** The ball collides with the paddle surface
- **Then:** The ball reverses its vertical velocity and moves upward

### Scenario 4: Ball angle changes based on paddle impact zone
- **Given:** The ball is falling toward the paddle
- **and Given:** The paddle is divided into three impact zones (left edge, center, right edge)
- **When:** The ball hits the left edge of the paddle
- **Then:** The ball bounces upward and to the left at a steeper angle

### Scenario 5: Ball bounces off a brick
- **Given:** The game is running and the ball is in motion
- **and Given:** A brick is in the ball's path
- **When:** The ball collides with the brick
- **Then:** The ball reverses velocity in the perpendicular direction to the brick surface and the brick is marked for destruction

### Scenario 6: Ball resets when falling below the screen
- **Given:** The game is running and the ball is falling
- **and Given:** The ball passes below the bottom boundary of the screen
- **When:** The ball falls below the screen
- **Then:** The ball is reset to its starting position (centered horizontally above the paddle) and the player loses one life

### Scenario 7: Speed slider affects ball velocity
- **Given:** The game is in the settings menu
- **and Given:** The speed slider is set to a new value
- **When:** The player validates the settings and starts a new game
- **Then:** The ball moves at the speed corresponding to the slider value (very slow to very fast)

### Scenario 8: No collision overlap
- **Given:** The ball is moving
- **and Given:** The ball collides with a wall or obstacle
- **When:** Collision resolution occurs
- **Then:** The ball does not penetrate or get stuck inside the obstacle

## Key Files & References

- **Canvas rendering:** `apps/breakout/app/src/game.js` (ball rendering and update loop)
- **Collision detection:** `apps/breakout/app/src/collision.js` (ball-wall, ball-ceiling, ball-paddle, ball-brick detection)
- **Ball state:** `apps/breakout/app/src/state.js` (ball position, velocity, speed multiplier)
- **Configuration:** `apps/breakout/app/src/config.js` (initial ball properties, speed ranges)

## Definition of Done

- ✅ Ball renders visually on canvas
- ✅ Ball moves continuously in the game loop
- ✅ Collision detection works for all obstacle types (walls, ceiling, paddle, bricks)
- ✅ Ball bounces with correct velocity reversal
- ✅ Paddle bounce angle varies based on impact zone
- ✅ Ball resets correctly when falling below screen
- ✅ Speed slider value affects ball velocity
- ✅ No collision overlap or tunneling issues
- ✅ Acceptance criteria pass (manual testing or automated tests)
- ✅ No console errors or warnings
