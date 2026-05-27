# US-004 — Collision Detection

## Story

- **As a** arcade player
- **I want to** have the ball accurately bounce off the paddle, bricks, and walls
- **so that** the game physics feel fair and the gameplay is predictable

## Expected Behavior

The game detects when the ball makes contact with game elements (paddle, bricks, walls, ceiling) and responds by either reversing direction, destroying the brick, or triggering a game event. Collision detection must be reliable and consistent.

## Acceptance Criteria

- **Scenario:** Ball bounces off the paddle
  - **Given:** The game is in "playing" state
  - **and Given:** The ball is moving downward toward the paddle
  - **When:** The ball's Y position intersects with the paddle's Y position
  - **and When:** The ball's X position is within the paddle's horizontal bounds
  - **Then:** The ball's vertical velocity is reversed (vY = -vY)
  - **and Then:** The ball does not pass through the paddle

- **Scenario:** Ball collides with a brick and destroys it
  - **Given:** The game is in "playing" state
  - **and Given:** The ball is moving and a brick is still intact
  - **When:** The ball's position intersects with the brick's bounding box
  - **Then:** The brick is removed from the game
  - **and Then:** The ball's direction is reversed (typically vY = -vY if hitting top/bottom of brick)
  - **and Then:** The player's score increases by 1

- **Scenario:** Ball bounces off brick sides (horizontal collision)
  - **Given:** The game is in "playing" state
  - **and Given:** The ball hits the left or right side of a brick
  - **When:** The collision is detected
  - **Then:** The ball's horizontal velocity is reversed (vX = -vX)
  - **and Then:** The brick is destroyed and score increases by 1

- **Scenario:** No collision with already-destroyed bricks
  - **Given:** A brick has been destroyed and removed from the game
  - **When:** The ball moves through the space where the brick was
  - **Then:** No collision is detected
  - **and Then:** No score is awarded

- **Scenario:** Multiple collisions are handled per frame
  - **Given:** The game is in "playing" state
  - **and Given:** The ball could potentially collide with multiple objects in a single frame (rare but possible)
  - **When:** The frame update runs
  - **Then:** The most significant collision is processed
  - **and Then:** The ball direction is updated accordingly

## Related Slices

- Bounding box collision detection algorithm
- Paddle-ball collision logic (vertical plane)
- Brick-ball collision logic (horizontal and vertical planes)
- Wall/ceiling collision (already in US-003)
- Brick destruction and removal from game state
- Score increment logic on brick destruction
