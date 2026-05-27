# US-003 — Ball Physics

## Story

- **As a** arcade player
- **I want to** watch the ball move with consistent velocity and bounce smoothly within the playing field
- **so that** I can predict and intercept the ball's trajectory

## Expected Behavior

The ball travels in a straight line at a constant velocity determined by the speed setting. When the ball would move out of bounds (hitting walls or ceiling), it bounces by reversing direction. The ball's movement should be smooth and deterministic across frames.

## Acceptance Criteria

- **Scenario:** Ball moves with initial velocity at game start
  - **Given:** The game is in "playing" state
  - **and Given:** The ball has just been initialized
  - **When:** The game loop begins updating
  - **Then:** The ball travels downward and in one horizontal direction at a constant velocity
  - **and Then:** The velocity magnitude matches the player's speed setting

- **Scenario:** Ball bounces off the left and right walls
  - **Given:** The game is in "playing" state
  - **and Given:** The ball is moving horizontally toward a side wall
  - **When:** The ball's X position would exceed the canvas boundary
  - **Then:** The ball's horizontal velocity is reversed (vX = -vX)
  - **and Then:** The ball continues moving in the new direction without entering the wall

- **Scenario:** Ball bounces off the ceiling
  - **Given:** The game is in "playing" state
  - **and Given:** The ball is moving upward toward the ceiling
  - **When:** The ball's Y position would go below 0 (top of canvas)
  - **Then:** The ball's vertical velocity is reversed (vY = -vY)
  - **and Then:** The ball continues moving downward

- **Scenario:** Ball movement speed depends on difficulty setting
  - **Given:** The player has set the speed slider before starting the game
  - **When:** The game initializes the ball
  - **Then:** The ball's initial velocity components (vX, vY) reflect the speed setting
  - **and Then:** A higher speed setting results in a visibly faster ball movement

- **Scenario:** Ball position updates smoothly each frame
  - **Given:** The game is in "playing" state
  - **When:** Each animation frame is rendered
  - **Then:** The ball's position updates by adding velocity: `ball.x += ball.vX` and `ball.y += ball.vY`
  - **and Then:** The ball appears to move continuously, not in discrete jumps

## Related Slices

- Ball position and velocity state management
- Game loop frame update mechanism (requestAnimationFrame)
- Physics calculation: linear motion with velocity
- Boundary collision detection and direction reversal
- Speed multiplier applied to initial velocity
