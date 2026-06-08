---
title: "US-002 — Player Cannon & Controls"
---

# US-002 — Player Cannon & Controls

## Story

As a player, I want to move my cannon and fire missiles using keyboard or touch gestures, so that I can play on both desktop and mobile.

## Expected Behavior

- Desktop: arrow keys to move cannon left/right, space to fire
- Mobile: swipe to move cannon, tap to fire
- Touch zones: fire zone (top 80%), movement zone (bottom 20%)
- Reload delay configurable (default 0ms, max 5000ms)
- Cannon rendered at bottom of screen via Canvas API

## Acceptance Criteria

- Given I press left/right arrow keys, then the cannon moves horizontally
- Given I press space, then a missile fires upward from the cannon position
- Given I swipe on mobile, then the cannon moves horizontally
- Given I tap on mobile, then a missile fires upward
- Given I fire rapidly, then the reload delay is respected

## Related Epic

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related Slices

