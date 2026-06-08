# Slice 7 — ScoreCard UI Integration

## Goal

Wire ScoreCard component into SessionScreen for solfège theme, enabling SVG score rendering on card front and Tone.js audio playback on card flip, while preserving existing FlashcardDisplay for text-based themes.

## Related Epics

[Epic 1 — Solfège Bilingual Score Cards](epic-1-solfege/epic.md)

## Related User Stories

[US-005 — Solfège Theme Selection](us-005-solfege-theme.md)

[US-006 — Score Rendering on Card Front](us-006-solfege-score-render.md)

[US-007 — Audio Playback on Card Flip](us-007-solfege-audio-playback.md)

[US-008 — Solfège Bilingual Names](us-008-solfege-bilingual-names.md)

## Impacted Components

| Component | Change |
|---|---|
| `src/components/ScoreCard.tsx` | New — integrates `renderScore` (VexFlow SVG) on card front + `playScore` (Tone.js audio) on flip |
| `src/screens/SessionScreen.tsx` | Modified — conditional rendering: ScoreCard for solfège theme, FlashcardDisplay for text themes |
| `src/hooks/useTheme.ts` | Extended — detect solfège theme type (`isSolfegeTheme` flag) |

## Interfaces

```typescript
interface ScoreCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onKnown: () => void;
  onUnknown: () => void;
  scoreData: ScoreData;
}

interface ScoreData {
  clef: string;       // 'treble' | 'bass'
  notes: ScoreNote[];
}

interface ScoreNote {
  note: string;       // e.g. 'C4'
  duration: string;   // 'w' | 'h' | 'q'
}
```

## Data Changes

No data schema changes. Solfège theme cards use the existing `Card` interface with `front`/`back` fields. The `ScoreData` is derived from card metadata (clef + note mapping) at render time.

## Sequence Flow

1. User selects Solfège theme from HomeScreen → `useTheme` sets `isSolfegeTheme = true`
2. SessionScreen loads solfège card deck
3. For each card:
   a. `ScoreCard` renders front: calls `renderScore({clef, notes})` → VexFlow produces SVG → injected into DOM
   b. User taps card → flip animation triggers
   c. On flip: `playScore({clef, notes})` called → Tone.js plays note(s) via Web Audio API
   d. Card back shows bilingual note names (FR: do/ré/mi, EN: C/D/E)
   e. ScoreButtons appear → user marks known/unknown
4. Non-solfège themes continue using `FlashcardDisplay` with text flip animation — unchanged

## Observability Impact

- Console warnings if VexFlow SVG fails to render (invalid note data)
- Audio context permission prompt on first `playScore` call (browser policy)
- No analytics or logging added in this slice

## Verification

- Solfège theme shows score cards with VexFlow SVG on card front
- Card flip triggers Tone.js audio playback of the corresponding note
- Card back displays bilingual FR/EN note names (do→C, ré→D, mi→E, fa→F, sol→G, la→A, si→B)
- World Capitals theme continues to show text cards with flip animation (unchanged)
- Both themes work independently — switching themes does not break either rendering path
- `npm run dev` starts without errors, TypeScript compiles cleanly
