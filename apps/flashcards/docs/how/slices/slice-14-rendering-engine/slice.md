---
title: Slice 14 — Rendering Engine Implementation
---

# Slice 14 — Rendering Engine Implementation

## Goal

Implement the `RenderEngine` layer: `TextEngine` (default), `MarkdownEngine` stub, `ScoreEngine` stub, `ScoreAudioEngine` stub, engine registry by `renderEngineId`, and integration with `FlashcardDisplay` / `ScoreCard` components — ensuring zero visual regression for existing themes.

## Related Epics

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related User Stories

[US-019 — Define and Implement Rendering Contract for Questions and Answers](us-019-rendering-contract.md)

## Impacted Components

| Component | Change |
|---|---|
| `src/engine/text-engine.ts` | New file — `TextEngine` implementation (single-line + multi-line `\n` support) |
| `src/engine/markdown-engine.ts` | New file — `MarkdownEngine` stub (ready for markdown-to-HTML) |
| `src/engine/score-engine.ts` | New file — `ScoreEngine` stub (ready for VexFlow integration) |
| `src/engine/score-audio-engine.ts` | New file — `ScoreAudioEngine` stub (ready for VexFlow + Tone.js integration); implements `precompute()` |
| `src/engine/index.ts` | Extend — add engine registry, resolve by `renderEngineId` |
| `src/hooks/useTheme.ts` | Load theme data with `CardSide` contract |
| `src/components/FlashcardDisplay.tsx` | Modify — use `RenderEngine.render(data, target)` for front and back |
| `src/components/ScoreCard.tsx` | Modify — accept `RenderEngine` for solfège card rendering |
| `src/components/SessionScreen.tsx` | Modify — resolve engine by `renderEngineId`, manage precompute lifecycle |

## Interfaces

```typescript
// RenderEngine contract (already defined in architecture.md)
interface RenderEngine {
  /** Render the card side (question or answer) into a DOM target */
  render(data: unknown, target: HTMLElement): void;
  /** Optional async pre-computation — used by ScoreAudioEngine only */
  precompute?(data: unknown): Promise<void>;
}

// TextEngine — default for existing themes
class TextEngine implements RenderEngine {
  render(data: unknown, target: HTMLElement): void;   // styled text, handles \n line breaks
  precompute?(data: unknown): Promise<void>;          // not needed for text
}

// MarkdownEngine — for markdown content
class MarkdownEngine implements RenderEngine {
  render(data: unknown, target: HTMLElement): void;   // markdown → HTML
  precompute?(data: unknown): Promise<void>;          // not needed
}

// ScoreEngine — for Solfège questions (VexFlow SVG)
class ScoreEngine implements RenderEngine {
  render(data: unknown, target: HTMLElement): void;   // VexFlow SVG via renderScore()
  precompute?(data: unknown): Promise<void>;          // not needed for questions
}

// ScoreAudioEngine — for Solfège answers (VexFlow SVG + Tone.js audio)
class ScoreAudioEngine implements RenderEngine {
  render(data: unknown, target: HTMLElement): void;   // VexFlow SVG + Tone.js audio
  precompute?(data: unknown): Promise<void>;          // pre-computes SVG + audio in background
}

// Engine registry function
function resolveEngine(renderEngineId: string): RenderEngine;
// Returns engine from registry by renderEngineId, defaults to TextEngine
```

## Data Changes

- **Theme JSON files updated** — each card side uses `CardSide` contract: `{ renderEngineId, data }`
- `TextEngine` is applied when `renderEngineId` is `"text"`
- `ScoreEngine` and `ScoreAudioEngine` will be used by future Solfège themes

## Sequence Flow

```
1. User selects theme on HomeScreen
2. useTheme loads theme data with CardSide contract
3. User starts session → SessionScreen receives current card
4. For each card display:
   a. Resolve engine for front: resolveEngine(card.front.renderEngineId)
   b. engine.render(card.front.data, frontTarget) → renders question
   c. If back engine has precompute(): start precompute(card.back.data) in background
   d. User flips card:
      - If precompute done → instant flip
      - If still running → wait for completion then flip
   e. Resolve engine for back: resolveEngine(card.back.renderEngineId)
   f. engine.render(card.back.data, backTarget) → renders answer
5. User scores card → session continues
6. For Solfège themes (future):
   a. ScoreEngine.render() calls renderScore() → VexFlow SVG
   b. ScoreAudioEngine.precompute() pre-computes SVG + audio in background
   c. ScoreAudioEngine.render() plays pre-computed audio + displays SVG
```

## Observability Impact

- No new logging required for text rendering (existing themes)
- Future: ScoreEngine may emit render-time metrics (VexFlow SVG generation duration)
- Future: ScoreAudioEngine may emit precompute metrics (pre-computation duration, cache hits)
- Existing session tracking unchanged (scores, timestamps, localStorage)
- Visual regression validation: all 3 existing themes must display identically after integration
