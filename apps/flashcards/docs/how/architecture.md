---
title: Architecture
---

# Architecture

Stack: React + Vite + TypeScript + MSW + localStorage + VexFlow (SVG score rendering) + Tone.js (audio playback)

## Architecture Decisions

| ADR | Topic |
|---|---|
| [ADR-001](adr-001-solfege-computation-timing.md) | Solfège computation timing — progressive background pre-computation |

## RenderingEngine Contract

Themes render content through a `RenderingEngine` interface that separates **what to display** from **how to display it**. The engine is stateless — it receives data and returns a `ReactNode`. Preloading of next card content belongs in the app layer (`CardPreloader`), not in the engine.

```typescript
interface RenderingEngine {
  /** Render the question (card front) */
  renderQuestion(card: Card): ReactNode;
  /** Render the answer (computed response) */
  renderAnswer(answer: ComputedAnswer): ReactNode;
}
```

- **TextRenderingEngine** (default for existing themes): renders `card.front` and `answer.value` as styled text, handles single-line and multi-line content (`\n` breaks)
- **ScoreRenderingEngine** (for Solfège): renders VexFlow SVG on question, triggers Tone.js audio + highlight on answer
- Engine is resolved per theme at session start — `theme.renderingEngine ?? TextRenderingEngine`

### Renderer Dispatch (inside RenderingEngine)

```typescript
// renderAnswer dispatches by ComputedAnswer.type
switch (answer.type) {
  case 'text':      return TextRenderer.render(answer.value);
  case 'svg':       return SvgRenderer.render(answer.value);
  case 'audio':     return AudioRenderer.render(answer.value);
  case 'composite': return CompositeRenderer.render(answer.value);
}
```

### Preloading (App Layer, NOT in RenderingEngine)

```typescript
// CardPreloader — app-level, knows session flow
function useCardPreloader(cards: Card[], currentIndex: number, engine: RenderingEngine) {
  // Pre-renders next card's question + answer in background
  // Stores in cache for instant display on navigation
}
```

## RenderEngine Contract

Themes expose answers through a `RenderEngine` interface rather than raw `card.back` strings.
This enables computed answers (SVG, audio, composite) while maintaining backward compatibility.

```typescript
type AnswerType = 'text' | 'svg' | 'audio' | 'composite';

interface ComputedAnswer {
  type: AnswerType;
  value: string | SVGElement | AudioBuffer | Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface RenderEngine {
  computeNextResponse(card: Card, context?: Record<string, unknown>): ComputedAnswer;
}
```

- **IdentityEngine** (default): returns `{ type: 'text', value: card.back }` — zero computation
- **Custom engines** (e.g., `ScoreRenderEngine` for Solfège): compute SVG + audio on demand
- Engine is resolved per theme at session start — `theme.renderEngine ?? IdentityEngine`

### Relationship: RenderEngine vs RenderingEngine

| Concern | Interface | Responsibility |
|---|---|---|
| "What is the answer?" | `RenderEngine.computeNextResponse()` | Computes the answer data |
| "How to display it?" | `RenderingEngine.renderAnswer()` | Renders the answer as ReactNode |
| "When to preload?" | `CardPreloader` (app layer) | Pre-renders next card in background |

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
| `FlashcardDisplay` | Renders card front/back with flip animation (text-based themes) |
| `ScoreCard` | Renders VexFlow SVG on card front, plays Tone.js audio on flip (solfège themes) |
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

type AnswerType = 'text' | 'svg' | 'audio' | 'composite';

type TempoDirective = 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'presto';

interface ComputedAnswer {
  type: AnswerType;
  value: string | SVGElement | AudioBuffer | Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface RenderEngine {
  computeNextResponse(card: Card, context?: Record<string, unknown>): ComputedAnswer;
}

interface RenderingEngine {
  renderQuestion(card: Card): ReactNode;
  renderAnswer(answer: ComputedAnswer): ReactNode;
}

interface Theme {
  id: string;
  name: string;
  cards: Card[];
  renderEngine?: RenderEngine;   // Optional — defaults to IdentityEngine
  renderingEngine?: RenderingEngine; // Optional — defaults to TextRenderingEngine
}

interface Card {
  id: string;
  front: string;
  back: string;
  score?: ScoreData;  // Present for solfège cards
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
| `useTheme` | Provides theme data, selection, and resolved `RenderEngine` + `RenderingEngine` |
| `useSession` | Manages session state, results, localStorage persistence — resolves answers via engine |
| `useAudioPlayback` | Manages Tone.js context, play/stop controls (non-animated mode) |
| `useAnimatedPlayback` | Manages Tone.js context + note highlight sync, pause/resume/skip/jump (animated mode) |
| `useScorePreloader` | Pre-computes next card's SVG in background during reading time (see ADR-001) |
| `useCardPreloader` | Pre-renders next card's question + answer via RenderingEngine in background |

## Modules

| Module | Responsibility |
|---|---|
| `IdentityEngine` | Default RenderEngine — returns `{ type: 'text', value: card.back }` |
| `TextRenderingEngine` | Default RenderingEngine — renders text (single-line + multi-line with `\n`) |
| `ScoreRenderingEngine` | Solfège RenderingEngine — renders VexFlow SVG + Tone.js audio |
| `RenderEngine` registry | Resolves `theme.renderEngine ?? IdentityEngine` at session start |
| `RenderingEngine` registry | Resolves `theme.renderingEngine ?? TextRenderingEngine` at session start |
| `renderScore` | Pure function: `{clef, notes} → SVG` injected into DOM target |
| `playScore` | Pure function: `{clef, notes} → sequential audio` via Tone.js + Web Audio API |
| `highlightNote` | Pure function: applies/removes CSS highlight on SVG note elements |
| `tempo` | Tempo calculation utilities (BPM ↔ duration, directive ↔ BPM) |
| `ScoreCache` | In-memory cache for pre-computed score SVGs (populated by `useScorePreloader`) |
| `CardPreloader` | App-level preloader — pre-renders next card via RenderingEngine |

## Constraints

- No backend — all data local
- localStorage only — persistence across sessions
- Algorithm logic in hook — separation of concerns
- GitHub Pages deployment — SPA routing with hash fallback
- Existing flashcard themes and tests must remain unaffected by VexFlow/Tone.js integration