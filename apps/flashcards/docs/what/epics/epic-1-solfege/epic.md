---
title: Epic 1 — Solfège Bilingual Score Cards
---

# Epic 1 — Solfège Bilingual Score Cards

## Goal

Add solfège learning through bilingual (FR/EN) flashcards where the question is a music score rendered as SVG and the answer plays notes in the browser.

## Business Value

Enable music students to learn note recognition visually and auditorily with bilingual support.

## Scope

- Bilingual card deck (do/ré/mi vs C/D/E)
- Score rendering on card front (VexFlow SVG)
- Audio playback on card flip (Tone.js)
- 'Solfège' theme selectable from home screen

## Related User Stories

<!-- @analyst fills this section — write filename only, no relative path, no ../
     US files are always in user-stories/ subfolder — never flat in the epic directory
     The build script resolves the correct path automatically.
     Example: [US-001 — Skeleton Setup](us-001-skeleton-setup.md) -->

- [US-005 — Solfège Theme Selection](us-005-solfege-theme.md)
- [US-006 — Score Rendering on Card Front](us-006-solfege-score-render.md)
- [US-007 — Audio Playback on Card Flip](us-007-solfege-audio-playback.md)
- [US-008 — Bilingual FR/EN Note Names](us-008-solfege-bilingual-names.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

- [Slice 4 — VexFlow Score Rendering](slice-4-vexflow-render/slice.md)
- [Slice 5 — Tone.js Audio Playback](slice-5-tonejs-playback/slice.md)
- [Slice 6 — Solfège Card Data](slice-6-solfege-data/slice.md)
- [Slice 7 — ScoreCard UI Integration](slice-7-scorecard-ui/slice.md)

## Related Epics

- [Epic 0 — MVP Flashcard App](epic-0-mvp/epic.md)
- [Epic 2 — Animated Score Learning](epic-2-animated-score/epic.md)
- [Epic 3 — Theme RenderEngine Framework](epic-3-theme-render-engine/epic.md)
