# US-006 — Score Rendering on Card Front

## Story

As a music learner, I want to see a music score on the card front so that I can identify the note visually.

## Expected Behavior

Card front renders a VexFlow SVG showing a single note on a treble clef staff. The note position corresponds to the question (e.g., C4 = first ledger line below staff).

## Acceptance Criteria

- Given a card with a note question, when the card front renders, then `renderScore({clef, notes})` produces a valid SVG element in the DOM.
- Given the card front is displayed, then a treble clef is visible on the staff.
- Given a specific pitch (e.g., C4), when the score renders, then the note position on the staff matches the expected pitch (e.g., first ledger line below staff).

## Related Epic

<!-- @analyst fills this section — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Epic 0 — AppShell MVP](epic-0-mvp/epic.md) -->

[Epic 1 — Solfège](epic-1-solfege/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
