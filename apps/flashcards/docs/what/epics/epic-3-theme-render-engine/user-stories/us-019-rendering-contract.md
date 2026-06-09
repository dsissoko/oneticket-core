---
title: US-019 — Define and Implement Rendering Contract for Questions and Answers
---

# US-019 — Define and Implement Rendering Contract for Questions and Answers

## Story

As a user playing a flashcard session, I want questions and answers to be rendered consistently through a dedicated rendering layer so that the display adapts to the answer type (text, SVG, audio, composite) without the session logic knowing about rendering details.

## Expected Behavior

A rendering contract separates **what to display** from **how to display it**. Each theme's cards are rendered through two functions:

- **`renderQuestion(card)`** — renders the card front (question) into the DOM
- **`renderAnswer(answer: ComputedAnswer)`** — renders the computed answer into the DOM based on its `AnswerType`

For existing themes (World Capitals, Multiplication Tables, Conjugaisons FR), both functions handle `type: 'text'` only. The rendering layer validates that the architecture correctly dispatches to the right renderer based on answer type — preparing the ground for Solfège's `svg` and `audio` types.

## Acceptance Criteria

- [ ] `renderQuestion(card: Card) → ReactNode` renders `card.front` as styled text
- [ ] `renderAnswer(answer: ComputedAnswer) → ReactNode` dispatches based on `answer.type`
- [ ] Text renderer (`type: 'text'`) handles single-line and multi-line content (Conjugaisons FR has `\n` line breaks)
- [ ] SVG renderer stub (`type: 'svg'`) exists and renders a placeholder — ready for VexFlow integration
- [ ] Audio renderer stub (`type: 'audio'`) exists and renders a play button placeholder — ready for Tone.js integration
- [ ] `FlashcardDisplay` component uses `renderQuestion` for front and `renderAnswer` for back
- [ ] All 3 existing themes display identically to before (no visual regression)
- [ ] Rendering contract documented in `architecture.md` with clear separation from `RenderEngine`

## Related Epic

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

[Slice 8 — RenderEngine Framework](../../how/slices/slice-8-render-engine-framework/slice.md)
[Slice 14 — Rendering Engine Implementation](../../how/slices/slice-14-rendering-engine/slice.md)
