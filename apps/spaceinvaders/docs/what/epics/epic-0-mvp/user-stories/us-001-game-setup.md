# US-001 — Game Setup

## Story

As a casual player, I want to start the game from a clear start screen so that I can begin playing Space Invaders immediately with a fresh game state.

## Expected Behavior

- Start screen displays "Space Invaders" title and a prominent start button
- HUD (heads-up display) shows score initialized to 0 and lives initialized to 3
- Clicking/tapping the start button transitions to the playing state
- Game loop begins with formation at top-center and player cannon at bottom-center
- All game entities are rendered on the Canvas with proper initial positions

## Acceptance Criteria

```gherkin
Feature: Game Initialization and Start Screen

Scenario: Player views start screen
  Given the game has loaded
  When the page is displayed
  Then I see a title "Space Invaders"
  And I see a clickable "Start Game" button
  And the HUD displays "Score: 0"
  And the HUD displays "Lives: 3"

Scenario: Player starts a new game
  Given I am on the start screen
  When I click the "Start Game" button
  Then the game state transitions to "Playing"
  And the formation appears at the top-center of the screen
  And the player cannon appears at the bottom-center
  And the game loop begins rendering at 60 FPS
  And the score remains 0
  And lives remain 3

Scenario: Player restarts after game over
  Given the game has ended
  And I am on the game over screen
  When I click the "Start Game" button
  Then the score resets to 0
  And lives reset to 3
  And all enemies respawn in formation
  And the game loop resumes
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

- [Slice 1 — Foundation](slice-1-foundation/slice.md)
