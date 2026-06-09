---
title: US-015 — Implement TextEngine for Static Themes
---

# US-015 — Implement TextEngine for Static Themes

## Story

As a system, I want a default `TextEngine` that renders `card.front` and `card.back` data as plain text so that existing themes with static answers continue to work without any code changes.

## Expected Behavior

The `TextEngine` implements the `RenderEngine` interface. Its `render(data, target)` method renders the text data into the target DOM element, handling single-line and multi-line content (`\n` breaks). This is the default engine applied to all card sides that use `renderEngineId: "text"`.

## Acceptance Criteria

- [ ] `TextEngine` class implements `RenderEngine`
- [ ] `render(data, target)` renders text content into the target DOM element
- [ ] Handles multi-line text with `\n` line breaks (Conjugaisons FR)
- [ ] Engine is exported from a dedicated module `src/engine/text-engine.ts`
- [ ] Unit tests verify text rendering behavior for all existing card formats
- [ ] Engine is registered as default in the engine registry for `renderEngineId: "text"`

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
