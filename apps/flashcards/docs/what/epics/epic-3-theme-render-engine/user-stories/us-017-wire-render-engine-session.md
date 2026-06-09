---
title: US-017 — Wire RenderEngine into Session Flow
---

# US-017 — Wire RenderEngine into Session Flow

## Story

As a user playing a flashcard session, I want the answer to be resolved through the theme's `RenderEngine` so that computed answers (like music scores) work seamlessly alongside static answers.

## Expected Behavior

When a card is flipped during a session, the `SessionScreen` calls the theme's `RenderEngine.computeNextResponse()` to obtain the answer. For static themes, this returns the same `card.back` as before. For computed themes (future), this returns the dynamically generated answer.

## Acceptance Criteria

- [ ] `SessionScreen` resolves answer via `RenderEngine` instead of reading `card.back` directly
- [ ] `FlashcardDisplay` component accepts `ComputedAnswer` type (not just string)
- [ ] Flip animation timing unchanged for static themes
- [ ] No regression in session scoring or progress tracking
- [ ] Hook `useSession` updated to use engine-resolved answers

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
