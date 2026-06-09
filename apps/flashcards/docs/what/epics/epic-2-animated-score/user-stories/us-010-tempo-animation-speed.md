---
title: US-010 — Tempo-Based Animation Speed
---

# US-010 — Tempo-Based Animation Speed

## Story

As a music learner, I want the animation speed to match a selectable tempo so that I can practice at a comfortable pace and gradually increase speed.

## Expected Behavior

The animation speed is controlled by a tempo setting, expressed either as BPM (beats per minute) or as a solfège directive (largo=40-60, adagio=66-76, andante=76-108, moderato=108-120, allegro=120-168, presto=168-200). The tempo affects both the audio playback speed and the visual highlight timing. The default tempo for beginners is andante (~90 BPM).

## Acceptance Criteria

- Given a tempo selector, when the user selects a solfège directive (largo, adagio, andante, moderato, allegro, presto), then the animation and playback speed adjust accordingly.
- Given a tempo selector, when the user enters a specific BPM value, then the animation and playback speed match that BPM.
- Given the default state, then the tempo is set to andante (~90 BPM) for beginner-friendly pacing.
- Given a note duration (whole, half, quarter, eighth), when played, then the note's playback duration is calculated from the tempo (e.g., quarter note at 120 BPM = 500ms).
- Given the tempo changes during playback, then the current note completes at its original duration and the new tempo applies from the next note.

## Related Epic

[Epic 2 — Animated Score Learning with Tempo Control](epic-2-animated-score/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

[Slice 10 — Tempo Control](../../how/slices/slice-10-tempo-control/slice.md)
