---
title: Epic 3 — Theme RenderEngine Framework
---

# Epic 3 — Theme RenderEngine Framework

## Goal

Introduce a unified `RenderEngine` contract with `render(data, target)` and optional `precompute?(data)`, and migrate all existing themes to this framework, ensuring full backward compatibility. Each card side references a `renderEngineId` string that selects the engine implementation.

## Business Value

Currently, flashcard answers are pre-baked as raw strings in JSON files. This works for simple Q&A but couples the session flow directly to static card data. The `RenderEngine` framework decouples answer resolution from card storage through a clean interface: each card side (`front` and `back`) declares a `renderEngineId` that selects the rendering engine. Existing themes remain fully functional with zero behavioral change, while the architecture is ready for future computed-answer themes.

## Scope

- Define the `RenderEngine` interface: `render(data, target) → void` with optional `precompute?(data) → Promise<void>`
- Define `CardSide` contract: `{ renderEngineId: string, data: unknown }`
- Introduce built-in engines: `TextEngine` (plain text), `MarkdownEngine` (markdown to HTML)
- Implement engine registry: resolves engine by `renderEngineId` — defaults to `TextEngine`
- Migrate existing themes (World Capitals, Multiplication Tables, Conjugaisons FR) to use `renderEngineId: "text"` on each card side
- Wire the `RenderEngine` into the session flow so that card sides are rendered through the engine
- Implement preloading strategy: `precompute()` triggered after question display, instant flip if done, wait if still running
- Ensure existing tests pass without modification

## Out of Scope

- `ScoreEngine` and `ScoreAudioEngine` implementations — covered by Epic 1 (Solfège)
- Animated score rendering — covered by Epic 2 (Animated Score Learning)

## Related User Stories

<!-- @analyst fills this section — write filename only, no relative path, no ../
     US files are always in user-stories/ subfolder — never flat in the epic directory
     The build script resolves the correct path automatically.
     Example: [US-001 — Skeleton Setup](us-001-skeleton-setup.md) -->

- [US-014 — Define RenderEngine Interface](us-014-render-engine-interface.md)
- [US-015 — Implement TextEngine for Static Themes](us-015-identity-engine.md)
- [US-016 — Migrate Existing Themes to RenderEngine Contract](us-016-migrate-existing-themes.md)
- [US-017 — Wire RenderEngine into Session Flow](us-017-wire-render-engine-session.md)
- [US-018 — Validate Existing Tests Pass Unchanged](us-018-validate-existing-tests.md)
- [US-019 — Define and Implement Rendering Contract for Questions and Answers](us-019-rendering-contract.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

- [Slice 8 — RenderEngine Framework](slice-8-render-engine-framework/slice.md)
- [Slice 14 — Rendering Engine Implementation](slice-14-rendering-engine/slice.md)

## Related Epics

- [Epic 0 — MVP Flashcard App](epic-0-mvp/epic.md)
- [Epic 1 — Solfège Bilingual Score Cards](epic-1-solfege/epic.md)
- [Epic 2 — Animated Score Learning](epic-2-animated-score/epic.md)
