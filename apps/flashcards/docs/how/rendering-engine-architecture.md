---
title: Rendering Engine Architecture — Preloading Strategy and Responsibility Boundaries
---

# Rendering Engine Architecture — Preloading Strategy and Responsibility Boundaries

## Context

The current architecture has a `ResponseEngine` contract (Epic 3) that computes answers per theme. The question is: should we add a `RenderingEngine` to each theme, and where does the **preloading of the next card's rendering** belong — in the engine or in the app?

## Current State

| Layer | Current | Gap |
|---|---|---|
| `ResponseEngine` | Computes answers (`computeNextResponse()`) — defined in Epic 3 | ✅ Already planned |
| Rendering | Hardcoded in `FlashcardDisplay` (`{card.front}`, `{card.back}`) | ❌ No abstraction |
| Preloading | `useScorePreloader` planned for Solfège only (ADR-001) | ❌ Not generic |

## Decision: Separate `RenderingEngine` from `ResponseEngine`

These are **two distinct concerns** that should remain separate:

| Contract | Question | Answer |
|---|---|---|
| `ResponseEngine` | "What is the answer?" | `computeNextResponse(card) → ComputedAnswer` |
| `RenderingEngine` | "How do I display it?" | `renderQuestion(card) → ReactNode` + `renderAnswer(answer) → ReactNode` |

### Why Not Merge Them?

- **Different lifecycle**: `ResponseEngine` computes once per card (can be preloaded). `RenderingEngine` renders to React DOM (tied to component lifecycle).
- **Different consumers**: `ResponseEngine` is called by `useSession` (business logic). `RenderingEngine` is called by `FlashcardDisplay` (UI layer).
- **Different testability**: `ResponseEngine` is pure data → data (easy unit test). `RenderingEngine` is data → ReactNode (requires render testing).

## Preloading: App-Level, NOT Engine-Level

**The preloading orchestration belongs in the app**, not in the rendering engine. Here's why:

### RenderingEngine (per-theme, pure)

```typescript
interface RenderingEngine {
  /** Render the question (card front) — synchronous, pure */
  renderQuestion(card: Card): ReactNode;
  
  /** Render the answer — dispatches by answer.type */
  renderAnswer(answer: ComputedAnswer): ReactNode;
}
```

- **Pure functions** — same input → same output
- **No state** — no knowledge of "current card" or "next card"
- **No side effects** — no caching, no preloading, no async
- **Theme-specific** — Solfège renders SVG, Capitals render text

### Preloader (app-level, generic)

```typescript
interface PreloadCache {
  get(cardId: string): { question: ReactNode; answer: ReactNode } | undefined;
  set(cardId: string, rendered: { question: ReactNode; answer: ReactNode }): void;
}

// Hook — orchestrates WHEN to preload
function useCardPreloader(
  cards: Card[],
  currentIndex: number,
  renderingEngine: RenderingEngine,
  responseEngine: ResponseEngine,
): PreloadCache
```

- **Knows the session flow** — current index, next card, deck order
- **Manages timing** — `requestIdleCallback` during reading time
- **Generic** — works for any theme, doesn't know about VexFlow or Tone.js
- **Calls the engines** — uses `renderingEngine.renderQuestion(nextCard)` and stores the result

## Recommended Flow

```
Session Start
    │
    ├─► Resolve engines for selected theme
    │   renderingEngine = theme.renderingEngine ?? DefaultRenderingEngine
    │   responseEngine  = theme.responseEngine  ?? IdentityEngine
    │
    ├─► Preload Card[0]: question + answer
    │   (blocking — must be ready before first render)
    │
    └─► Display Card[0] from cache
         │
         ├─► User reads the question (natural delay: 1–5s)
         │
         └─► Background: Preload Card[1] question + answer
              │
              ├─► User flips Card[0] → instant answer (from cache)
              │
              ├─► User scores Card[0]
              │
              └─► Background: Preload Card[2] question + answer
                   │
                   └─► ... continues through deck
```

## Responsibility Matrix

| Concern | Owner | Why |
|---|---|---|
| `renderQuestion(card)` | `RenderingEngine` (per-theme) | Knows how to render the question type |
| `renderAnswer(answer)` | `RenderingEngine` (per-theme) | Knows how to render each answer type |
| `computeNextResponse(card)` | `ResponseEngine` (per-theme) | Knows how to compute the answer |
| **When to preload** | `useCardPreloader` hook (app) | Knows the session flow and timing |
| **What to preload** | `useCardPreloader` hook (app) | Knows which card is next |
| **Cache storage** | `PreloadCache` (app) | Generic in-memory cache |
| **Fallback on miss** | `FlashcardDisplay` (app) | Renders on-the-fly if cache miss |

## Sprint Recommendation

### Epic 4 — Rendering Engine Framework (proposed)

This epic generalizes the rendering abstraction and preloading mechanism before Solfège adds VexFlow/Tone.js complexity.

**User Stories:**

| US | Title | Description |
|---|---|---|
| US-020 | Define RenderingEngine Interface | `renderQuestion(card)` + `renderAnswer(answer)` contract |
| US-021 | Implement DefaultRenderingEngine | Text-based rendering for existing themes |
| US-022 | Migrate FlashcardDisplay to use RenderingEngine | Replace hardcoded `{card.front}` / `{card.back}` |
| US-023 | Implement useCardPreloader Hook | Generic preloading orchestration with `requestIdleCallback` |
| US-024 | Implement PreloadCache | In-memory cache with get/set/has API |
| US-025 | Wire Preloader into SessionScreen | Preload next card during reading time |
| US-026 | Validate Existing Themes Unchanged | No visual regression, all tests green |

**Key Decisions:**

1. `RenderingEngine` is **separate** from `ResponseEngine` — different contracts, different consumers
2. Preloading is **app-level orchestration** — engines are pure, the hook manages timing
3. `requestIdleCallback` for background work — non-blocking, respects animation frames
4. Fallback to on-the-fly render if cache miss — safe, no broken state
5. Default engines provided — themes that don't need custom rendering work out of the box

**Out of Scope:**

- Solfège `ScoreRenderingEngine` (VexFlow SVG) — covered by Epic 1
- Animated score rendering — covered by Epic 2
- Audio preloading — `playScore()` is fast enough to call on flip (ADR-001)

## Validation Checklist

- [ ] Each existing theme displays identically after migration
- [ ] Preloader does not block the main thread during card transitions
- [ ] Cache miss falls back gracefully to on-the-fly rendering
- [ ] `requestIdleCallback` fallback works in Safari (`setTimeout`)
- [ ] All existing tests pass without modification
- [ ] Architecture documented with clear responsibility boundaries
