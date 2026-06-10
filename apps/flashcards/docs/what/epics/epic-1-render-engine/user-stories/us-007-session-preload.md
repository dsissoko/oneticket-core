---
title: 'US-007 — SessionScreen Precompute Lifecycle'
---

# US-007 — SessionScreen Precompute Lifecycle

## Story

As a learner, I want the back side of a card to be precomputed while I read the question so that the flip is instant when I tap.

## Expected Behavior

SessionScreen calls engine.precompute?.(back.data) immediately after the question (front side) is displayed. This runs in the background while the user reads the question. When the user taps to flip: if precompute is done, the flip is instant; if precompute is still running, SessionScreen waits for completion before flipping. TextEngine and MarkdownEngine do NOT implement precompute — flip is always instant for these engines. The mechanism must be universal so that future engines (e.g. ScoreAudioEngine) benefit automatically.

## Acceptance Criteria

- SessionScreen calls engine.precompute?.(back.data) immediately after question display
- SessionScreen waits for precompute completion before flipping if still running
- Precompute strategy is universal — applies to all engines automatically
- TextEngine and MarkdownEngine have no precompute — flip is instant
- Existing tests pass without modification
- Build passes

## Related Epic

[Epic 1 — RenderEngine Refactoring](epic-1-render-engine/epic.md)

## Related Sprints

[Sprint 1 — RenderEngine Foundation](sprint-1-render-engine/sprint.md)
