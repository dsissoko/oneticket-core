# US-007 — Audio Playback on Card Flip

## Story

As a music learner, I want to hear the note played when I flip the card so that I can verify my answer auditorily.

## Expected Behavior

On card flip, `playScore({clef, notes})` plays the note sequentially using Tone.js + Web Audio API. No file download required.

## Acceptance Criteria

- Given I flip a card, when `playScore({clef, notes})` is called, then the note plays in the browser using Tone.js and the Web Audio API.
- Given I flip a card, then audio playback is triggered automatically on the flip action.
- Given multiple notes in a sequence, when `playScore` is called, then notes play sequentially in the correct order.

## Related Epic

<!-- @analyst fills this section — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Epic 0 — AppShell MVP](epic-0-mvp/epic.md) -->

[Epic 1 — Solfège](epic-1-solfege/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
