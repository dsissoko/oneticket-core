---
title: 'US-002 — Cannon Controls and Shooting'
---

# US-002 — Cannon Controls and Shooting

## Story

As a player, I want to move the cannon and shoot freely, so that I can destroy aliens with responsive controls.

## Expected Behavior

- Cannon is positioned at the bottom of the playfield.
- Desktop controls: left/right arrows move cannon, Space fires.
- Cannon can have multiple missiles active simultaneously.
- Reload delay is configurable with default 0ms and maximum 5000ms.

## Acceptance Criteria

```gherkin
Scenario: Desktop movement and firing
  Given a game is in progress on desktop
  When the player presses left or right arrow keys
  Then the cannon moves horizontally within playfield bounds
  When the player presses Space
  Then a cannon missile is spawned upward

Scenario: Multiple active cannon missiles
  Given reload delay allows additional shots
  When the player fires repeatedly
  Then multiple cannon missiles may coexist in flight

Scenario: Reload delay constraints
  Given cannon reload delay is configured
  Then the effective value is between 0ms and 5000ms inclusive
  And default reload delay is 0ms
```

## Related Epic

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](epic-0-mvp/epic.md)

## Related Slices

To be linked during slicing.
