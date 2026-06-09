---
title: Sprint Proposal — Next Steps for Flashcards
---

# Sprint Proposal — Next Steps for Flashcards

## Context

This document answers: **What should the next sprint cover?** Based on architecture review, epic dependencies, and the RenderingEngine pattern discussed in comments.

---

## Current State Summary

| Epic | Status | Slices | User Stories |
|---|---|---|---|
| **Epic 0 — MVP** | Defined | Slice 1–3 | US-001 to US-004 |
| **Epic 3 — RenderEngine Framework** | Defined | Slice 8 | US-014 to US-019 |
| **Epic 1 — Solfège Bilingual Score Cards** | Defined | Slice 4–7 | US-005 to US-008 |
| **Epic 2 — Animated Score Learning** | **No slices** | — | US-009 to US-013 |

---

## Recommended Sprint Sequence

### Sprint 1 — RenderEngine Framework (Epic 3)

**Why first:** Validates the rendering architecture with simple text rendering before adding VexFlow/Tone.js complexity. Proves the contract works with real data.

| Slice | Coverage |
|---|---|
| **Slice 8** — RenderEngine Framework | US-014 to US-019 |

**Deliverables:**
- `RenderEngine` interface + `IdentityEngine` default
- `renderQuestion(card)` and `renderAnswer(answer)` with type-based dispatch
- Text renderer (single-line + multi-line with `\n`)
- SVG and audio renderer stubs (placeholders)
- Migration of existing themes to `IdentityEngine`
- Zero visual regression — all 3 themes display identically

**Risk:** Low — no new dependencies, pure refactoring.

---

### Sprint 2 — Solfège Bilingual Score Cards (Epic 1)

**Why second:** The RenderingEngine contract is proven. Now add VexFlow + Tone.js complexity on top of a validated foundation.

| Slice | Coverage | Dependencies |
|---|---|---|
| **Slice 6** — Solfège Card Data | US-008 | Slice 8 |
| **Slice 4** — VexFlow Score Rendering | US-006 | Slice 8 |
| **Slice 5** — Tone.js Audio Playback | US-007 | Slice 8 |
| **Slice 7** — ScoreCard UI Integration | US-005, US-006, US-007, US-008 | Slice 4, 5, 6 |

**Deliverables:**
- `renderScore()` — VexFlow SVG rendering
- `playScore()` — Tone.js audio playback
- Bilingual FR/EN note name support
- `ScoreCard` component integrated into `SessionScreen`
- "Solfège" theme selectable from home screen

**Risk:** Medium — new dependencies (VexFlow, Tone.js), Web Audio API browser quirks.

---

### Sprint 3 — Animated Score Learning (Epic 2)

**Why third:** Requires Solfège infrastructure (VexFlow SVG elements with note tracking, Tone.js playback timing) to be in place.

| Slice | Coverage | Dependencies |
|---|---|---|
| **Slice 9** — Note Highlight Engine | US-009 | Slice 4, 5, 7 |
| **Slice 10** — Tempo Control | US-010 | Slice 9 |
| **Slice 11** — Beginner Dataset | US-011 | Slice 6 |
| **Slice 12** — Progressive Themes | US-012 | Slice 11 |
| **Slice 13** — Playback Controls | US-013 | Slice 9, 10 |

**Deliverables:**
- Animated note highlighting synchronized to audio playback
- Tempo selector (BPM + solfège directives)
- Beginner dataset (~20 cards, treble clef, C4-B5)
- Progressive difficulty themes (beginner → intermediate → advanced)
- Playback controls (pause, replay, skip, click-to-jump)

**Risk:** High — SVG DOM manipulation synced to audio timing, complex state management.

---

## RenderingEngine Architecture — Answering Your Question

You asked: *"I'm not confident about the mechanism to use for rendering the next question and answer while the user is playing."*

### Clean Separation

```
┌─────────────────────────────────────────────────┐
│                    APP LAYER                     │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │           SessionController                │  │
│  │  - Manages current card index              │  │
│  │  - Triggers preloading of next card        │  │
│  │  - Handles flip/next/back navigation       │  │
│  └───────────────────┬───────────────────────┘  │
│                      │                          │
│                      ▼                          │
│  ┌───────────────────────────────────────────┐  │
│  │            CardPreloader                   │  │
│  │  - Pre-renders next card's question        │  │
│  │  - Pre-computes next card's answer         │  │
│  │  - Lives in app, NOT in RenderingEngine    │  │
│  └───────────────────┬───────────────────────┘  │
│                      │                          │
└──────────────────────┼──────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│              RENDERING ENGINE LAYER               │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │         RenderingEngine (per-theme)          │ │
│  │                                              │ │
│  │  renderQuestion(card) → ReactNode            │ │
│  │  renderAnswer(answer) → ReactNode            │ │
│  │                                              │ │
│  │  ┌─────────────────────────────────────────┐│ │
│  │  │ TextRenderer     (type: 'text')         ││ │
│  │  │ SvgRenderer      (type: 'svg')          ││ │
│  │  │ AudioRenderer    (type: 'audio')        ││ │
│  │  │ CompositeRenderer(type: 'composite')    ││ │
│  │  └─────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Key Principles

1. **RenderingEngine is stateless** — it receives data, returns ReactNode. No knowledge of "next card" or session flow.

2. **Preloading belongs in the APP** — `CardPreloader` (app-level) calls `renderingEngine.renderQuestion(nextCard)` and `renderingEngine.renderAnswer(nextAnswer)` in background, stores results in a cache.

3. **SessionScreen reads from cache** — when user navigates to next card, the rendered content is already available. Falls back to synchronous rendering if cache miss.

4. **Each theme gets its own RenderingEngine** — `TextRenderingEngine` for existing themes, `ScoreRenderingEngine` for Solfège. Both implement the same interface.

### Why This Works

| Concern | Where It Lives | Why |
|---|---|---|
| "What to render" | `RenderEngine` | Computes the answer (text, SVG, audio) |
| "How to render" | `RenderingEngine` | Displays the answer (text renderer, SVG renderer, etc.) |
| "When to preload" | `CardPreloader` (app) | Knows session flow, current index, next card |
| "When to display" | `SessionScreen` | Orchestrates the flip animation and content swap |

---

## What to Validate Visually

### After Sprint 1 (RenderEngine):
- [ ] World Capitals: country → capital displays correctly (single line)
- [ ] Multiplication Tables: question → answer displays correctly (single line)
- [ ] Conjugaisons FR: verb tense → full conjugation displays with proper line breaks
- [ ] Card flip animation works unchanged
- [ ] Session scoring works unchanged
- [ ] No console errors

### After Sprint 2 (Solfège):
- [ ] Solfège theme selectable from home screen
- [ ] Card front shows VexFlow SVG score
- [ ] Card flip triggers Tone.js audio playback
- [ ] Card back shows bilingual FR/EN note names
- [ ] Existing themes continue to work unchanged

### After Sprint 3 (Animated Score):
- [ ] Notes highlight sequentially as they play
- [ ] Tempo selector adjusts animation speed
- [ ] Playback controls (pause, replay, skip) work
- [ ] Click-to-jump on score elements works
- [ ] Beginner dataset renders correctly

---

## Related Artifacts

- [Architecture](../architecture.md)
- [Rendering Analysis — Existing Themes](./rendering-analysis-existing-themes.md)
- [ADR-001 — Solfège Computation Timing](./adr-001-solfege-computation-timing.md)
- [C4 Containers](../c4/containers.md)
