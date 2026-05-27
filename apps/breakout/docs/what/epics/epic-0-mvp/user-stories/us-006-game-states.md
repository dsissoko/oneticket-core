# US-006 — Game State Transitions (Menu, Active, Pause, Win, Loss)

## Story

As a **player**, I want to experience clear, distinct game states (Menu, Active, Pause, Win, Loss) so that I understand the current game status and can navigate between gameplay, settings, and replay options with confidence.

## Expected Behavior

The game manages five distinct states:

1. **Menu State** — The initial state where the player can:
   - View the game title and instructions
   - Adjust the ball speed slider before starting
   - Click a "Start Game" button to begin active gameplay
   - View current settings (lives, speed)

2. **Active State** — During normal gameplay:
   - Ball continuously moves with physics simulation
   - Paddle responds immediately to input (arrow keys)
   - Brick collisions are detected and bricks are removed
   - Lives decrease when the ball passes below the paddle
   - Ball resets to starting position after life loss
   - Player can continue until all lives are lost or all bricks are destroyed
   - Speed slider is adjustable in real-time

3. **Pause State** (optional, if available):
   - Game physics freeze but visual state remains visible
   - Player can resume to Active state
   - Player can return to Menu state

4. **Win State** — When all bricks are destroyed:
   - Ball and paddle freeze on screen
   - Victory message is displayed
   - "Play Again" button restarts the game to Menu state
   - Score/stats are displayed

5. **Loss State** — When lives reach 0:
   - Ball and paddle freeze on screen
   - Game Over message is displayed
   - "Try Again" button restarts the game to Menu state
   - Final stats (bricks destroyed, lives lost) are displayed

### State Transitions

- **Menu → Active**: Player clicks "Start Game"
- **Active → Loss**: Player loses all lives (lives = 0)
- **Active → Win**: All bricks are destroyed
- **Win → Menu**: Player clicks "Play Again"
- **Loss → Menu**: Player clicks "Try Again"
- **Active → Pause**: Player presses spacebar or clicks pause button (if implemented)
- **Pause → Active**: Player resumes
- **Pause → Menu**: Player exits to menu

## Acceptance Criteria

```gherkin
Feature: Game State Management

  Scenario: Player starts from Menu state
    Given the game is loaded
    When the page renders
    Then the game displays the Menu state
    And the game title is visible
    And a "Start Game" button is available
    And the speed slider is visible and editable

  Scenario: Transition from Menu to Active state
    Given the player is on the Menu state
    When the player clicks "Start Game"
    Then the game transitions to Active state
    And the game board becomes visible
    And the ball begins moving
    And the paddle is positioned at the bottom center
    And the brick grid is fully populated

  Scenario: Active state displays correct information
    Given the game is in Active state
    When gameplay is ongoing
    Then the current life count is displayed
    And the remaining brick count is visible
    And the current ball speed is reflected from the slider
    And the paddle responds to arrow key input
    And the ball bounces according to physics rules

  Scenario: Ball loss triggers state transition
    Given the game is in Active state
    And the player has more than 0 lives
    When the ball passes below the paddle
    Then the life count decreases by 1
    And the ball resets to the starting position
    And the game remains in Active state

  Scenario: All lives lost triggers Loss state
    Given the game is in Active state
    And the player has 1 life remaining
    When the ball passes below the paddle
    Then the game transitions to Loss state
    And the ball freezes on screen
    And a "Game Over" message is displayed
    And a "Try Again" button becomes available

  Scenario: All bricks destroyed triggers Win state
    Given the game is in Active state
    And all bricks have been destroyed
    When the ball collides with the last brick
    Then the game transitions to Win state
    And the ball freezes on screen
    And a victory message is displayed (e.g., "You Won!")
    And a "Play Again" button becomes available

  Scenario: Return to Menu from Loss state
    Given the game is in Loss state
    When the player clicks "Try Again"
    Then the game transitions to Menu state
    And all game state is reset
    And the brick grid is repopulated
    And lives reset to 3

  Scenario: Return to Menu from Win state
    Given the game is in Win state
    When the player clicks "Play Again"
    Then the game transitions to Menu state
    And all game state is reset
    And the brick grid is repopulated
    And lives reset to 3

  Scenario: Active state ends with all bricks destroyed
    Given the game is in Active state
    When every brick has been destroyed by ball collisions
    Then the game should display the Win state
    And the paddle should be frozen
    And the ball should be frozen at its current position
```

## Related Slices

- **[Slice 1 — Game Board and Paddle Setup](../../../how/slices/slice-1-game-setup/slice.md)** — Initialize the game board and paddle structure
- **[Slice 5 — Game State Management and Transitions](../../../how/slices/slice-5-game-state-management/slice.md)** — Core state machine implementation
- **[Slice 6 — Speed Adjustment and UI Controls](../../../how/slices/slice-6-speed-control/slice.md)** — Speed slider feedback during active state
- **[Slice 7 — Win/Loss Conditions and Final Integration](../../../how/slices/slice-7-win-loss-conditions/slice.md)** — Condition detection and final state display
