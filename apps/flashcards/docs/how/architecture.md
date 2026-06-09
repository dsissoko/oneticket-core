---
title: Architecture
---

# Architecture

Stack: React + Vite + TypeScript + MSW + localStorage + VexFlow (SVG score rendering) + Tone.js (audio playback)

## Architecture Decisions

| ADR | Topic |
|---|---|
| [ADR-001](adr-001-solfege-computation-timing.md) | Solfège computation timing — progressive background pre-computation |

## RenderEngine Contract

Themes render card sides through a single `RenderEngine` interface that unifies **what to render** and **how to render it**. Each card side (question or answer) references a `renderEngineId` string that selects the engine implementation.

```typescript
interface RenderEngine {
  /** Render the card side (question or answer) into a DOM target */
  render(data: unknown, target: HTMLElement): void;
  /** Optional async pre-computation — used by ScoreAudioEngine only */
  precompute?(data: unknown): Promise<void>;
}
```

### Built-in Engine Implementations

| Engine | `renderEngineId` | Responsibility |
|---|---|---|
| `TextEngine` | `"text"` | Plain text rendering |
| `MarkdownEngine` | `"markdown"` | Markdown to HTML rendering |
| `ScoreEngine` | `"score"` | VexFlow SVG score rendering (solfège questions) |
| `ScoreAudioEngine` | `"score-audio"` | VexFlow SVG + Tone.js audio (solfège answers) |

### Card Side Contract

Each card side references a `renderEngineId` that selects the engine:

```typescript
interface CardSide {
  renderEngineId: string;   // "text" | "markdown" | "score" | "score-audio"
  data: unknown;            // Engine-specific data payload
}

interface Card {
  id: string;
  front: CardSide;
  back: CardSide;
}
```

### Preloading Strategy

`precompute()` is triggered immediately after the question is displayed. On card tap:
- If precompute is done → instant flip
- If still running → wait for completion then flip

```typescript
// Preloading flow
async function onQuestionDisplayed(card: Card) {
  const engine = resolveEngine(card.back.renderEngineId);
  if (engine.precompute) {
    await engine.precompute(card.back.data);  // runs in background
  }
}

// On card flip
async function onCardFlip(card: Card, target: HTMLElement) {
  const engine = resolveEngine(card.back.renderEngineId);
  if (engine.precompute && !isPrecomputed(card)) {
    await engine.precompute(card.back.data);  // wait if not done
  }
  engine.render(card.back.data, target);
}
```

### Engine Resolution

```typescript
const engineRegistry: Record<string, RenderEngine> = {
  "text": new TextEngine(),
  "markdown": new MarkdownEngine(),
  "score": new ScoreEngine(),
  "score-audio": new ScoreAudioEngine(),
};

function resolveEngine(renderEngineId: string): RenderEngine {
  return engineRegistry[renderEngineId] ?? engineRegistry["text"];
}
```

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
| `FlashcardDisplay` | Renders card front/back with flip animation using `RenderEngine.render(data, target)` |
| `ScoreCard` | Renders VexFlow SVG on card front via ScoreEngine, plays Tone.js audio on flip via ScoreAudioEngine |
| `PlaybackControls` | Toolbar with pause, replay, skip, progress indicator (animated solfège mode) |
| `TempoSelector` | UI for selecting tempo (directive dropdown + optional BPM input) |
| `ThemePicker` | Selects from available themes |
| `ModeSelector` | Chooses learning mode (flip, spaced-repetition, animated) |
| `ProgressBar` | Shows session advancement (X/Y) |
| `ScoreButtons` | "I knew it" / "I didn't know" post-flip |
| `SessionResults` | Displays final score and replay option |

## Key Types

```typescript
type LearningMode = 'flip' | 'spaced-repetition' | 'animated';

type TempoDirective = 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'presto';

type RenderEngineId = 'text' | 'markdown' | 'score' | 'score-audio';

interface RenderEngine {
  /** Render the card side (question or answer) into a DOM target */
  render(data: unknown, target: HTMLElement): void;
  /** Optional async pre-computation — used by ScoreAudioEngine only */
  precompute?(data: unknown): Promise<void>;
}

interface CardSide {
  renderEngineId: RenderEngineId;
  data: unknown;
}

interface Card {
  id: string;
  front: CardSide;
  back: CardSide;
}

interface Theme {
  id: string;
  name: string;
  cards: Card[];
}

interface SessionResult {
  cardId: string;
  known: boolean;
  timestamp: number;
}

interface ScoreNote {
  note: string;              // e.g. 'C4', 'F#4'
  duration: string;          // 'w' | 'h' | 'q' | 'e' | 'q.' (dotted)
  accidental?: 'sharp' | 'flat' | 'natural';
  name: { en: string; fr: string };
}

interface ScoreData {
  clef: 'treble' | 'bass' | 'alto';
  keySignature?: number;     // sharps (+) or flats (-), 0 = C major
  timeSignature?: { top: number; bottom: number };
  notes: ScoreNote[];
}

interface Tempo {
  bpm: number;
  directive?: TempoDirective;
}
```

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
| `useTheme` | Provides theme data, selection |
| `useSession` | Manages session state, results, localStorage persistence — resolves answers via RenderEngine |
| `useAudioPlayback` | Manages Tone.js context, play/stop controls (non-animated mode) |
| `useAnimatedPlayback` | Manages Tone.js context + note highlight sync, pause/resume/skip/jump (animated mode) |
| `useScorePreloader` | Triggers `precompute()` on next card's back side after question is displayed (see ADR-001) |

## Modules

| Module | Responsibility |
|---|---|
| `TextEngine` | Default RenderEngine — renders plain text into DOM target |
| `MarkdownEngine` | RenderEngine — renders markdown as HTML into DOM target |
| `ScoreEngine` | RenderEngine — renders VexFlow SVG score into DOM target (solfège questions) |
| `ScoreAudioEngine` | RenderEngine — renders VexFlow SVG + Tone.js audio into DOM target (solfège answers); implements `precompute()` |
| `RenderEngine` registry | Resolves engine by `renderEngineId` — defaults to `TextEngine` |
| `renderScore` | Pure function: `{clef, notes} → SVG` injected into DOM target (used by ScoreEngine) |
| `playScore` | Pure function: `{clef, notes} → sequential audio` via Tone.js + Web Audio API (used by ScoreAudioEngine) |
| `highlightNote` | Pure function: applies/removes CSS highlight on SVG note elements |
| `tempo` | Tempo calculation utilities (BPM ↔ duration, directive ↔ BPM) |
| `ScoreCache` | In-memory cache for pre-computed score SVGs (populated by `useScorePreloader`) |

## Constraints

- No backend — all data local
- localStorage only — persistence across sessions
- Algorithm logic in hook — separation of concerns
- GitHub Pages deployment — SPA routing with hash fallback
- Existing flashcard themes and tests must remain unaffected by VexFlow/Tone.js integration