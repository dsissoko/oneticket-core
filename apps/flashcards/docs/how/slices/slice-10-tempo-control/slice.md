---
title: Slice 10 — Tempo Control
---

# Slice 10 — Tempo Control

## Goal

Add tempo-based animation speed control so learners can practice at a comfortable pace and gradually increase speed. Support both BPM values and solfège directives (largo, adagio, andante, moderato, allegro, presto).

## Related Epics

[Epic 2 — Animated Score Learning](../../what/epics/epic-2-animated-score/epic.md)

## Related User Stories

[US-010 — Tempo-Based Animation Speed](../../what/epics/epic-2-animated-score/user-stories/us-010-tempo-animation-speed.md)

## Dependencies

- Slice 9 — Note Highlight Engine (highlight timing is driven by tempo)

## Impacted Components

| Component | Change |
|---|---|
| `src/types/index.ts` | Add `Tempo` type, `TempoDirective` enum |
| `src/modules/tempo.ts` | New — tempo calculation utilities (BPM ↔ duration, directive ↔ BPM) |
| `src/hooks/useAnimatedPlayback.ts` | Modified — accept tempo parameter, adjust note durations |
| `src/components/TempoSelector.tsx` | New — UI for selecting tempo (directive dropdown + optional BPM input) |
| `src/components/ScoreCard.tsx` | Modified — includes TempoSelector when animated mode is enabled |

## Interfaces

```typescript
type TempoDirective = 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'presto';

interface TempoPreset {
  directive: TempoDirective;
  bpmRange: [number, number];
  defaultBpm: number;
}

const TEMPO_PRESETS: TempoPreset[] = [
  { directive: 'largo',    bpmRange: [40, 60],   defaultBpm: 50 },
  { directive: 'adagio',   bpmRange: [66, 76],   defaultBpm: 70 },
  { directive: 'andante',  bpmRange: [76, 108],  defaultBpm: 90 },
  { directive: 'moderato', bpmRange: [108, 120], defaultBpm: 112 },
  { directive: 'allegro',  bpmRange: [120, 168], defaultBpm: 144 },
  { directive: 'presto',   bpmRange: [168, 200], defaultBpm: 180 },
];

// tempo.ts utilities
function getDurationMs(noteDuration: string, bpm: number): number;
// e.g., getDurationMs('q', 120) → 500 (quarter note at 120 BPM = 500ms)
// e.g., getDurationMs('h', 90)  → 1333 (half note at 90 BPM = 1333ms)
// e.g., getDurationMs('w', 60)  → 4000 (whole note at 60 BPM = 4000ms)

function getPresetByDirective(directive: TempoDirective): TempoPreset;
function validateBpm(bpm: number): boolean;
```

## Note Duration Calculation

```
Quarter note (q) at BPM:    60000 / BPM ms
Half note (h) at BPM:       2 * (60000 / BPM) ms
Whole note (w) at BPM:      4 * (60000 / BPM) ms
Eighth note (e) at BPM:     0.5 * (60000 / BPM) ms
```

## Sequence Flow

```
1. User selects tempo via TempoSelector (default: andante = 90 BPM)
2. Tempo stored in session state
3. useAnimatedPlayback uses tempo to calculate each note's duration:
   - durationMs = getDurationMs(note.duration, currentBpm)
   - Audio playback scheduled with Tone.js at calculated duration
   - Highlight timing matches audio duration
4. If tempo changes during playback:
   - Current note completes at its original duration
   - New tempo applies from the next note
```

## Data Changes

- Session state extended with `tempo: { bpm: number, directive?: TempoDirective }`
- Default tempo: andante (90 BPM)

## Observability Impact

- Tempo selection persisted in localStorage for session continuity
- Console warning if invalid BPM entered
