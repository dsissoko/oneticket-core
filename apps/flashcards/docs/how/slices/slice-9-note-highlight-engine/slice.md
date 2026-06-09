---
title: Slice 9 — Note Highlight Engine
---

# Slice 9 — Note Highlight Engine

## Goal

Implement animated note highlighting synchronized to audio playback — each note visually highlights on the SVG score as it plays, enabling learners to connect visual position with sound.

## Related Epics

[Epic 2 — Animated Score Learning](../../what/epics/epic-2-animated-score/epic.md)

## Related User Stories

[US-009 — Animated Note Highlighting](../../what/epics/epic-2-animated-score/user-stories/us-009-animated-note-highlight.md)

## Dependencies

- Slice 4 — VexFlow Score Rendering (SVG elements must have `data-note-index` attributes)
- Slice 5 — Tone.js Audio Playback (playback timing drives highlight sequence)
- Slice 7 — ScoreCard UI Integration (ScoreCard component hosts the highlight engine)

## Impacted Components

| Component | Change |
|---|---|
| `src/modules/renderScore.ts` | Modified — add `data-note-index` attribute to each note's SVG element |
| `src/modules/highlightNote.ts` | New — pure function that applies/removes highlight CSS class on SVG elements |
| `src/hooks/useAnimatedPlayback.ts` | New — orchestrates synchronized audio + highlight, replaces `useAudioPlayback` for animated mode |
| `src/components/ScoreCard.tsx` | Modified — uses `useAnimatedPlayback` when animated mode is enabled |
| `src/styles/score-highlight.css` | New — CSS transitions for note highlight (glow, color change) |

## Interfaces

```typescript
// highlightNote.ts — pure function
interface HighlightOptions {
  noteIndex: number;
  container: HTMLElement;
  highlightClass?: string;  // default: 'note-highlight'
}

function highlightNote(options: HighlightOptions): void;
function clearHighlight(container: HTMLElement, highlightClass?: string): void;

// useAnimatedPlayback.ts — React hook
function useAnimatedPlayback(): {
  play: (data: ScoreData) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentNoteIndex: number;
};
```

## Sequence Flow

```
1. User flips solfège card with animated mode enabled
2. useAnimatedPlayback initializes Tone.js context (first gesture)
3. For each note in scoreData.notes:
   a. playScore() schedules note audio via Tone.js
   b. highlightNote() applies CSS highlight to SVG element with data-note-index=N
   c. CSS transition creates smooth visual change (glow/color)
   d. When note audio completes:
      - clearHighlight() removes highlight from current note
      - Loop continues to next note
4. All notes complete → clearHighlight() ensures clean state
```

## CSS Highlight Design

```css
/* Default note style */
.vexflow-note {
  fill: #1f2328;
  transition: fill 0.15s ease, filter 0.15s ease;
}

/* Active highlight */
.vexflow-note.note-highlight {
  fill: #0969da;
  filter: drop-shadow(0 0 4px rgba(9, 105, 218, 0.6));
}
```

## Data Changes

- `renderScore()` must add `data-note-index="0"`, `data-note-index="1"`, etc. to each note head SVG element
- No changes to card data schema

## Observability Impact

- Console warning if `data-note-index` attribute not found on SVG elements
- `currentNoteIndex` exposed for UI feedback (e.g., "Note 3 of 8")
