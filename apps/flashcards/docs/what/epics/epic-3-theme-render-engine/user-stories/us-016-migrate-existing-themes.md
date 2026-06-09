---
title: US-016 — Migrate Existing Themes to RenderEngine Contract
---

# US-016 — Migrate Existing Themes to RenderEngine Contract

## Story

As a system maintainer, I want all existing themes (World Capitals, Multiplication Tables, Conjugaisons FR) to adopt the `RenderEngine` contract so that the framework is validated against real data and backward compatibility is confirmed.

## Expected Behavior

Each existing theme's card sides are updated to use the `CardSide` contract with `renderEngineId: "text"` and the text data in the `data` field. The cards render and flip exactly as before — no visible change to the user.

## Acceptance Criteria

- [ ] World Capitals theme cards use `renderEngineId: "text"` on front and back
- [ ] Multiplication Tables theme cards use `renderEngineId: "text"` on front and back
- [ ] Conjugaisons FR theme cards use `renderEngineId: "text"` on front and back
- [ ] Theme JSON schema updated to support `CardSide` contract (`renderEngineId` + `data`)
- [ ] Visual behavior unchanged: card front/back display identically to before
- [ ] No breaking changes to theme data format — existing JSON files remain valid

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
