# US-003 — Gestion des vies et fin de partie

## Story

En tant que joueur, je veux perdre une vie quand la balle atteint le bas, et terminer quand plus de vies, afin que la progression soit claire.

## Expected Behavior

- Player starts with 3 lives
- When ball reaches bottom of screen, player loses 1 life
- When lives reach 0, game ends with game over state
- When all bricks are destroyed with lives remaining, game ends with victory state
- Lives counter is displayed and updated in real-time

## Acceptance Criteria

```gherkin
Feature: Lives system and game over detection
  
  Scenario: Player starts with 3 lives
    Given a new game is started
    When the game initializes
    Then the player should have 3 lives
  
  Scenario: Player loses a life when ball reaches bottom
    Given the game is in progress with 3 lives
    When the ball reaches the bottom of the screen
    Then the player should have 2 lives
    And the ball should reset to the starting position
  
  Scenario: Game ends when lives reach zero
    Given the game is in progress with 1 life remaining
    When the ball reaches the bottom of the screen
    Then the game should end with a game over state
    And the player should not be able to continue playing
  
  Scenario: Victory when all bricks destroyed before game over
    Given the game is in progress
    When all bricks are destroyed
    And the player still has at least 1 life remaining
    Then the game should end with a victory state
```

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
