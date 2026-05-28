# US-005 — Life Management and Game Over States

## User Story (Mike Cohn Format)

As a **player**, I want to **manage my lives throughout the game**, so that **I understand the consequences of missing the ball and when the game ends**.

## Description

The game tracks the player's remaining lives (initially 3) and decrements the count each time the ball reaches the bottom of the screen. The player can see how many lives they have left displayed prominently in the game HUD. When lives reach zero, the game transitions to a Game Over state with clear feedback.

## Acceptance Criteria

### Feature: Life Display and Management

```gherkin
Scenario: Player sees initial life count at game start
  Given the game has started
  When the gameplay screen displays
  Then the HUD shows "Lives: 3"

Scenario: Player loses a life when ball falls below paddle
  Given the game is active with "3" lives remaining
  And the ball is moving downward
  When the ball passes below the paddle without collision
  Then the life counter decrements to "2"
  And the ball resets to initial position
  And the paddle resets to center position
  And the game continues playing

Scenario: Player loses multiple lives over time
  Given the game is active with "3" lives
  When the ball falls below the paddle three times in succession
  Then the life counter updates to "2" after the first fall
  And the life counter updates to "1" after the second fall
  And the life counter updates to "0" after the third fall
  And each life loss triggers a ball reset

Scenario: HUD life display updates in real-time
  Given the game is active
  When a life is lost
  Then the HUD immediately reflects the new life count
  And the display remains visible and readable throughout gameplay
```

### Feature: Game Over Detection and Transition

```gherkin
Scenario: Game Over screen appears when lives are exhausted
  Given the game is active with "1" life remaining
  When the ball falls below the paddle
  Then the game state transitions to "Game Over"
  And the life counter shows "0"
  And the gameplay loop stops

Scenario: Game Over screen displays with options
  Given the game is in "Game Over" state
  When the Game Over screen renders
  Then the screen displays "Game Over" as the title
  And the screen shows the final life count ("0")
  And the screen provides a "Replay" button
  And the screen provides a "Quit" button

Scenario: Player can replay after Game Over
  Given the game is in "Game Over" state
  When the player clicks the "Replay" button
  Then the game state transitions to "Menu"
  And the life count resets to "3"
  And the brick wall is fully restored
  And the player can start a new game

Scenario: Player can quit after Game Over
  Given the game is in "Game Over" state
  When the player clicks the "Quit" button
  Then the game transitions to the main menu
  And all game state is cleared
```

### Feature: Ball Reset After Life Loss

```gherkin
Scenario: Ball resets to initial position after life loss
  Given the ball has fallen below the paddle
  When a life is lost
  Then the ball returns to the center-top area of the game area
  And the ball velocity is reset to the configured speed
  And the game resumes with the ball ready to fall

Scenario: Paddle resets after ball loss
  Given the ball has fallen below the paddle
  When a life is lost
  Then the paddle returns to the center-bottom position
  And the paddle remains under player control
```

## Definition of Done

- [ ] Life counter initialized to 3 at game start
- [ ] Life counter decrements when ball passes below paddle
- [ ] Life display updates immediately in HUD
- [ ] Ball and paddle reset to initial positions after life loss
- [ ] Game Over state triggers when lives reach 0
- [ ] Game Over screen renders with appropriate UI (title, final count, buttons)
- [ ] "Replay" button resets game state and returns to Menu
- [ ] "Quit" button returns to main menu and clears game state
- [ ] All acceptance criteria pass (Gherkin scenarios)
- [ ] No console errors or warnings
- [ ] Code follows vanilla JavaScript conventions

## Related Slices

- [Slice 5 — Game States and Life Management](../../../../how/slices/slice-5-game-states/slice.md)

## Notes

- Life count is persistent within a single game session but resets on replay
- Visual feedback for life loss (ball reset) should be immediate and clear
- Game Over is distinct from Victory state (all bricks destroyed)
- The Game Over screen is the final state before returning to menu
