---
title: 'US-006 — Responsive Canvas and Mobile Gesture Zones'
---

# US-006 — Responsive Canvas and Mobile Gesture Zones

## Story

As a mobile and desktop player, I want a responsive full-area game canvas with gesture-based mobile controls, so that gameplay remains consistent on any screen.

## Expected Behavior

- `GameScreen` wraps `GameCanvas` with `<div className="flex-grow flex flex-col overflow-hidden">`.
- Canvas CSS is `width: 100%` and `height: 100%` with no fixed pixel dimensions.
- Logical dimensions are read from `parentElement.clientWidth/Height` on mount and resize.
- Alien and cannon sizes scale proportionally to canvas dimensions.
- Mobile zones are percentage-based:
  - Top 80% tap to fire.
  - Bottom 20% horizontal drag to move cannon.

## Acceptance Criteria

```gherkin
Scenario: AppShell canvas fill behavior
  Given GameScreen is rendered
  Then GameCanvas fills the available AppShell content area
  And no fixed pixel width or height is required for canvas CSS

Scenario: Responsive dimension updates
  Given the viewport size changes
  When resize handling runs
  Then logical game dimensions are recalculated from parent element size
  And gameplay entities remain proportionally scaled

Scenario: Mobile gesture controls
  Given a game is running on mobile
  When the player taps in the top 80 percent of canvas height
  Then a cannon shot is fired
  When the player drags horizontally in the bottom 20 percent
  Then cannon horizontal movement follows the drag
```

## Related Epic

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../epic.md)

## Related Slices

- [Slice 1 — Foundation Runtime and Responsive Canvas](../../../../how/slices/slice-1-foundation-runtime-and-responsive-canvas/slice.md)
