# US-012 — Progressive Difficulty Themes

## Story

As a music learner progressing in skill, I want to unlock more complex solfège themes so that I can continue challenging myself.

## Expected Behavior

Beyond the beginner theme, additional themes are available with increasing complexity:
- **Intermediate**: Notes extend to ledger lines above/below staff, introduces eighth notes, key signatures (G major, F major), 10-20 notes per card
- **Advanced**: All clefs (treble, bass, alto), accidentals (sharps, flats, naturals), complex rhythms (dotted notes, syncopation), time signatures, 15-30 notes per card

Each theme is selectable from the home screen. Progress tracking shows which themes the user has completed.

## Acceptance Criteria

- Given the theme selector, then at least three difficulty levels are available: Beginner, Intermediate, Advanced.
- Given the Intermediate theme, then cards include eighth notes, ledger lines, and simple key signatures.
- Given the Advanced theme, then cards include multiple clefs, accidentals, and complex rhythms.
- Given a theme is selected, then the card count and note count per card match the theme's specification.
- Given existing flashcard themes, then they remain unaffected by the new solfège themes.

## Related Epic

<!-- @analyst fills this section — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Epic 0 — AppShell MVP](epic-0-mvp/epic.md) -->

[Epic 2 — Animated Score Learning](epic-2-animated-score/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

[Slice 12 — Progressive Themes](../../how/slices/slice-12-progressive-themes/slice.md)
