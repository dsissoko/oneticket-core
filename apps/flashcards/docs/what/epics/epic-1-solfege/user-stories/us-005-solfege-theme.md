# US-005 — Solfège Theme Selection

## Story

As a music learner, I want to select the Solfège theme so that I can practice note recognition.

## Expected Behavior

Home screen theme picker includes 'Solfège' option alongside 'World Capitals'. Selecting it loads solfège card deck.

## Acceptance Criteria

- Given I am on the home screen, when I open the theme picker, then 'Solfège' appears as an available option alongside 'World Capitals'.
- Given I select the Solfège theme, when the app loads the deck, then the solfège card deck is displayed.
- Given I switch to the Solfège theme, when I return to other themes, then existing themes remain unaffected and functional.

## Related Epic

<!-- @analyst fills this section — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Epic 0 — AppShell MVP](epic-0-mvp/epic.md) -->

[Epic 1 — Solfège](epic-1-solfege/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

- [Slice 6 — Solfège Card Data](slice-6-solfege-data/slice.md)
- [Slice 7 — ScoreCard UI Integration](slice-7-scorecard-ui/slice.md)
