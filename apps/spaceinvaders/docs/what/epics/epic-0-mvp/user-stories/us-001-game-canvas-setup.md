---
title: "US-001 — Game Canvas Setup"
---

# US-001 — Game Canvas Setup

## Story

As a player, I want the game to display a responsive canvas that fills the content area, so that I can play on any screen size.

## Expected Behavior

- Canvas fills the content area using flex-grow pattern from breakout scaffold
- Adaptive sizing: alien grid and cannon scale proportionally to viewport
- Wave width ≈ 70% of canvas width on all screen sizes
- Game loop runs at consistent frame rate

## Acceptance Criteria

- Given I open the game on any device, then the canvas fills the available content area
- Given I resize the browser window, then all game elements scale proportionally
- Given the viewport changes, then the wave width remains approximately 70% of canvas width

## Related Epic

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related Slices

