---
title: 'Epic 3 — Solfège Theme (ScoreEngine + ScoreAudioEngine)'
---

# Epic 3 — Solfège Theme (ScoreEngine + ScoreAudioEngine)

## Goal

Add a bilingual (FR/EN) solfège flashcard theme where the question side renders a music score as SVG and the answer side shows the SVG score and plays the notes in the browser, using VexFlow for notation and Tone.js for audio playback.

## Business Value

Learners can study music note reading interactively — the app renders real music notation (not text) and plays the corresponding sound on flip. This demonstrates the pluggable RenderEngine architecture at full potential and opens the app to non-geography learning domains.

## Scope

- Define `ScoreData` interface: clef + notes array (note name + duration)
- Implement `ScoreEngine` — question side: VexFlow SVG injection into target element (synchronous)
- Implement `ScoreAudioEngine` — answer side: VexFlow SVG injection + Tone.js audio playback triggered by flip gesture
- Register both engines in `main.tsx` as `score` and `score-audio`
- Create `solfege.json` dataset: 21 cards (7 notes × 3 durations: whole/half/quarter)
- Bilingual note names displayed on card front (FR: do/ré/mi/fa/sol/la/si — EN: C/D/E/F/G/A/B)
- Solfège theme selectable from home screen ThemePicker

## Depends On

This epic depends on Epic 1 — RenderEngine Refactoring (#1125 must be merged).

## Related User Stories

[US-011 — ScoreEngine VexFlow SVG Rendering](user-stories/us-011-score-engine.md)

[US-012 — ScoreAudioEngine Tone.js Audio Playback](user-stories/us-012-score-audio-engine.md)

[US-013 — Solfège Dataset 21 Cards Bilingual](user-stories/us-013-solege-dataset.md)

[US-014 — Solfège Theme Integration in ThemePicker](user-stories/us-014-solege-theme-picker.md)

## Related Sprints

[Sprint 3 — Solfège Theme](sprint-3-solege-theme/sprint.md)
