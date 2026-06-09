---
title: Slice 14 — Rendering Engine Implementation
---

# Slice 14 — Rendering Engine Implementation

## Goal

Implement the `RenderingEngine` layer: `TextRenderingEngine` (default), renderer dispatch logic by `ComputedAnswer.type`, SVG and audio renderer stubs, `ScoreRenderingEngine` (VexFlow + Tone.js integration points), engine registry, and integration with `FlashcardDisplay` / `ScoreCard` components — ensuring zero visual regression for existing themes.

## Related Epics

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related User Stories

[US-019 — Define and Implement Rendering Contract for Questions and Answers](us-019-rendering-contract.md)

## Impacted Components

| Component | Change |
|---|---|
| `src/engine/text-rendering-engine.ts` | New file — `TextRenderingEngine` implementation (single-line + multi-line `\n` support) |
| `src/engine/score-rendering-engine.ts` | New file — `ScoreRenderingEngine` integrating `renderScore` + `playScore` |
| `src/engine/renderers/text-renderer.ts` | New file — renders `type: 'text'` with line-break handling |
| `src/engine/renderers/svg-renderer.ts` | New file — stub for `type: 'svg'` (placeholder div, ready for VexFlow) |
| `src/engine/renderers/audio-renderer.ts` | New file — stub for `type: 'audio'` (play button placeholder, ready for Tone.js) |
| `src/engine/renderers/composite-renderer.ts` | New file — stub for `type: 'composite'` (renders child renderers in sequence) |
| `src/engine/index.ts` | Extend — add `RenderingEngine` registry, resolve `theme.renderingEngine ?? TextRenderingEngine` |
| `src/hooks/useTheme.ts` | Extend — expose resolved `RenderingEngine` alongside `RenderEngine` |
| `src/components/FlashcardDisplay.tsx` | Modify — use `renderQuestion` for front, `renderAnswer` for back via engine |
| `src/components/ScoreCard.tsx` | Modify — accept `RenderingEngine` prop for solfège card rendering |
| `src/components/SessionScreen.tsx` | Modify — pass resolved engine to `FlashcardDisplay` / `ScoreCard` |

## Interfaces

```typescript
// RenderingEngine contract (already defined in architecture.md)
interface RenderingEngine {
  /** Render the question (card front) */
  renderQuestion(card: Card): ReactNode;
  /** Render the answer (computed response) */
  renderAnswer(answer: ComputedAnswer): ReactNode;
}

// TextRenderingEngine — default for existing themes
class TextRenderingEngine implements RenderingEngine {
  renderQuestion(card: Card): ReactNode;   // styled text from card.front
  renderAnswer(answer: ComputedAnswer): ReactNode;  // dispatches to TextRenderer
}

// ScoreRenderingEngine — for Solfège themes
class ScoreRenderingEngine implements RenderingEngine {
  renderQuestion(card: Card): ReactNode;   // VexFlow SVG via renderScore()
  renderAnswer(answer: ComputedAnswer): ReactNode;  // Tone.js audio + SVG via playScore()
}

// Renderer dispatch (inside RenderingEngine.renderAnswer)
// switch on ComputedAnswer.type:
//   'text'      → TextRenderer.render(value)
//   'svg'       → SvgRenderer.render(value)
//   'audio'     → AudioRenderer.render(value)
//   'composite' → CompositeRenderer.render(value)

// Individual renderer interface
interface Renderer {
  render(value: string | SVGElement | AudioBuffer | Record<string, unknown>): ReactNode;
}

// Engine registry function
function resolveRenderingEngine(theme: Theme): RenderingEngine;
// Returns theme.renderingEngine ?? TextRenderingEngine
```

## Data Changes

- **No changes to existing theme JSON files** — `renderingEngine` is optional on `Theme` and resolved at runtime
- `TextRenderingEngine` is applied as default when `theme.renderingEngine` is undefined
- `ScoreRenderingEngine` will be provided by future Solfège themes

## Sequence Flow

```
1. User selects theme on HomeScreen
2. useTheme loads theme data + resolves RenderingEngine (TextRenderingEngine if none specified)
3. User starts session → SessionScreen receives current card + resolved engine
4. For each card display:
   a. SessionScreen calls engine.renderQuestion(card) → renders card.front as ReactNode
   b. FlashcardDisplay/ScoreCard displays the question
   c. User flips card → SessionScreen calls engine.renderAnswer(computedAnswer)
   d. renderAnswer dispatches by computedAnswer.type:
      - 'text'      → TextRenderer splits \n lines, renders styled text
      - 'svg'       → SvgRenderer renders placeholder div (VexFlow-ready)
      - 'audio'     → AudioRenderer renders play button (Tone.js-ready)
      - 'composite' → CompositeRenderer renders child outputs in sequence
   e. FlashcardDisplay/ScoreCard displays the answer
5. User scores card → session continues
6. For Solfège themes (future):
   a. ScoreRenderingEngine.renderQuestion() calls renderScore() → VexFlow SVG
   b. ScoreRenderingEngine.renderAnswer() calls playScore() → Tone.js audio + highlight
```

## Observability Impact

- No new logging required for text rendering (existing themes)
- Future: SVG renderer may emit render-time metrics (VexFlow SVG generation duration)
- Future: Audio renderer may emit playback metrics (Tone.js play duration, errors)
- Existing session tracking unchanged (scores, timestamps, localStorage)
- Visual regression validation: all 3 existing themes must display identically after integration
