---
title: 'US-004 — Game End States and Restart'
---

# US-004 — Game End States and Restart

## Story

As a player, I want clear victory and game-over outcomes with restart, so that each run has closure and replay continuity.

## Expected Behavior

- Game Over if alien missile hits cannon.
- Game Over if aliens reach cannon line.
- Victory if all aliens are destroyed.
- End screens display final score and a Restart button.

## Acceptance Criteria

```gherkin
Scenario: Cannon hit by alien missile
  Given a game is in progress
  When an alien missile collides with the cannon
  Then the game state becomes Game Over
  And the end screen shows final score and Restart

Scenario: Aliens reach cannon line
  Given a game is in progress
  When any alien reaches the cannon line
  Then the game state becomes Game Over
  And the end screen shows final score and Restart

Scenario: All aliens destroyed
  Given a game is in progress
  When the last alien is destroyed
  Then the game state becomes Victory
  And the end screen shows final score and Restart
```

## Related Epic

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](epic-0-mvp/epic.md)

## Related Slices

To be linked during slicing.
