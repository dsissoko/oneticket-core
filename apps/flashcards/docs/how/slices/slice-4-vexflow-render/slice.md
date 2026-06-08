---
title: Slice 4 — VexFlow Score Rendering
---

# Slice 4 — VexFlow Score Rendering

## Goal

Integrate VexFlow to render music scores as SVG on flashcard fronts.

## Related Epics

[Epic 1 — Solfege](epic-1-solfege/epic.md)

## Related User Stories

[US-006 — Solfege Score Rendering](us-006-solfege-score-render.md)

## Impacted Components

- `src/modules/renderScore.ts` — pure function taking ScoreData, returning SVG string
- `src/components/ScoreCard.tsx` — wrapper component injecting SVG into DOM target
- `package.json` — add vexflow dependency

## Interfaces

```ts
interface ScoreData {
  clef: 'treble' | 'bass';
  notes: NoteData[];
}

interface NoteData {
  note: string;    // e.g. 'C4', 'D5', 'E3'
  duration: string; // e.g. 'q' (quarter), 'h' (half), 'w' (whole)
}

function renderScore(data: ScoreData): string;
```

## Data Changes

- Add `vexflow` dependency to `package.json`

## Sequence Flow

1. Install `vexflow` package
2. Create `renderScore` module accepting `{clef, notes}`
3. Render treble clef staff with note positions using VexFlow
4. Inject SVG into target DOM element via `ScoreCard` component
5. Export `renderScore` as pure function returning SVG string

## Observability Impact

None for this slice.
