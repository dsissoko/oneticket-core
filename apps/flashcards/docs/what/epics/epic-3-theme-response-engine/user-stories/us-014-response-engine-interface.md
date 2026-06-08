---
title: US-014 — Define ResponseEngine Interface
---

# US-014 — Define ResponseEngine Interface

## Story

As a theme developer, I want a well-defined `ResponseEngine` interface so that I can implement custom answer computation logic for my theme without modifying the core session flow.

## Expected Behavior

The `ResponseEngine` interface exposes a single method `computeNextResponse(card, context)` that returns the computed answer for a given card. The interface is typed and documented so that any theme author can implement it.

## Acceptance Criteria

- [ ] `ResponseEngine` interface defined in `src/types/index.ts`
- [ ] Interface includes `computeNextResponse(card: Card, context?: Record<string, unknown>): ComputedAnswer`
- [ ] `ComputedAnswer` type supports string, SVG, audio, and composite responses
- [ ] Interface is documented with JSDoc explaining the contract
- [ ] No runtime behavior change — this is a type/interface definition only

## Related Epic

[Epic 3 — Theme ResponseEngine Framework](epic-3-theme-response-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
