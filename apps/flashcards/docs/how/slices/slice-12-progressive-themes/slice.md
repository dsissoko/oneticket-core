---
title: Slice 12 — Progressive Difficulty Themes
---

# Slice 12 — Progressive Difficulty Themes

## Goal

Add intermediate and advanced solfège themes with increasing complexity — ledger lines, eighth notes, key signatures, multiple clefs, accidentals, and complex rhythms.

## Related Epics

[Epic 2 — Animated Score Learning](../../what/epics/epic-2-animated-score/epic.md)

## Related User Stories

[US-012 — Progressive Difficulty Themes](../../what/epics/epic-2-animated-score/user-stories/us-012-progressive-difficulty-themes.md)

## Dependencies

- Slice 11 — Beginner Solfège Dataset (theme structure and registration pattern)

## Impacted Components

| Component | Change |
|---|---|
| `src/data/themes/solfege-intermediate.json` | New — intermediate card dataset |
| `src/data/themes/solfege-advanced.json` | New — advanced card dataset |
| `src/data/themes/index.ts` | Modified — register intermediate and advanced themes |
| `src/modules/renderScore.ts` | Modified — support eighth notes, key signatures, accidentals, multiple clefs |
| `src/types/index.ts` | Extended — `ScoreData` supports `keySignature`, `timeSignature`, `accidentals` |

## Theme Specifications

### Intermediate Theme

| Property | Value |
|---|---|
| Card count | ~20 |
| Notes per card | 10–20 |
| Clef | Treble only |
| Note durations | w, h, q, e (eighth) |
| Key signatures | C major, G major (1 sharp), F major (1 flat) |
| Special features | Ledger lines above/below staff |
| Range | B3–C6 |

### Advanced Theme

| Property | Value |
|---|---|
| Card count | ~20 |
| Notes per card | 15–30 |
| Clefs | Treble, bass, alto |
| Note durations | w, h, q, e, dotted notes, syncopation |
| Key signatures | Up to 3 sharps/flats |
| Accidentals | Sharps, flats, naturals |
| Time signatures | 4/4, 3/4, 6/8 |
| Range | C2–C7 |

## Extended ScoreData Type

```typescript
interface ScoreData {
  clef: 'treble' | 'bass' | 'alto';
  keySignature?: number;       // number of sharps (+) or flats (-), 0 = C major
  timeSignature?: { top: number; bottom: number };  // e.g., { top: 4, bottom: 4 }
  notes: ScoreNote[];
}

interface ScoreNote {
  note: string;                // e.g., 'C4', 'F#4', 'Bb3'
  duration: string;            // 'w' | 'h' | 'q' | 'e' | 'q.' (dotted quarter)
  accidental?: 'sharp' | 'flat' | 'natural';
  name: { en: string; fr: string };
}
```

## Data Changes

- Two new theme JSON files with ~20 cards each
- Extended `ScoreData` type for key signatures, time signatures, accidentals
- `renderScore()` extended to render key signatures, time signatures, accidentals

## Observability Impact

- Console warning if VexFlow cannot render unsupported notation
- Theme complexity level exposed for UI (badge: "Beginner", "Intermediate", "Advanced")
