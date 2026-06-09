---
title: Slice 8 — RenderEngine Framework
---

# Slice 8 — RenderEngine Framework

## Goal

Implement the `RenderEngine` contract, the `IdentityEngine` default implementation, migrate existing themes to use the engine, and wire it into the session flow — ensuring zero regression for existing themes.

## Related Epics

[Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)

## Related User Stories

[US-014 — Define RenderEngine Interface](us-014-render-engine-interface.md)
[US-015 — Implement IdentityEngine for Static Themes](us-015-identity-engine.md)
[US-016 — Migrate Existing Themes to RenderEngine Contract](us-016-migrate-existing-themes.md)
[US-017 — Wire RenderEngine into Session Flow](us-017-wire-render-engine-session.md)
[US-018 — Validate Existing Tests Pass Unchanged](us-018-validate-existing-tests.md)

## Impacted Components

| Component | Change |
|---|---|
| `src/types/index.ts` | Add `RenderEngine`, `ComputedAnswer` types |
| `src/engine/identity-engine.ts` | New file — default engine implementation |
| `src/engine/index.ts` | New file — engine registry and resolution |
| `src/hooks/useTheme.ts` | Resolve engine per theme, expose `getEngine()` |
| `src/hooks/useSession.ts` | Use engine to resolve answers instead of `card.back` |
| `src/components/FlashcardDisplay.tsx` | Accept `ComputedAnswer` type |
| `src/data/themes/*.json` | No changes required (default engine applied) |

## Interfaces

```typescript
// New types in src/types/index.ts

type AnswerType = 'text' | 'svg' | 'audio' | 'composite';

interface ComputedAnswer {
  type: AnswerType;
  value: string | SVGElement | AudioBuffer | Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface RenderEngine {
  /**
   * Compute the answer for a given card.
   * @param card - The flashcard being displayed
   * @param context - Optional context (session state, previous answers, etc.)
   * @returns A ComputedAnswer object
   */
  computeNextResponse(card: Card, context?: Record<string, unknown>): ComputedAnswer;
}

// Extended Theme interface
interface Theme {
  id: string;
  name: string;
  cards: Card[];
  renderEngine?: RenderEngine;  // Optional — defaults to IdentityEngine
}
```

## Data Changes

- **No changes to existing theme JSON files** — the `renderEngine` field is optional and resolved at runtime
- `IdentityEngine` is applied as default when `theme.renderEngine` is undefined
- Future themes (Solfège) will provide their own engine implementation

## Sequence Flow

```
1. User selects theme on HomeScreen
2. useTheme loads theme data + resolves RenderEngine (IdentityEngine if none specified)
3. User starts session → useSession loads cards
4. For each card flip:
   a. SessionScreen calls theme.renderEngine.computeNextResponse(card)
   b. Engine returns ComputedAnswer
   c. FlashcardDisplay renders answer based on ComputedAnswer.type
   d. For IdentityEngine: type='text', value=card.back (identical to current behavior)
5. User scores card → session continues
```

## Observability Impact

- No new logging required
- Existing session tracking unchanged (scores, timestamps, localStorage)
- Future: computed themes may emit engine-specific metrics (computation time, cache hits)
