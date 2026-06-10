# Architecture

Stack: React + Vite + TypeScript + MSW + localStorage

## AppShell Base

Scaffold from `AppShell` template, adapted for flashcards:
- Remove navigation items: Help, Demo
- Keep: Home, About
- Retain the core layout shell (header, content area, nav) for consistent UX

## Screens

| Route | Screen | Description |
|---|---|---|
| `/` | HomeScreen | Theme picker, mode selector, Start button |
| `/session` | SessionScreen | Flashcard display, progress bar, score buttons |
| `/results` | ResultsScreen | Session score, replay, back to home |

## Components

| Component | Responsibility |
|---|---|
| `FlashcardDisplay` | Renders card front/back using resolved RenderEngine with flip animation |
| `ThemePicker` | Selects from available themes |
| `ModeSelector` | Chooses learning mode (flip, spaced-repetition) |
| `ProgressBar` | Shows session advancement (X/Y) |
| `ScoreButtons` | "I knew it" / "I didn't know" post-flip |
| `SessionResults` | Displays final score and replay option |

## Key Types

```typescript
type LearningMode = 'flip' | 'spaced-repetition';

interface Theme {
  id: string;
  name: string;
  cards: Card[];
}

interface Card {
  id: string;
  front: CardSide;
  back: CardSide;
}

interface SessionResult {
  cardId: string;
  known: boolean;
  timestamp: number;
}

interface RenderEngine {
  render(data: any, target: HTMLElement): void
  precompute?(data: any): Promise<void>  // optional — async engines only
}

type CardSide = string | { data: any; renderEngineId: string }
// plain string defaults to TextEngine (backward compatible)
```

## RenderEngine Architecture

### Interface

```typescript
interface RenderEngine {
  render(data: any, target: HTMLElement): void
  precompute?(data: any): Promise<void>  // optional — async engines only
}
```

### CardSide Type

```typescript
type CardSide = string | { data: any; renderEngineId: string }
// plain string defaults to TextEngine (backward compatible)
```

### Built-in Engines

| Engine | ID | Purpose | precompute |
|---|---|---|---|
| TextEngine | `text` | Plain text rendering | No |
| MarkdownEngine | `markdown` | Markdown to HTML conversion | No |
| ScoreEngine | `score` | VexFlow SVG music score — question side | No |
| ScoreAudioEngine | `score-audio` | VexFlow SVG + Tone.js audio playback — answer side | Yes |

### ScoreData Interface

```typescript
interface ScoreData {
  clef: 'treble' | 'bass'
  notes: Array<{ note: string; duration: string }>
}
```

Used by both `ScoreEngine` and `ScoreAudioEngine`. Note names follow VexFlow format (e.g. `C4`, `D4`). Duration values: `"w"` (whole), `"h"` (half), `"q"` (quarter).

### ScoreAudioEngine — Audio Lifecycle

`precompute(data)` pre-schedules the Tone.js note sequence in the background while the learner reads the question. Audio playback starts inside `render()` — which is triggered by the flip gesture (constituting the required Web Audio API user gesture).

```
Question displayed
    └─► engine.precompute(back.data)   ← pre-schedules Tone.js sequence
              │
              └─► runs in background
[User taps to flip]
    └─► engine.render(back.data, target)  ← injects SVG + triggers audio play
```

### External Dependencies (Solfège)

| Library | Version | Purpose |
|---|---|---|
| `vexflow` | `^4.2.2` | SVG music notation rendering |
| `tone` | `^15.0.4` | Web Audio API — browser note playback |

### Engine Registry

Map-based lookup that resolves implementations by `renderEngineId`. Falls back to `TextEngine` for unknown or missing IDs.

### Normalization Helper

Converts legacy plain string card sides to extended format:
`"France"` → `{ data: "France", renderEngineId: "text" }`

### Precompute Lifecycle in SessionScreen

```
Question displayed
    └─► engine.precompute?.(back.data)   ← called immediately if engine supports it
              │
              └─► runs in background while user reads the question
                        │
[User taps to flip]     │
    ├─ precompute done  ─┤─► instant flip ✅
    └─ still running   ──┘─► wait for completion → then flip ⏳
```

TextEngine and MarkdownEngine do NOT implement precompute — flip is always instant.
The mechanism is universal so future engines (e.g. ScoreAudioEngine) benefit automatically.

## Routes

- `/` — Home
- `/session` — Session
- `/results` — Results

## Navigation

- Home
- About

Removed: Help, Demo

## Hooks

| Hook | Responsibility |
|---|---|
| `useLearningMode` | Isolates algorithm logic (flip timing, spaced-repetition scheduling) |
| `useTheme` | Provides theme data and selection |
| `useSession` | Manages session state, results, localStorage persistence |

## Constraints

- No backend — all data local
- localStorage only — persistence across sessions
- Algorithm logic in hook — separation of concerns
- GitHub Pages deployment — SPA routing with hash fallback
