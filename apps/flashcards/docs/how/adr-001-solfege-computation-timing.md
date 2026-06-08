---
title: Architecture Decision — Solfège Computation Timing
---

# ADR — Solfège Computation Timing

## Context

In solfège mode, each card requires two computations:
- **renderScore** — VexFlow SVG generation from `{clef, notes}`
- **playScore** — Tone.js audio scheduling from `{clef, notes}`

Unlike simple flip cards where the answer is static text, solfège cards require computation to produce both the visual score and the audio playback.

Dataset scale: ~20 cards per deck, each with 5–15 notes.

## Options Considered

### Option A — Batch pre-computation (all before game starts)
Compute all SVGs and audio schedules for every card before the session begins.

| Pros | Cons |
|---|---|
| Zero latency during gameplay | Longer initial load (user waits before first card) |
| Simplest implementation | Wasted computation if user doesn't finish all cards |
| All assets cached in memory | |

### Option B — On-the-fly (compute when user taps/flips)
Compute only when the user triggers the flip action.

| Pros | Cons |
|---|---|
| Minimal initial load | **Latency on flip** — user taps, then waits for computation |
| Only compute what's needed | Poor UX for a game — breaks the flow |
| | Tone.js requires user gesture for audio context (already handled by flip) |

### Option C — Progressive background (recommended)
- Compute first card's SVG + audio at session load (instant — single note)
- While the user reads card N, compute card N+1's SVG + audio in background
- If user flips faster than computation completes, fall back to on-the-fly

| Pros | Cons |
|---|---|
| Fast initial load (only first card) | More complex state management |
| Zero latency on flip (pre-computed) | Need to handle "user faster than computation" edge case |
| Uses natural reading time productively | |
| Scales to larger decks without penalty | |

## Decision

**Option C — Progressive background computation** is the recommended approach.

### Rationale

1. **Primary goal is learning to read notes** — the user needs time to visually identify the note on the staff before flipping. This "reading time" (typically 2–5 seconds for a learner) is free CPU time that can be used to pre-compute the next card.

2. **First card is instant** — a single-note card renders in milliseconds, so the session starts immediately.

3. **Scales gracefully** — if the deck grows to 50+ cards, batch pre-computation would become noticeable. Progressive computation has constant per-card cost regardless of deck size.

4. **Fallback is safe** — if the user flips before pre-computation completes, the on-the-fly path still works. The computation for 5–15 notes is fast enough (<200ms) that even the fallback is acceptable.

## Implementation Strategy

```
Session Start
    │
    ├─► Compute Card[0] SVG + Audio  ← immediate, blocks first render
    │
    └─► Display Card[0]
         │
         ├─► User reads the score (2–5s natural delay)
         │
         └─► Background: Compute Card[1] SVG + Audio
              │
              ├─► User flips Card[0] → instant answer (pre-computed)
              │
              └─► Background: Compute Card[2] SVG + Audio
                   │
                   └─► ... continues through deck
```

### Key Components

| Component | Responsibility |
|---|---|
| `useScorePreloader` | Hook that manages the pre-computation queue. Takes the card deck and current card index, pre-computes the next card's `renderScore` and `playScore` data in a `requestIdleCallback` or `setTimeout` background task. |
| `ScoreCache` | In-memory `Map<cardId, { svg: string, audioReady: boolean }>` that stores pre-computed results. Accessed by `ScoreCard` for instant render/play. |
| Fallback path | If `ScoreCache` doesn't have the current card, compute on-the-fly (same code path as pre-computation, just synchronous). |

### Pseudo-code

```typescript
// useScorePreloader.ts
function useScorePreloader(cards: Card[], currentIndex: number) {
  const cache = useRef(new Map<string, PrecomputedScore>());

  useEffect(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) return;

    const nextCard = cards[nextIndex];
    if (cache.current.has(nextCard.id)) return; // already cached

    // Background computation — non-blocking
    const id = requestIdleCallback(() => {
      const svg = renderScore(nextCard.score);
      // Audio is scheduled on-demand via playScore (no pre-scheduling needed)
      cache.current.set(nextCard.id, { svg, audioReady: true });
    });

    return () => cancelIdleCallback(id);
  }, [currentIndex, cards]);

  return { getPrecomputed: (id: string) => cache.current.get(id) };
}
```

### Notes

- **SVG pre-rendering** is the main benefit — VexFlow DOM injection is the heaviest operation.
- **Audio does not need pre-scheduling** — `playScore()` is fast enough to call on flip. The Tone.js context is already initialized from the first user gesture (first flip or session start).
- **`requestIdleCallback`** ensures computation happens during browser idle time, not during animation frames (flip animation, transitions).
- **Fallback**: if `requestIdleCallback` is not available (Safari), use `setTimeout(fn, 0)`.

## Consequences

- New hook `useScorePreloader` added to the architecture
- `ScoreCache` module for in-memory pre-computed results
- `ScoreCard` component checks cache before falling back to on-the-fly
- No changes to `renderScore` or `playScore` modules — they remain pure functions
- No backend changes — all computation is client-side
