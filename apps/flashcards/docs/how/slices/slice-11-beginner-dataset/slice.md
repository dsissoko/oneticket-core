---
title: Slice 11 — Beginner Solfège Dataset
---

# Slice 11 — Beginner Solfège Dataset

## Goal

Create a curated beginner solfège card dataset with ~20 cards, each containing 5-15 notes in treble clef, ordered by increasing difficulty.

## Related Epics

[Epic 2 — Animated Score Learning](../../what/epics/epic-2-animated-score/epic.md)

## Related User Stories

[US-011 — Beginner Solfège Card Dataset](../../what/epics/epic-2-animated-score/user-stories/us-011-beginner-solfege-dataset.md)

## Dependencies

- Slice 6 — Solfège Card Data (data structure and bilingual naming already defined)

## Impacted Components

| Component | Change |
|---|---|
| `src/data/themes/solfege-beginner.json` | New — beginner card dataset |
| `src/data/themes/index.ts` | Modified — register solfege-beginner theme |

## Data Schema

```json
{
  "id": "solfege-beginner",
  "name": { "en": "Solfège — Beginner", "fr": "Solfège — Débutant" },
  "clef": "treble",
  "tempo": { "directive": "andante", "bpm": 90 },
  "cards": [
    {
      "id": "sb-001",
      "front": "",
      "back": "",
      "score": {
        "clef": "treble",
        "notes": [
          { "note": "C4", "duration": "q", "name": { "en": "C", "fr": "do" } },
          { "note": "D4", "duration": "q", "name": { "en": "D", "fr": "ré" } },
          { "note": "E4", "duration": "q", "name": { "en": "E", "fr": "mi" } },
          { "note": "F4", "duration": "q", "name": { "en": "F", "fr": "fa" } },
          { "note": "G4", "duration": "q", "name": { "en": "G", "fr": "sol" } }
        ]
      }
    }
  ]
}
```

## Dataset Structure

| Card Range | Notes per Card | Difficulty Focus |
|---|---|---|
| Cards 1–5 | 5 notes | Staff lines only (E4, G4, B4, D5, F5) |
| Cards 6–10 | 7 notes | Staff spaces only (F4, A4, C5, E5) + lines |
| Cards 11–15 | 10 notes | Mixed lines and spaces, quarter + half notes |
| Cards 16–20 | 12–15 notes | Introduces ledger lines (C4, B3), whole notes |

## Constraints

- All notes in treble clef, C4–B5 range
- Note durations: whole (w), half (h), quarter (q) only
- Bilingual names on every note: `{ en: "C", fr: "do" }`
- Cards ordered by increasing difficulty

## Observability Impact

- None — data-only change
