# Slice 5 — Tone.js Audio Playback

## Goal

Integrate Tone.js to play notes in browser on card flip.

## Related Epics

- [Epic 1 — Solfege Training](epic-1-solfege/epic.md)

## Related User Stories

- [US-007 — Solfege Audio Playback](us-007-solfege-audio-playback.md)

## Impacted Components

- `src/modules/playScore.ts` — pure function taking ScoreData, playing notes sequentially via Tone.js
- `src/hooks/useAudioPlayback.ts` — manages Tone.js context lifecycle, play/stop controls
- `package.json` — add tone dependency

## Interfaces

```ts
// playScore.ts — pure function
function playScore(data: ScoreData): Promise<void>;

interface ScoreData {
  clef: string;
  notes: Array<{ note: string; duration: string }>;
}
```

```ts
// useAudioPlayback.ts — React hook
function useAudioPlayback(): {
  play: (data: ScoreData) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
};
```

## Data Changes

None. This slice reads existing ScoreData from card state and passes it to the playback module.

## Sequence Flow

1. User flips a flashcard (user gesture)
2. `useAudioPlayback` hook initializes Tone.js context on first user gesture
3. Hook calls `playScore()` with the card's ScoreData
4. `playScore()` maps note names (C4, D4, ...) to Tone.js frequencies
5. Notes are played sequentially via Tone.js, respecting duration values (q, h, w, etc.)
6. Playback completes or user calls `stop()`

## Observability Impact

- Console warnings if Tone.js context fails to initialize
- `isPlaying` state exposed for UI feedback (loading indicator during playback)
