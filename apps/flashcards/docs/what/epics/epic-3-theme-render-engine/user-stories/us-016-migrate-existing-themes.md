---
title: US-016 — Migrate Existing Themes to RenderEngine Contract
---

# US-016 — Migrate Existing Themes to RenderEngine Contract

## Story

As a system maintainer, I want all existing themes (World Capitals, Multiplication Tables, Conjugaisons FR) to adopt the `RenderEngine` contract so that the framework is validated against real data and backward compatibility is confirmed.

## Expected Behavior

Each existing theme JSON file is updated to include an optional `renderEngine` field (or the engine is resolved by default). The cards render and flip exactly as before — no visible change to the user.

## Acceptance Criteria

- [ ] World Capitals theme uses `IdentityEngine` (explicit or default)
- [ ] Multiplication Tables theme uses `IdentityEngine` (explicit or default)
- [ ] Conjugaisons FR theme uses `IdentityEngine` (explicit or default)
- [ ] Theme JSON schema updated to support optional `renderEngine` field
- [ ] Visual behavior unchanged: card front/back display identically to before
- [ ] No breaking changes to theme data format — existing JSON files remain valid

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
