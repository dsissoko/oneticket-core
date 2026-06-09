<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 3 — Session + Results Screens

Session and Results screens with flashcard display, progress tracking, and scoring.

## Context

Epic: [Epic 0 — MVP Flashcard App (World Capitals)](epic-0-mvp/epic.md)

User Stories: [US-002 — Session Card Flip Interaction](us-002-session-flip.md), [US-003 — Results Screen Session Score](us-003-results-screen.md), [US-004 — Complete Study Flow](us-004-complete-flow.md)

## Files

| File | Purpose |
|---|---|
| `src/screens/SessionScreen.tsx` | Flashcard display, progress bar, score buttons, flip logic |
| `src/screens/ResultsScreen.tsx` | Score display (X/Y), replay, back to home |
| `src/components/FlashcardDisplay.tsx` | Renders card front/back with flip animation |
| `src/components/ScoreButtons.tsx` | "I knew it" / "I didn't know" buttons |
| `src/components/ProgressBar.tsx` | Shows session advancement (X/Y) |
| `src/hooks/useSession.ts` | Manages session state, results, localStorage persistence |

## Implementation

- FlashcardDisplay: tap/click triggers flip animation to reveal answer
- ProgressBar: displays current position (e.g., 3/10)
- ScoreButtons: appear after flip, record known/unknown
- SessionScreen: advances through cards, persists results
- ResultsScreen: displays X/Y known, replay restarts session, back to home
- useSession: manages state, writes to localStorage, preserves theme/mode selection

## Verification

- Card shows country name; tap/click flips to show capital
- Progress bar updates after each card
- ScoreButtons appear after flip
- Results screen shows correct X/Y score
- Replay resets session state
- Back to home navigates correctly
- Session data persists across screen transitions via localStorage

## Related Epics

[Epic 0 — MVP](../epics/epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Session Card Flip Interaction](../us-002-session-flip.md)

[US-003 — Results Screen Session Score](../us-003-results-screen.md)

[US-004 — Complete Study Flow](../us-004-complete-flow.md)