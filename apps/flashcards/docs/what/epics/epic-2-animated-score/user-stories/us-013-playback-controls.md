# US-013 — Playback Controls

## Story

As a music learner, I want playback controls (pause, replay, skip) so that I can practice at my own pace and review specific notes.

## Expected Behavior

During animated playback, the user has access to:
- **Pause/Resume**: Stop and resume playback at the current note
- **Replay**: Restart playback from the first note
- **Skip Forward/Backward**: Jump to the next or previous note
- **Click-to-Jump**: Click any note on the score to jump playback to that note

Controls are displayed as a simple toolbar below the score during playback.

## Acceptance Criteria

- Given playback is active, when the user presses pause, then playback stops at the current note and the highlight remains on that note.
- Given playback is paused, when the user presses resume, then playback continues from the current note.
- Given playback is active or paused, when the user presses replay, then playback restarts from the first note.
- Given playback is active, when the user presses skip forward, then playback jumps to the next note.
- Given playback is active, when the user presses skip backward, then playback jumps to the previous note.
- Given a score is displayed, when the user clicks on a note element, then playback jumps to that note and continues from there.
- Given no playback is active, then the controls are hidden or disabled.

## Related Epic

<!-- @analyst fills this section — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Epic 0 — AppShell MVP](epic-0-mvp/epic.md) -->

[Epic 2 — Animated Score Learning](epic-2-animated-score/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

[Slice 13 — Playback Controls](../../how/slices/slice-13-playback-controls/slice.md)
