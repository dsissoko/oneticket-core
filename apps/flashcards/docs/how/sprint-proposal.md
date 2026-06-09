---
title: Sprint Proposal — Next Steps for Flashcards
---

# Sprint Proposal — Next Steps for Flashcards

## Context

This document answers: **What should the next sprint cover?** Based on architecture review, epic dependencies, and the RenderEngine pattern discussed in comments.

---

## Current State Summary

| Epic | Status | Slices | User Stories |
|---|---|---|---|
| **Epic 0 — MVP** | Defined | Slice 1–3 | US-001 to US-004 |
| **Epic 3 — RenderEngine Framework** | Defined | Slice 8, 14 | US-014 to US-019 |
| **Epic 1 — Solfège Bilingual Score Cards** | Defined | Slice 4–7 | US-005 to US-008 |
| **Epic 2 — Animated Score Learning** | Defined | Slice 9–13 | US-009 to US-013 |

---

## Recommended Sprint Sequence

### Sprint 1 — RenderEngine Framework (Epic 3)

**Why first:** Validates the rendering architecture with simple text rendering before adding VexFlow/Tone.js complexity. Proves the contract works with real data.

| Slice | Coverage |
|---|---|
| **Slice 8** — RenderEngine Framework | US-014 to US-018 |
| **Slice 14** — Rendering Engine Implementation | US-019 |

**Deliverables:**
- `RenderEngine` interface: `render(data, target)` + optional `precompute?(data)`
- `CardSide` contract: `{ renderEngineId, data }`
- `TextEngine` default implementation (single-line + multi-line with `\n`)
- `MarkdownEngine`, `ScoreEngine`, `ScoreAudioEngine` stubs (placeholders)
- Engine registry: resolves by `renderEngineId` — defaults to `TextEngine`
- Migration of existing themes to `CardSide` contract with `renderEngineId: "text"`
- Preloading strategy: `precompute()` triggered after question display
- Zero visual regression — all 3 themes display identically

**Risk:** Low — no new dependencies, pure refactoring.

---

### Sprint 2 — Solfège Bilingual Score Cards (Epic 1)

**Why second:** The RenderEngine contract is proven. Now add VexFlow + Tone.js complexity on top of a validated foundation.

| Slice | Coverage | Dependencies |
|---|---|---|
| **Slice 6** — Solfège Card Data | US-008 | Slice 8 |
| **Slice 4** — VexFlow Score Rendering | US-006 | Slice 8 |
| **Slice 5** — Tone.js Audio Playback | US-007 | Slice 8 |
| **Slice 7** — ScoreCard UI Integration | US-005, US-006, US-007, US-008 | Slice 4, 5, 6 |

**Deliverables:**
- `ScoreEngine.render()` — VexFlow SVG rendering (solfège questions)
- `ScoreAudioEngine.render()` — VexFlow SVG + Tone.js audio (solfège answers)
- `ScoreAudioEngine.precompute()` — async pre-computation for instant flip
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

## RenderEngine Architecture — Answering Your Question

You asked: *"I'm not confident about the mechanism to use for rendering the next question and answer while the user is playing."*

### Unified RenderEngine Contract

```
┌─────────────────────────────────────────────────┐
│                    APP LAYER                     │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │           SessionController                │  │
│  │  - Manages current card index              │  │
│  │  - Triggers precompute() on next card      │  │
│  │  - Handles flip/next/back navigation       │  │
│  └───────────────────┬───────────────────────┘  │
│                      │                          │
│                      ▼                          │
│  ┌───────────────────────────────────────────┐  │
│  │         RenderEngine Registry              │  │
│  │  resolveEngine(renderEngineId)             │  │
│  │  - "text"         → TextEngine            │  │
│  │  - "markdown"     → MarkdownEngine        │  │
│  │  - "score"        → ScoreEngine           │  │
│  │  - "score-audio"  → ScoreAudioEngine      │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│              CARD SIDE CONTRACT                   │
│                                                   │
│  interface CardSide {                             │
│    renderEngineId: string;  // selects engine     │
│    data: unknown;           // engine payload     │
│  }                                                │
│                                                   │
│  interface RenderEngine {                         │
│    render(data, target): void;                    │
│    precompute?(data): Promise<void>;              │
│  }                                                │
└──────────────────────────────────────────────────┘
```

### Key Principles

1. **RenderEngine is unified** — single interface for both rendering and optional pre-computation. No separate "compute" vs "render" layers.

2. **Each card side declares its engine** — `renderEngineId` string selects the implementation. Front and back can use different engines.

3. **Preloading is engine-driven** — `precompute()` is triggered after the question is displayed. On card flip: if done → instant, if running → wait.

4. **Engine registry is extensible** — new engines added by registering under a new `renderEngineId`.

### Why This Works

| Concern | Where It Lives | Why |
|---|---|---|
| "What to render" | `CardSide.data` | Engine-specific data payload |
| "How to render" | `RenderEngine.render(data, target)` | Renders into DOM target |
| "When to precompute" | `RenderEngine.precompute?(data)` | Optional async pre-computation |
| "Which engine" | `CardSide.renderEngineId` | String selects engine from registry |

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
