# US-003 — Lives System & Menus

## Story

As a player
I want to start with 3 lives, lose a life when the ball falls off the bottom, and see menu options to start, replay, and quit
So that I can manage the game flow and replay after game over

## Expected Behavior

- **Game Initialization**: Player starts a game session with exactly 3 lives displayed on screen
- **Life Loss**: When the ball exits the bottom edge of the screen, the player loses 1 life; the ball resets to center position and the game resumes
- **Game Over Screen**: When lives reach 0, the game transitions to a "Game Over" screen
- **Menu Options**: Victory and Defeat screens display "Replay" and "Quit" buttons, allowing the player to restart or return to the main menu
- **Pause Menu** (optional in V1): Player can press Pause to freeze the game and access a pause menu with Resume option

## Acceptance Criteria

```gherkin
Feature: Lives System & Menu Navigation

  Scenario: Game starts with 3 lives
    Given the game starts
    When I load the game
    Then I have 3 lives displayed

  Scenario: Lose a life when ball falls
    Given a life is active
    When the ball falls below the screen
    Then I lose one life
    And the ball resets to center
    And the game resumes

  Scenario: Game ends at 0 lives
    Given I have lost all lives
    When lives reach 0
    Then the game ends with 'Game Over' screen
    And I cannot move the paddle
    And the ball stops moving

  Scenario: Replay after game end
    Given the game ends
    When the win/lose state is reached
    Then I can click 'Replay' button
    And 'Replay' resets the game and returns to menu

  Scenario: Quit to menu
    Given the game ends
    When the win/lose state is reached
    Then I can click 'Quit' button
    And 'Quit' returns to the main menu

  Scenario: Pause during gameplay
    Given the game is running
    When I click 'Pause'
    Then the game pauses and shows the pause menu
    And the ball and paddle stop moving

  Scenario: Resume from pause
    Given the pause menu is open
    When I click 'Resume'
    Then the game resumes
    And the ball and paddle continue from paused state
```

## Technical Description

### State Management
- **Global Game State**: Tracks current game phase (Menu, Playing, Paused, Victory, Defeat)
- **Player State**: Maintains live count (0–3), current score/progress
- **Ball State**: Position and velocity reset to initial values when a life is lost
- **Paddle State**: Reset to center position after life loss

### Components Required
- **Lives Display**: UI component showing remaining lives (numeric or icon-based)
- **Pause Button**: Toggle to pause/resume during gameplay
- **Pause Menu Panel**: Modal or overlay displaying Resume and Quit options
- **Game Over Screen**: End-state UI showing final state (Victory/Defeat) with Replay and Quit buttons
- **Main Menu**: Start screen with Start, Speed Slider, and Quit buttons

### Mouse Input Handling
- Click detection on all menu buttons (Start, Replay, Quit, Resume, Pause)
- Slider interaction for ball speed adjustment in main menu
- Button state styling (hover, active, disabled) for user feedback

### Collision Detection Integration
- Ball collision with screen bottom edge triggers life loss
- No ball reflection on bottom edge (ball is lost, not bounced)

### Flow Diagram
```
Menu → [Start] → Playing → Paused ↔ [Resume/Pause toggle]
                    ↓
                Victory/Defeat → [Replay/Quit] → Menu
```

## Story Points Estimation

**Estimated: 8 points**

### Justification
- Medium-high complexity due to state machine implementation (4 game states + pause)
- Multiple UI components to create and style (pause menu, game over screen, lives display)
- Coordination between ball physics (life loss) and game state transitions
- Mouse event handling across 5+ interactive buttons
- Testing required for all state transitions and edge cases (multi-life loss sequence, etc.)

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
