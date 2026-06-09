---
title: Slice 13 — Playback Controls
---

# Slice 13 — Playback Controls

## Goal

Add playback controls (pause, resume, replay, skip forward/backward, click-to-jump) to animated solfège cards so learners can practice at their own pace and review specific notes.

## Related Epics

[Epic 2 — Animated Score Learning](../../what/epics/epic-2-animated-score/epic.md)

## Related User Stories

[US-013 — Playback Controls](../../what/epics/epic-2-animated-score/user-stories/us-013-playback-controls.md)

## Dependencies

- Slice 9 — Note Highlight Engine (highlight state must respond to playback controls)
- Slice 10 — Tempo Control (tempo affects playback timing)

## Impacted Components

| Component | Change |
|---|---|
| `src/components/PlaybackControls.tsx` | New — toolbar with pause, replay, skip, progress indicator |
| `src/hooks/useAnimatedPlayback.ts` | Modified — add pause/resume/skip/jump methods |
| `src/components/ScoreCard.tsx` | Modified — includes PlaybackControls during animated playback, adds click handlers to note elements |
| `src/modules/playScore.ts` | Modified — support pause/resume/skip via Tone.js Transport or manual scheduling |

## Interfaces

```typescript
// useAnimatedPlayback.ts — extended
function useAnimatedPlayback(): {
  play: (data: ScoreData) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  jumpToNote: (index: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentNoteIndex: number;
  totalNotes: number;
};

// PlaybackControls.tsx props
interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentNoteIndex: number;
  totalNotes: number;
  onPause: () => void;
  onResume: () => void;
  onReplay: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
}
```

## Playback Controls UI

```
┌─────────────────────────────────────────────────────────┐
│  [⏸ Pause]  [⏮ Skip Back]  [⏭ Skip Forward]  [🔄 Replay] │
│  ● ● ● ○ ○ ○ ○ ○   (progress dots: current = filled)     │
│  Note 3 of 8  |  Andante (90 BPM)                        │
└─────────────────────────────────────────────────────────┘
```

- Controls are displayed below the score during animated playback
- Controls are hidden or disabled when no playback is active
- Progress dots show current position in the note sequence

## Click-to-Jump Implementation

- Each note SVG element has `data-note-index` attribute (from Slice 9)
- Click handler on score container reads `data-note-index` from clicked element
- Calls `jumpToNote(index)` to restart playback from that note
- Visual feedback: clicked note briefly highlights before playback resumes

## Sequence Flow

```
Pause:
  1. User clicks Pause
  2. useAnimatedPlayback.pause() stops Tone.js playback
  3. Current note highlight remains active
  4. UI updates: Pause button → Resume button

Resume:
  1. User clicks Resume
  2. useAnimatedPlayback.resume() continues from current note
  3. Highlight animation resumes

Skip Forward/Backward:
  1. User clicks Skip Forward
  2. useAnimatedPlayback.skipForward() advances to next note
  3. Current note highlight cleared, next note highlighted
  4. Audio plays from new position

Replay:
  1. User clicks Replay
  2. useAnimatedPlayback.stop() then play() from index 0
  3. All highlights cleared, first note highlighted

Click-to-Jump:
  1. User clicks a note element on the score
  2. Click handler reads data-note-index
  3. useAnimatedPlayback.jumpToNote(index) restarts from that note
  4. Highlight jumps to clicked note, audio plays from there
```

## Data Changes

- No changes to card data schema
- Session state extended with `playbackState: 'idle' | 'playing' | 'paused'`

## Observability Impact

- Playback state exposed for UI feedback
- Console warning if jump-to-note index is out of range
