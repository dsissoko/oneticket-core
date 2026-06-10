---
title: 'US-013 — Solfège Dataset: 21 Cards Bilingual'
---

# US-013 — Solfège Dataset: 21 Cards Bilingual

## Story

As a learner, I want a solfège flashcard deck with 21 cards covering 7 notes × 3 durations so that I can practice reading all basic note values in treble clef.

## Expected Behavior

The `solfege.json` dataset contains exactly 21 cards: the 7 notes (do/C4, ré/D4, mi/E4, fa/F4, sol/G4, la/A4, si/B4) each in 3 durations (whole/w, half/h, quarter/q).

Each card front uses `renderEngineId: "score"` and each back uses `renderEngineId: "score-audio"`. Bilingual note names (FR/EN) are displayed on the card front — e.g. "do / C".

Card format:
```json
{
  "id": "do-whole",
  "front": {
    "renderEngineId": "score",
    "data": { "clef": "treble", "notes": [{ "note": "C4", "duration": "w" }] }
  },
  "back": {
    "renderEngineId": "score-audio",
    "data": { "clef": "treble", "notes": [{ "note": "C4", "duration": "w" }] }
  }
}
```

Note name mapping (FR → VexFlow): do→C4, ré→D4, mi→E4, fa→F4, sol→G4, la→A4, si→B4
Duration mapping: whole (ronde)→"w", half (blanche)→"h", quarter (noire)→"q"

## Acceptance Criteria

- `solfege.json` located at `apps/flashcards/app/src/data/themes/solfege.json`
- Exactly 21 cards: 7 notes × 3 durations (whole, half, quarter)
- All cards in treble clef
- Card IDs follow pattern `<note-fr>-<duration-en>` (e.g. `do-whole`, `re-half`)
- Front side: `renderEngineId: "score"` with correct `ScoreData`
- Back side: `renderEngineId: "score-audio"` with same `ScoreData` as front
- Bilingual label (FR/EN) resolvable from the card data

## Related Epic

[Epic 3 — Solfège Theme](epic-3-solege-theme/epic.md)

## Related Sprints

[Sprint 3 — Solfège Theme](sprint-3-solege-theme/sprint.md)
