# US-003 — Collision Detection and Ball Bouncing

## Story

**Summary:** Implement collision detection so the ball bounces off walls, the paddle, and bricks, creating the core physical interaction mechanics of the game.

### Use Case

- **As a** player playing the game
- **I want to** see the ball bounce realistically off walls, the paddle, and bricks
- **so that** I can control the ball with the paddle and break bricks with strategy and skill

## Expected Behavior

When the ball collides:
- **Walls (left, right, top):** Ball reverses its horizontal or vertical velocity component
- **Paddle:** Ball bounces with angle variation based on where it hits the paddle (center vs edges)
- **Bricks:** Ball bounces and the brick is destroyed (removed from the playfield)
- **Bottom (out of bounds):** Ball is lost (triggers life loss — handled in US-003)

Collisions are detected in real-time as the ball moves, and visual feedback is immediate.

## Acceptance Criteria

- **Scenario:** Ball bounces off the left and right walls
  - **Given:** A game is active and the ball is moving
  - **When:** The ball's leading edge touches the left wall
  - **Then:** The ball's horizontal velocity reverses
  - **And:** The ball does not pass through the wall
  - **When:** The ball's leading edge touches the right wall
  - **Then:** The ball's horizontal velocity reverses
  - **And:** The ball does not pass through the wall

- **Scenario:** Ball bounces off the top wall
  - **Given:** A game is active and the ball is moving upward
  - **When:** The ball's leading edge touches the top wall
  - **Then:** The ball's vertical velocity reverses
  - **And:** The ball does not pass through the top wall

- **Scenario:** Ball bounces off the paddle with angle variation
  - **Given:** A game is active and the paddle is in motion or stationary
  - **When:** The ball's leading edge touches the paddle
  - **Then:** The ball bounces (velocity reverses)
  - **And:** If the ball hits the center of the paddle, it bounces straight up
  - **And:** If the ball hits the left edge of the paddle, it bounces up and left
  - **And:** If the ball hits the right edge of the paddle, it bounces up and right

- **Scenario:** Ball destroys a brick on collision
  - **Given:** A game is active and bricks are visible
  - **When:** The ball's leading edge touches a brick
  - **Then:** The brick is removed from the playfield immediately
  - **And:** The ball bounces away from the brick
  - **And:** The remaining bricks stay in place

- **Scenario:** Ball exits the bottom of the playfield
  - **Given:** A game is active
  - **When:** The ball's position moves below the bottom boundary (below the paddle)
  - **Then:** The ball is no longer visible on screen
  - **And:** The player loses one life (confirmed by lives counter update)

## Related Slices

- Slice 2 — Moteur de jeu (boucle, physique, détection de collisions)
