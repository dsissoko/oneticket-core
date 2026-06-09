---
title: Epic 2 — Animated Score Learning with Tempo Control
---

# Epic 2 — Animated Score Learning with Tempo Control

## Goal

Enhance solfège cards with animated note highlighting synchronized to audio playback, enabling learners to follow along visually as notes play. Support tempo control and progressive difficulty themes.

## Business Value

Transform passive score reading into an active learning experience. Animated highlighting helps beginners connect visual note positions with their sound, accelerating sight-reading skills. Tempo control lets learners start slow and progress at their own pace.

## Scope

- Animated note highlighting: each note visually highlights as it plays
- Tempo-based animation speed: smooth transitions tied to BPM or solfège directives (largo, adagio, andante, moderato, allegro, presto)
- Beginner dataset: ~20 cards, each with 5-15 notes in treble clef
- Progressive difficulty themes: beginner → intermediate → advanced with increasingly complex notation
- Replay control: pause, replay, skip to specific note
- All solfège notation supported: whole, half, quarter, eighth notes, rests, ties

## Related User Stories

<!-- @analyst fills this section — write filename only, no relative path, no ../
     US files are always in user-stories/ subfolder — never flat in the epic directory
     The build script resolves the correct path automatically.
     Example: [US-001 — Skeleton Setup](us-001-skeleton-setup.md) -->

- [US-009 — Animated Note Highlighting](us-009-animated-note-highlight.md)
- [US-010 — Tempo-Based Animation Speed](us-010-tempo-animation-speed.md)
- [US-011 — Beginner Solfège Card Dataset](us-011-beginner-solfege-dataset.md)
- [US-012 — Progressive Difficulty Themes](us-012-progressive-difficulty-themes.md)
- [US-013 — Playback Controls](us-013-playback-controls.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

- [Slice 9 — Note Highlight Engine](slice-9-note-highlight-engine/slice.md)
- [Slice 10 — Tempo Control](slice-10-tempo-control/slice.md)
- [Slice 11 — Beginner Dataset](slice-11-beginner-dataset/slice.md)
- [Slice 12 — Progressive Themes](slice-12-progressive-themes/slice.md)
- [Slice 13 — Playback Controls](slice-13-playback-controls/slice.md)

## Related Epics

- [Epic 0 — MVP Flashcard App](epic-0-mvp/epic.md)
- [Epic 1 — Solfège Bilingual Score Cards](epic-1-solfege/epic.md)
- [Epic 3 — Theme ResponseEngine Framework](epic-3-theme-response-engine/epic.md)
