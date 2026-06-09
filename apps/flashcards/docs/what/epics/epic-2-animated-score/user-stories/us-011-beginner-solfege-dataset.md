---
title: US-011 — Beginner Solfège Card Dataset
---

# US-011 — Beginner Solfège Card Dataset

## Story

As a beginner music learner, I want a curated set of ~20 cards with 5-15 notes each so that I can practice reading notes progressively.

## Expected Behavior

A beginner-themed card deck containing approximately 20 cards. Each card displays 5-15 notes in treble clef using basic notation (whole, half, quarter notes). Notes are limited to the C4-B5 range (within and around the treble staff). Cards are ordered by increasing difficulty: first cards use only 5 notes on staff lines, later cards introduce ledger lines and varied rhythms.

## Acceptance Criteria

- Given the "Solfège Beginner" theme is selected, then approximately 20 cards are available.
- Given a beginner card, then it contains between 5 and 15 notes.
- Given a beginner card, then all notes are in treble clef within the C4-B5 range.
- Given a beginner card, then note durations include whole (w), half (h), and quarter (q) notes.
- Given the card sequence, then cards are ordered by increasing difficulty (simple 5-note cards first, complex 15-note cards last).
- Given a beginner card, then the data structure includes bilingual FR/EN note names (do→C, ré→D, mi→E, fa→F, sol→G, la→A, si→B).

## Related Epic

[Epic 2 — Animated Score Learning with Tempo Control](epic-2-animated-score/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

[Slice 11 — Beginner Dataset](../../how/slices/slice-11-beginner-dataset/slice.md)
