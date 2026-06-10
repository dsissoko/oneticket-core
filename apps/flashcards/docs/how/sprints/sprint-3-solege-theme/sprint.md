---
title: 'Sprint 3 — Solfège Theme'
---

# Sprint 3 — Solfège Theme

This sprint introduces the bilingual solfège flashcard theme: a `ScoreEngine` that renders VexFlow SVG music notation on the question side, a `ScoreAudioEngine` that renders the same SVG and plays the notes via Tone.js on the answer side, a 21-card bilingual dataset (7 notes × 3 durations), and full ThemePicker integration. Dependencies `vexflow ^4.2.2` and `tone ^15.0.4` are installed.

This sprint directly depends on Epic 1 (RenderEngine Refactoring, issue #1125) — the precompute lifecycle in `SessionScreen` is already in place.

## Cross-references

- Epic: [Epic 3 — Solfège Theme](epic-3-solege-theme/epic.md)
- US-011 — [US-011 — ScoreEngine VexFlow SVG Rendering](us-011-score-engine.md) — pending
- US-012 — [US-012 — ScoreAudioEngine Tone.js Audio Playback](us-012-score-audio-engine.md) — pending
- US-013 — [US-013 — Solfège Dataset: 21 Cards Bilingual](us-013-solege-dataset.md) — pending
- US-014 — [US-014 — Solfège Theme Integration in ThemePicker](us-014-solege-theme-picker.md) — pending
- ADR: [ADR-001 — VexFlow for SVG Music Score Rendering](adr-001-vexflow-svg-rendering.md)
- ADR: [ADR-002 — Tone.js for Browser Audio Playback](adr-002-tonejs-audio-playback.md)

---

## Technical Notes

> Section owned by @architect
> To be completed after @po creates this sprint.
