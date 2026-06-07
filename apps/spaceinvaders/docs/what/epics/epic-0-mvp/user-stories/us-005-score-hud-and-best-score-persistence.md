---
title: 'US-005 — Score HUD and Best Score Persistence'
---

# US-005 — Score HUD and Best Score Persistence

## Story

As a player, I want to see my current and best score, so that progress is visible during and across sessions.

## Expected Behavior

- Current score is displayed in the HUD top-left.
- Best score is displayed in the HUD top-right.
- Best score persists in localStorage across sessions.

## Acceptance Criteria

```gherkin
Scenario: HUD score placement
  Given a game is running
  Then current score is visible at top-left
  And best score is visible at top-right

Scenario: Best score persistence
  Given a player completes a run with score S
  When S is greater than stored best score
  Then best score is updated in localStorage
  And remains available after page reload
```

## Related Epic

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../epic.md)

## Related Slices

- [Slice 4 — Score HUD and Best Score Persistence](../../../../how/slices/slice-4-score-hud-and-best-score-persistence/slice.md)
