# US-004 — Lives System and Game State Management

## Story

**Summary:** Implement the lives system so players start with 3 lives and can lose them when the ball goes out of bounds, with proper game state transitions.

### Use Case

- **As a** player
- **I want to** see my remaining lives displayed and understand when I lose a life
- **so that** I know how much longer I can keep playing before the game ends in a loss

## Expected Behavior

- Game starts with 3 lives displayed on screen
- Each time the ball exits the bottom of the playfield, the player loses one life
- After losing a life:
  - Lives counter decreases by 1
  - The ball is reset to its initial position above the paddle
  - Gameplay continues with the same paddle position and remaining bricks
  - A brief pause (1–2 seconds) occurs before the ball resumes motion
- If lives reach 0, the game transitions to a loss state (handled in US-006)
- The lives counter is always visible during gameplay

## Acceptance Criteria

- **Scenario:** Game starts with 3 lives displayed
  - **Given:** A new game has started
  - **When:** I look at the lives counter
  - **Then:** It displays "Lives: 3"
  - **And:** The counter is positioned clearly (e.g., top-left or top-right corner)

- **Scenario:** Losing a life decreases the counter and resets the ball
  - **Given:** A game is active with 3 lives remaining
  - **When:** I allow the ball to exit the bottom of the playfield
  - **Then:** The lives counter changes to "Lives: 2"
  - **And:** The ball reappears above the paddle in its initial position
  - **And:** The paddle remains where it was

- **Scenario:** Losing a second life continues gameplay
  - **Given:** A game is active with 2 lives remaining
  - **When:** I allow the ball to exit the bottom again
  - **Then:** The lives counter changes to "Lives: 1"
  - **And:** The ball is reset above the paddle
  - **And:** Gameplay continues

- **Scenario:** Losing the final life transitions to game over
  - **Given:** A game is active with 1 life remaining
  - **When:** I allow the ball to exit the bottom
  - **Then:** The lives counter changes to "Lives: 0"
  - **And:** The game transitions to a loss/game-over state
  - **And:** Gameplay stops (ball and paddle are no longer interactive)

- **Scenario:** Ball reset pause prevents immediate re-loss
  - **Given:** A life has just been lost and the ball is being reset
  - **When:** The ball reappears above the paddle
  - **Then:** There is a 1–2 second delay before the ball starts moving again
  - **And:** The player can move the paddle during this pause to position it

## Related Slices

- Slice 2 — Moteur de jeu (boucle, physique, détection de collisions)
- Slice 3 — Système d'état et gestion des menus
