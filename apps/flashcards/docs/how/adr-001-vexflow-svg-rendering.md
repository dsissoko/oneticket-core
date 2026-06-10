---
title: 'ADR-001 — VexFlow for SVG Music Score Rendering'
---

# ADR-001 — VexFlow for SVG Music Score Rendering

The Solfège theme requires rendering music notation (clef, notes, durations) as visual elements on flashcard question and answer sides. A library decision is needed for music score rendering in the browser.

## Options Considered

### Option A — VexFlow (`vexflow ^4.2.2`)
| Pros | Cons |
|------|------|
| Industry-standard JS music notation library | Adds ~250KB to bundle |
| SVG output — accessible, scalable, no canvas needed | API somewhat verbose for simple use cases |
| Active maintenance, TypeScript types included | |
| Synchronous SVG injection — fits RenderEngine.render() contract | |
| Supports treble/bass clef, all standard note durations | |

### Option B — ABC.js
| Pros | Cons |
|------|------|
| Simpler API for basic notation | Smaller community |
| Supports SVG output | Less TypeScript support |
| | Less precise control over individual note rendering |

### Option C — Custom SVG
| Pros | Cons |
|------|------|
| Zero external dependency | Very high development cost |
| Full control | Error-prone for music notation rules |

## Decision

**Option A — VexFlow** — VexFlow is the most mature and widely used JavaScript music notation library. Its synchronous SVG output aligns perfectly with the `RenderEngine.render()` contract (synchronous, injects into target element). TypeScript types are bundled. The bundle size cost is acceptable for a feature-specific theme.

## Consequences

- `vexflow ^4.2.2` added to `apps/flashcards/app/package.json`
- `ScoreEngine` and `ScoreAudioEngine` both use VexFlow for SVG injection
- SVG is injected directly into the target `HTMLElement` — no canvas, no async
- Future engines requiring music notation reuse the same VexFlow dependency
