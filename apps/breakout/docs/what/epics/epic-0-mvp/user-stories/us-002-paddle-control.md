# US-002 — Paddle Control

## Story

- **As a** arcade player
- **I want to** move the paddle left and right using the keyboard arrow keys
- **so that** I can intercept the ball and keep it in play

## Expected Behavior

The paddle responds immediately to left and right arrow key presses. The paddle moves smoothly within the bounds of the playing field and does not leave the screen. Movement stops when the key is released.

## Acceptance Criteria

- **Scenario:** Player presses the left arrow key
  - **Given:** The game is in "playing" state
  - **and Given:** The paddle is positioned somewhere on the playing field
  - **When:** The player presses and holds the left arrow key
  - **Then:** The paddle moves toward the left edge of the canvas
  - **and Then:** The paddle does not move further left once it reaches the left boundary

- **Scenario:** Player presses the right arrow key
  - **Given:** The game is in "playing" state
  - **and Given:** The paddle is positioned somewhere on the playing field
  - **When:** The player presses and holds the right arrow key
  - **Then:** The paddle moves toward the right edge of the canvas
  - **and Then:** The paddle does not move further right once it reaches the right boundary

- **Scenario:** Player releases the arrow key
  - **Given:** The game is in "playing" state
  - **and Given:** The paddle is currently moving in response to a key press
  - **When:** The player releases the arrow key
  - **Then:** The paddle stops moving immediately

- **Scenario:** Paddle stays within canvas boundaries
  - **Given:** The game is in "playing" state
  - **When:** The player moves the paddle with arrow keys
  - **Then:** The paddle's left edge never goes below X=0
  - **and Then:** The paddle's right edge never exceeds the canvas width

## Related Slices

- Keyboard event listeners (keydown/keyup for arrow keys)
- Paddle movement speed constant
- Boundary checking logic (clamp paddle X position)
- Game loop integration (apply movement delta each frame)
