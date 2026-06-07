---
title: 'US-001 — Alien Wave Movement and Fire'
---

# US-001 — Alien Wave Movement and Fire

## Story

As a player, I want a moving alien wave that fires downward, so that the core Space Invaders challenge exists.

## Expected Behavior

- Aliens are instantiated as a 5×11 grid with one shared sprite.
- The wave occupies approximately 70% of current screen width.
- Movement alternates horizontally and drops one row at boundaries.
- Aliens fire missiles downward at random intervals.

## Acceptance Criteria

```gherkin
Scenario: Wave shape and movement pattern
  Given a new game starts
  When the first wave is rendered
  Then exactly 55 aliens are present in a 5x11 grid
  And the wave width is approximately 70% of the screen width
  And movement follows left-right-drop-right-left-drop pattern over time

Scenario: Random alien shooting
  Given a game is in progress
  When alien shooting events occur
  Then missiles are emitted downward from aliens
  And shooting is non-deterministic from the player's perspective
```

## Related Epic

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../epic.md)

## Related Slices

- [Slice 2 — Alien Wave and Cannon Controls](../../../../how/slices/slice-2-alien-wave-and-cannon-controls/slice.md)
