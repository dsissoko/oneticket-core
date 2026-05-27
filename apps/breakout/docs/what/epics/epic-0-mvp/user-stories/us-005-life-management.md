# US-005 — Life Management and Game Over

## Story

As a breakout player
I want to start with 3 lives and lose one each time the ball passes below the paddle
So that I can understand how close I am to losing and plan my play accordingly

## Expected Behavior

Players begin a game with 3 lives displayed clearly on the screen. Each time the ball falls past the bottom of the paddle (outside the playable area), one life is deducted and the ball returns to its starting position. When the life counter reaches 0, the game transitions to a Game Over state and displays a loss screen with an option to replay or quit.

## Acceptance Criteria

### Given-When-Then Format

```gherkin
Feature: Life Management and Game Over

Scenario: Player starts with 3 lives
  Given a new game is initialized
  Then the life counter displays "3"
  And the lives visual indicator shows 3 active lives

Scenario: Ball falling below paddle deducts one life
  Given the game is active with 3 lives
  When the ball passes below the paddle
  Then the life counter decrements to "2"
  And the ball resets to starting position
  And the ball is ready for the next play attempt

Scenario: Ball reset after life loss
  Given a life has just been lost
  And the life counter displays "2"
  When the game resumes
  Then the ball is positioned at starting location (center-top)
  And the ball has zero velocity
  And the player can move the paddle

Scenario: Game Over when lives reach zero
  Given the game is active with 1 life remaining
  When the ball passes below the paddle
  Then the life counter displays "0"
  And the game transitions to Game Over state
  And the Loss screen is displayed

Scenario: Loss screen displays game over message
  Given the game has ended with 0 lives
  Then a Game Over message appears on screen
  And a replay button is visible
  And a quit button is visible
  And the current brick count is shown (optional scoring info)

Scenario: Player can replay after losing
  Given the Loss screen is displayed
  When the player clicks the replay button
  Then the game resets to initial state
  And life counter returns to 3
  And all bricks are restored
  And the ball is at starting position

Scenario: Life counter never exceeds 3
  Given the game is active with 3 lives
  When the ball bounces off the paddle (no loss scenario)
  Then the life counter remains "3"
  And no additional lives are gained
```

## Related Slices

- [Slice 1 — Game Board and Paddle Setup](../../../how/slices/slice-1-game-setup/slice.md)
- [Slice 5 — Game State Management and Transitions](../../../how/slices/slice-5-game-state-management/slice.md)
- [Slice 7 — Win/Loss Conditions and Final Integration](../../../how/slices/slice-7-win-loss-conditions/slice.md)
