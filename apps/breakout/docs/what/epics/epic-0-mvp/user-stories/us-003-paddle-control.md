# US-003 — Paddle Control and Movement

## Story

As a **player**
I want to **move the paddle left and right using arrow keys**
So that **I can position it to catch the ball and keep the game in play**

## Expected Behavior

- The paddle responds immediately to left and right arrow key inputs during active gameplay
- The paddle moves continuously while a directional key is held down
- The paddle is confined within the left and right boundaries of the playable area
- Movement is smooth and responsive without lag or stuttering
- The paddle visual position updates in sync with its logical position
- Input handling works consistently regardless of other game events (ball physics, collisions, state changes)

## Acceptance Criteria

```gherkin
Feature: Paddle Control and Movement

Scenario: Player moves paddle left with left arrow key
  Given the game is in Active state
  And the paddle is positioned in the center of the playable area
  When the player presses the left arrow key
  Then the paddle moves left
  And the paddle's left edge does not cross the left boundary
  And the paddle position updates in real time

Scenario: Player moves paddle right with right arrow key
  Given the game is in Active state
  And the paddle is positioned in the center of the playable area
  When the player presses the right arrow key
  Then the paddle moves right
  And the paddle's right edge does not cross the right boundary
  And the paddle position updates in real time

Scenario: Paddle stops when key is released
  Given the game is in Active state
  And the paddle is moving left
  When the player releases the left arrow key
  Then the paddle stops moving immediately
  And the paddle remains at its current position

Scenario: Paddle respects left boundary
  Given the game is in Active state
  When the player moves the paddle left repeatedly
  Then the paddle cannot move beyond the left boundary
  And the paddle's left edge remains aligned with the playable area's left edge

Scenario: Paddle respects right boundary
  Given the game is in Active state
  When the player moves the paddle right repeatedly
  Then the paddle cannot move beyond the right boundary
  And the paddle's right edge remains aligned with the playable area's right edge

Scenario: Continuous movement while key held
  Given the game is in Active state
  When the player presses and holds the right arrow key for 1 second
  Then the paddle moves continuously to the right
  And the paddle travels a distance proportional to movement speed and time held

Scenario: Paddle input during ball physics
  Given the game is in Active state
  And the ball is moving and bouncing
  When the player presses the left arrow key
  Then the paddle moves left
  And the ball physics continue unaffected by paddle input

Scenario: No paddle movement in Menu state
  Given the game is in Menu state
  When the player presses the left or right arrow key
  Then the paddle does not move
  And the arrow key input is not consumed by paddle control

Scenario: No paddle movement in Win state
  Given the game is in Win state
  When the player presses the left or right arrow key
  Then the paddle does not move
  And the arrow key input is not consumed by paddle control

Scenario: No paddle movement in Loss state
  Given the game is in Loss state
  When the player presses the left or right arrow key
  Then the paddle does not move
  And the arrow key input is not consumed by paddle control
```

## Related Slices

- Slice 1: Game Board and Paddle Setup — define paddle dimensions and initial position
- Slice 2: Input Handling and Event Management — implement keyboard event listeners for arrow keys
- Slice 5: Game State Management and Transitions — ensure paddle control only works in Active state
