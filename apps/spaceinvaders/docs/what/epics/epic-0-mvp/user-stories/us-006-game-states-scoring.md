---
title: US-006 — Game States & Scoring
---

# US-006 — Game States & Scoring

## Story

As a player, I want clear game states with score tracking and persistent best score, so that I know my progress and can compete with myself.

## Expected Behavior

- Game states: menu → playing → game over | victory → restart
- Current score displayed top-left on canvas
- Best score displayed top-right on canvas
- Game Over screen when cannon is hit (1 life)
- Victory screen when all aliens destroyed
- Best score persisted across sessions via localStorage

## Acceptance Criteria

- Given I open the game, then the menu screen is displayed
- Given I start the game, then the playing state begins with score at 0
- Given I destroy an alien, then the score increments
- Given the cannon is hit, then the Game Over screen is shown
- Given all aliens are destroyed, then the Victory screen is shown
- Given the game ends, then the best score is saved to localStorage
- Given I restart the game, then the previous best score is displayed

## Related Epic

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related Slices

- [Slice 6 — Game Flow](../../../how/slices/slice-6-game-flow/slice.md)
