---
title: US-009 — Animated Note Highlighting
---

# US-009 — Animated Note Highlighting

## Story

As a music learner, I want each note to visually highlight on the score as it plays so that I can follow along and connect the visual position with the sound.

## Expected Behavior

When `playScore()` is called, each note in the SVG is highlighted sequentially as it plays. The highlight is a visual change (color, glow, or size) applied to the current note's SVG element. The highlight moves to the next note when the current note finishes playing. Transitions between highlights are smooth (CSS transition or requestAnimationFrame).

## Acceptance Criteria

- Given a card with multiple notes, when `playScore()` is called, then each note's SVG element is highlighted sequentially as it plays.
- Given a note is being played, then its SVG element has a distinct visual highlight (e.g., color change, glow effect, or increased size).
- Given a note finishes playing, then its highlight is removed and the next note's highlight is applied.
- Given the animation transitions between notes, then the visual change is smooth (no jarring jumps).
- Given the card has `data-note-index` attributes on each note element, then the highlight system uses these to track which note is currently playing.

## Related Epic

[Epic 2 — Animated Score Learning with Tempo Control](epic-2-animated-score/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

[Slice 9 — Note Highlight Engine](../../how/slices/slice-9-note-highlight-engine/slice.md)
