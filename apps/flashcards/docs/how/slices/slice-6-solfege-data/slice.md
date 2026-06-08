---
title: Slice 6 — Solfège Card Data
---

# Slice 6 — Solfège Card Data

## Goal

Create solfège theme data with bilingual FR/EN note names and varied durations.

## Related Epics

[Epic 1 — Solfège Bilingual Score Cards](epic-1-solfege/epic.md)

## Related User Stories

[US-005 — Solfège Theme Selection](us-005-solfege-theme.md)

[US-008 — Bilingual FR/EN Note Names](us-008-solfege-bilingual-names.md)

## Impacted Components

| Component | Impact |
|---|---|
| `ThemePicker` | New 'Solfège' option becomes available from theme data |
| `FlashcardDisplay` | Receives solfège cards with bilingual front/back labels |

## Interfaces

No new interfaces — consumes existing `Theme` and `Card` types from architecture.md.

## Data Changes

| File | Change |
|---|---|
| `src/data/themes/solfege.json` | **New** — solfège theme with 7 cards covering all notes (do–si), each with FR/EN names, pitch, and varied durations |
| `src/types/index.ts` | **Add** `ScoreNote` and `ScoreData` types if not already present (defined in architecture.md) |

### solfege.json structure

```json
{
  "id": "solfege",
  "name": "Solfège",
  "cards": [
    {
      "id": "do",
      "front": "do",
      "frontEn": "C",
      "pitch": "C4",
      "duration": "w",
      "back": "do / C",
      "score": { "clef": "treble", "notes": [{ "note": "C4", "duration": "w" }] }
    }
  ]
}
```

Cards cover all 7 notes with varied durations:

| Note | FR | EN | Pitch | Duration |
|---|---|---|---|---|
| do | do | C | C4 | w (whole) |
| ré | ré | D | D4 | h (half) |
| mi | mi | E | E4 | q (quarter) |
| fa | fa | F | F4 | w |
| sol | sol | G | G4 | h |
| la | la | A | A4 | q |
| si | si | B | B4 | w |

### ScoreNote and ScoreData types

Add to `src/types/index.ts` if not present:

```typescript
interface ScoreNote {
  note: string;       // e.g. 'C4'
  duration: string;   // 'w' | 'h' | 'q'
}

interface ScoreData {
  clef: string;       // 'treble' | 'bass'
  notes: ScoreNote[];
}
```

## Sequence Flow

1. App loads `solfege.json` alongside existing theme data
2. `ThemePicker` reads available themes — 'Solfège' appears as an option
3. User selects 'Solfège' → `useTheme` loads the solfège card deck
4. Each card carries `front` (FR name), `frontEn` (EN name), `pitch`, `duration`, and `score` data
5. Card back displays bilingual label: "do / C"

## Observability Impact

None — data-only change, no new logging or metrics.

## Verification

- Theme loads correctly alongside existing themes
- All 7 notes (do, ré, mi, fa, sol, la, si) are present
- FR/EN mapping is correct: do→C, ré→D, mi→E, fa→F, sol→G, la→A, si→B
- Durations are valid: only 'w', 'h', 'q' values used
- `ScoreNote` and `ScoreData` types compile without errors
- Existing world-capitals theme remains unaffected
