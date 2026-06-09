---
title: US-018 — Validate Existing Tests Pass Unchanged
---

# US-018 — Validate Existing Tests Pass Unchanged

## Story

As a developer, I want all existing tests to pass without modification after the RenderEngine migration so that backward compatibility is guaranteed and no regressions are introduced.

## Expected Behavior

The full test suite (unit tests, hook tests, component tests) runs green after the RenderEngine integration. No test file requires changes — the `TextEngine` ensures static themes behave identically.

## Acceptance Criteria

- [ ] All existing unit tests pass without modification
- [ ] `useTheme.test.ts` passes with `TextEngine` integration
- [ ] `useSession.test.ts` passes with engine-resolved rendering
- [ ] `useLearningMode.test.ts` passes unchanged
- [ ] Component tests for `FlashcardDisplay` pass unchanged
- [ ] Build passes with zero TypeScript errors
- [ ] Test coverage does not decrease

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
