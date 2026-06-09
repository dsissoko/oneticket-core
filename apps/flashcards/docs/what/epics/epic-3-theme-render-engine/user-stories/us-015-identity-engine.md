---
title: US-015 — Implement IdentityEngine for Static Themes
---

# US-015 — Implement IdentityEngine for Static Themes

## Story

As a system, I want a default `IdentityEngine` that returns `card.back` unchanged so that existing themes with static answers continue to work without any code changes.

## Expected Behavior

The `IdentityEngine` implements the `RenderEngine` interface. Its `computeNextResponse()` method simply returns the card's `back` field as a string answer. This is the default engine applied to all themes that do not specify a custom engine.

## Acceptance Criteria

- [ ] `IdentityEngine` class or function implements `RenderEngine`
- [ ] `computeNextResponse(card)` returns `{ type: 'text', value: card.back }`
- [ ] Engine is exported from a dedicated module `src/engine/identity-engine.ts`
- [ ] Unit tests verify identity behavior for all existing card formats
- [ ] Engine is registered as the default in the theme resolution logic

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
