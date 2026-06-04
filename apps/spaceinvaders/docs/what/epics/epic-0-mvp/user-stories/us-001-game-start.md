# US-001 — Game Start

## Story

As a player, I want to see a title screen with a Start button so that I can begin a new game.

## Expected Behavior

The game displays a title screen with:
- "Space Invaders" logo or title text clearly visible
- A "Start" button prominently displayed
- Clicking the "Start" button initiates Wave 1 of the game

## Acceptance Criteria

```gherkin
Feature: Game Start Screen
  
  Scenario: Display title screen on initial load
    Given the game application is loaded
    When the page first renders
    Then the title screen should be displayed
    And the "Space Invaders" title should be visible
    And the "Start" button should be visible
  
  Scenario: Start game from title screen
    Given the title screen is displayed
    When the player clicks the "Start" button
    Then Wave 1 should begin
    And the enemy formation (11×5 grid with 55 enemies) should spawn
    And the game loop should start rendering at 60 FPS
  
  Scenario: Mobile touch support for start button
    Given the title screen is displayed on a mobile device
    When the player taps the "Start" button
    Then Wave 1 should begin
    And the game should initialize with mobile touch controls enabled
```

## Related Epic

[Epic 0 — MVP Complete Playable Space Invaders Game](epic.md)

## Related Slices

- [Slice 1 — Foundation Game Loop](slice-1-foundation-game-loop/slice.md)
- [Slice 8 — Game States and Wave Progression](slice-8-game-states-progression/slice.md)
