---
title: US-014 — Define RenderEngine Interface
---

# US-014 — Define RenderEngine Interface

## Story

As a theme developer, I want a well-defined `RenderEngine` interface so that I can implement custom answer computation logic for my theme without modifying the core session flow.

## Expected Behavior

The `RenderEngine` interface exposes a single method `computeNextResponse(card, context)` that returns the computed answer for a given card. The interface is typed and documented so that any theme author can implement it.

## Acceptance Criteria

- [ ] `RenderEngine` interface defined in `src/types/index.ts`
- [ ] Interface includes `computeNextResponse(card: Card, context?: Record<string, unknown>): ComputedAnswer`
- [ ] `ComputedAnswer` type supports string, SVG, audio, and composite responses
- [ ] Interface is documented with JSDoc explaining the contract
- [ ] No runtime behavior change — this is a type/interface definition only

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
