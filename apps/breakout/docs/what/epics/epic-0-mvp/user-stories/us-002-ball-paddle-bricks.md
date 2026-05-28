# US-002 — Ball Physics and Playfield Elements

## Story

**Summary:** Implement the game loop and basic physics for the ball, paddle, and brick system to ensure smooth, real-time gameplay movement and rendering.

### Use Case

- **As a** player in an active game
- **I want to** see the ball move continuously in a physics-based simulation and the paddle respond to keyboard input
- **so that** I have a responsive, interactive gameplay experience that feels natural and fluid

## Expected Behavior

During gameplay:
- The ball moves continuously at a consistent speed (configurable via slider)
- The ball does not collide with walls or paddle yet (only moves around the playfield)
- The paddle responds immediately to left/right arrow key presses and stays within the playfield bounds
- A game loop runs at a steady frame rate (60 FPS or equivalent)
- Bricks are rendered visually and remain static until collision detection is implemented
- Lives counter is visible and updates when needed

## Acceptance Criteria

- **Scenario:** Ball moves continuously and smoothly across the playfield
  - **Given:** A game is active and the ball is in motion
  - **When:** I observe the ball for 2 seconds
  - **Then:** The ball moves in a straight line at a constant velocity
  - **And:** The movement is smooth (no visible stuttering)

- **Scenario:** Paddle responds to keyboard input without physics collisions
  - **Given:** A game is active
  - **When:** I press the left arrow key
  - **Then:** The paddle moves left immediately
  - **And:** The paddle does not move beyond the left playfield boundary
  - **When:** I press the right arrow key
  - **Then:** The paddle moves right immediately
  - **And:** The paddle does not move beyond the right playfield boundary

- **Scenario:** Ball continues moving regardless of paddle or brick position
  - **Given:** A game is active
  - **When:** The ball moves toward the paddle or a brick
  - **Then:** The ball passes through without collision or bouncing (collision detection not yet active)
  - **And:** The ball remains within the playfield bounds initially

- **Scenario:** Bricks are displayed and remain static
  - **Given:** A game is active
  - **When:** I observe the playfield
  - **Then:** All bricks in the 5-row grid are visible
  - **And:** Bricks do not move or change until collision occurs

## Related Slices

- Slice 2 — Moteur de jeu (boucle, physique, détection de collisions)
