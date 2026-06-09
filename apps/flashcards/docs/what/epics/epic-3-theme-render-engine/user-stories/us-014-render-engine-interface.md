---
title: US-014 — Define RenderEngine Interface
---

# US-014 — Define RenderEngine Interface

## Story

As a theme developer, I want a well-defined `RenderEngine` interface so that I can implement custom rendering logic for my theme without modifying the core session flow.

## Expected Behavior

The `RenderEngine` interface exposes `render(data, target)` for rendering a card side into a DOM target, and an optional `precompute?(data)` for async pre-computation (used by ScoreAudioEngine only). Each card side references a `renderEngineId` string that selects the engine implementation. The interface is typed and documented so that any theme author can implement it.

## Acceptance Criteria

- [ ] `RenderEngine` interface defined in `src/types/index.ts`
- [ ] Interface includes `render(data: unknown, target: HTMLElement): void`
- [ ] Interface includes optional `precompute?(data: unknown): Promise<void>`
- [ ] `CardSide` type defined: `{ renderEngineId: string, data: unknown }`
- [ ] `RenderEngineId` type defined: `'text' | 'markdown' | 'score' | 'score-audio'`
- [ ] Engine registry function: `resolveEngine(renderEngineId: string): RenderEngine`
- [ ] Interface is documented with JSDoc explaining the contract
- [ ] No runtime behavior change — this is a type/interface definition only

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
