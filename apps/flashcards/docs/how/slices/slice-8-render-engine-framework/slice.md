---
title: Slice 8 — RenderEngine Framework
---

# Slice 8 — RenderEngine Framework

## Goal

Implement the unified `RenderEngine` contract with `render(data, target)` and optional `precompute?(data)`, the `TextEngine` default implementation, migrate existing themes to use `renderEngineId` on each card side, and wire it into the session flow — ensuring zero regression for existing themes.

## Related Epics

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related User Stories

[US-014 — Define RenderEngine Interface](us-014-render-engine-interface.md)
[US-015 — Implement TextEngine for Static Themes](us-015-identity-engine.md)
[US-016 — Migrate Existing Themes to RenderEngine Contract](us-016-migrate-existing-themes.md)
[US-017 — Wire RenderEngine into Session Flow](us-017-wire-render-engine-session.md)
[US-018 — Validate Existing Tests Pass Unchanged](us-018-validate-existing-tests.md)

## Impacted Components

| Component | Change |
|---|---|
| `src/types/index.ts` | Add `RenderEngine`, `CardSide`, `RenderEngineId` types |
| `src/engine/text-engine.ts` | New file — default engine implementation |
| `src/engine/index.ts` | New file — engine registry and resolution by `renderEngineId` |
| `src/hooks/useTheme.ts` | Load theme data with `CardSide` contract |
| `src/hooks/useSession.ts` | Use `RenderEngine.render(data, target)` instead of reading raw strings |
| `src/components/FlashcardDisplay.tsx` | Accept `CardSide` contract, render via engine |
| `src/data/themes/*.json` | Update card format to `CardSide` contract (`renderEngineId` + `data`) |

## Interfaces

```typescript
// New types in src/types/index.ts

type RenderEngineId = 'text' | 'markdown' | 'score' | 'score-audio';

interface RenderEngine {
  /**
   * Render the card side (question or answer) into a DOM target.
   * @param data - Engine-specific data payload
   * @param target - DOM element to render into
   */
  render(data: unknown, target: HTMLElement): void;
  /**
   * Optional async pre-computation — used by ScoreAudioEngine only.
   * Triggered after question display, enables instant flip when ready.
   * @param data - Engine-specific data payload
   */
  precompute?(data: unknown): Promise<void>;
}

interface CardSide {
  renderEngineId: RenderEngineId;
  data: unknown;
}

interface Card {
  id: string;
  front: CardSide;
  back: CardSide;
}

// Extended Theme interface
interface Theme {
  id: string;
  name: string;
  cards: Card[];
}
```

## Data Changes

- **Theme JSON files updated** — each card side now uses `CardSide` contract: `{ renderEngineId: "text", data: "..." }`
- `TextEngine` is applied as default when `renderEngineId` is `"text"`
- Future themes (Solfège) will use `renderEngineId: "score"` for questions and `renderEngineId: "score-audio"` for answers

## Sequence Flow

```
1. User selects theme on HomeScreen
2. useTheme loads theme data with CardSide contract
3. User starts session → useSession loads cards
4. For each card:
   a. Resolve engine for front side: resolveEngine(card.front.renderEngineId)
   b. engine.render(card.front.data, frontTarget) → renders question
   c. If back engine has precompute(): start precompute(card.back.data) in background
   d. User flips card:
      - If precompute done → instant flip
      - If still running → wait for completion then flip
   e. Resolve engine for back side: resolveEngine(card.back.renderEngineId)
   f. engine.render(card.back.data, backTarget) → renders answer
5. User scores card → session continues
```

## Observability Impact

- No new logging required
- Existing session tracking unchanged (scores, timestamps, localStorage)
- Future: computed themes may emit engine-specific metrics (precompute duration, render time)
