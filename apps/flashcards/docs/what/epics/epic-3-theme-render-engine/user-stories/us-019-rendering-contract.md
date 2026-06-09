---
title: US-019 — Define and Implement Rendering Contract for Questions and Answers
---

# US-019 — Define and Implement Rendering Contract for Questions and Answers

## Story

As a user playing a flashcard session, I want questions and answers to be rendered consistently through the `RenderEngine` so that the display adapts to the card side's `renderEngineId` (text, markdown, score, score-audio) without the session logic knowing about rendering details.

## Expected Behavior

The unified `RenderEngine` contract handles both rendering and optional pre-computation. Each card side (`front` and `back`) declares a `renderEngineId` that selects the engine. The engine's `render(data, target)` method renders the content into the DOM target. For engines with `precompute()`, pre-computation is triggered after the question is displayed, enabling instant flip when ready.

For existing themes (World Capitals, Multiplication Tables, Conjugaisons FR), both card sides use `renderEngineId: "text"`. The rendering layer validates that the architecture correctly dispatches to the right engine based on `renderEngineId` — preparing the ground for Solfège's `score` and `score-audio` engines.

## Acceptance Criteria

- [ ] `RenderEngine.render(data, target)` renders card side content into the DOM target
- [ ] Engine dispatch based on `renderEngineId`: `"text"` → TextEngine, `"markdown"` → MarkdownEngine, `"score"` → ScoreEngine, `"score-audio"` → ScoreAudioEngine
- [ ] TextEngine (`"text"`) handles single-line and multi-line content (Conjugaisons FR has `\n` line breaks)
- [ ] MarkdownEngine stub (`"markdown"`) exists — ready for markdown-to-HTML integration
- [ ] ScoreEngine stub (`"score"`) exists — ready for VexFlow integration
- [ ] ScoreAudioEngine stub (`"score-audio"`) exists — ready for VexFlow + Tone.js integration
- [ ] `FlashcardDisplay` component uses `RenderEngine.render(data, target)` for front and back
- [ ] All 3 existing themes display identically to before (no visual regression)
- [ ] Preloading strategy: `precompute()` triggered after question display, instant flip if done, wait if still running
- [ ] Rendering contract documented in `architecture.md`

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

[Slice 8 — RenderEngine Framework](../../how/slices/slice-8-render-engine-framework/slice.md)
[Slice 14 — Rendering Engine Implementation](../../how/slices/slice-14-rendering-engine/slice.md)
