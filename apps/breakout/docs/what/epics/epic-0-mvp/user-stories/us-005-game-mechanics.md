# US-005 — Game Mechanics

## Story

- **As a** arcade player
- **I want to** lose lives when the ball exits the bottom of the screen, trigger game over when lives reach zero, and win when all bricks are destroyed
- **so that** the game has clear win/lose conditions and I know when the game is finished

## Expected Behavior

The game tracks remaining lives and game state. When the ball falls off the bottom, a life is lost and either the ball resets or the game ends. When all bricks are destroyed, the game switches to a victory state. These state transitions are visible to the player.

## Acceptance Criteria

- **Scenario:** Ball exits the bottom of the screen
  - **Given:** The game is in "playing" state
  - **and Given:** The player has at least 1 life remaining
  - **When:** The ball's Y position exceeds the bottom boundary of the canvas
  - **Then:** The player's lives count is decremented by 1
  - **and Then:** The ball is repositioned to the starting position (center-top)
  - **and Then:** The game resumes with gameplay continuing

- **Scenario:** Game over triggered when lives reach zero
  - **Given:** The game is in "playing" state
  - **and Given:** The player has exactly 1 life remaining
  - **When:** The ball exits the bottom of the screen
  - **and When:** Lives are decremented to 0
  - **Then:** The game state transitions to "game over"
  - **and Then:** The playing field is hidden and a game over menu is displayed
  - **and Then:** The game over menu shows final score and options (Replay/Quit)

- **Scenario:** Victory triggered when all bricks are destroyed
  - **Given:** The game is in "playing" state
  - **and Given:** There is exactly one brick remaining
  - **When:** The ball collides with the last brick
  - **and When:** The brick is destroyed
  - **Then:** The game detects that zero bricks remain
  - **and Then:** The game state transitions to "victory"
  - **and Then:** The playing field is hidden and a victory menu is displayed
  - **and Then:** The victory menu shows final score and options (Replay/Quit)

- **Scenario:** Lives display updates in real time
  - **Given:** The game is in "playing" state
  - **When:** A life is lost
  - **Then:** The lives counter on the screen immediately reflects the new count
  - **and Then:** The player can see at all times how many lives remain

- **Scenario:** Score persists through a life loss
  - **Given:** The game is in "playing" state
  - **and Given:** The player has destroyed some bricks and earned points
  - **When:** The ball exits the bottom and a life is lost
  - **Then:** The score display does not reset
  - **and Then:** The score continues from the previous total on the next play

## Related Slices

- Ball boundary detection (Y > canvas height)
- Lives state management (decrement, check zero)
- Game state machine (playing → game over / victory)
- Brick count tracking (detect when all destroyed)
- Game over menu UI (Replay/Quit buttons)
- Victory menu UI (Replay/Quit buttons)
- Score persistence across life losses
