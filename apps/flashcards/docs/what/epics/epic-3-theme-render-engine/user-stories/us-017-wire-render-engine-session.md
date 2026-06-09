---
title: US-017 — Wire RenderEngine into Session Flow
---

# US-017 — Wire RenderEngine into Session Flow

## Story

As a user playing a flashcard session, I want each card side to be rendered through the `RenderEngine` selected by its `renderEngineId` so that computed answers (like music scores) work seamlessly alongside static answers.

## Expected Behavior

When a card is displayed during a session, the `SessionScreen` resolves the `RenderEngine` for the card's front side via `renderEngineId` and calls `render(data, target)`. On card flip, the back side's engine is used the same way. For static themes (`renderEngineId: "text"`), this renders plain text as before. For computed themes (future), the engine may use `precompute()` for async preparation.

## Acceptance Criteria

- [ ] `SessionScreen` renders card sides via `RenderEngine.render(data, target)` instead of reading raw strings
- [ ] `FlashcardDisplay` component accepts `CardSide` contract (`renderEngineId` + `data`)
- [ ] Flip animation timing unchanged for static themes
- [ ] No regression in session scoring or progress tracking
- [ ] Hook `useSession` updated to use engine-resolved rendering
- [ ] Preloading strategy: `precompute()` triggered after question display, instant flip if done, wait if still running

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
