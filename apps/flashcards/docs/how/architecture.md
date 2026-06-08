---
title: Architecture
---

# Architecture

Stack: React + Vite + TypeScript + MSW + localStorage + VexFlow (SVG score rendering) + Tone.js (audio playback)

## Architecture Decisions

| ADR | Topic |
|---|---|
| [ADR-001](adr-001-solfege-computation-timing.md) | Solfège computation timing — progressive background pre-computation |

## ResponseEngine Contract

Themes expose answers through a `ResponseEngine` interface rather than raw `card.back` strings.
This enables computed answers (SVG, audio, composite) while maintaining backward compatibility.

```typescript
type AnswerType = 'text' | 'svg' | 'audio' | 'composite';

interface ComputedAnswer {
  type: AnswerType;
  value: string | SVGElement | AudioBuffer | Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface ResponseEngine {
  computeNextResponse(card: Card, context?: Record<string, unknown>): ComputedAnswer;
}
```

- **IdentityEngine** (default): returns `{ type: 'text', value: card.back }` — zero computation
- **Custom engines** (e.g., `ScoreResponseEngine` for Solfège): compute SVG + audio on demand
- Engine is resolved per theme at session start — `theme.responseEngine ?? IdentityEngine`

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
| `FlashcardDisplay` | Renders card front/back with flip animation |
| `ScoreCard` | Renders VexFlow SVG on card front, plays Tone.js audio on flip |
| `ThemePicker` | Selects from available themes |
| `ModeSelector` | Chooses learning mode (flip, spaced-repetition) |
| `ProgressBar` | Shows session advancement (X/Y) |
| `ScoreButtons` | "I knew it" / "I didn't know" post-flip |
| `SessionResults` | Displays final score and replay option |

## Key Types

```typescript
type LearningMode = 'flip' | 'spaced-repetition';

type AnswerType = 'text' | 'svg' | 'audio' | 'composite';

interface ComputedAnswer {
  type: AnswerType;
  value: string | SVGElement | AudioBuffer | Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface ResponseEngine {
  computeNextResponse(card: Card, context?: Record<string, unknown>): ComputedAnswer;
}

interface Theme {
  id: string;
  name: string;
  cards: Card[];
  responseEngine?: ResponseEngine;  // Optional — defaults to IdentityEngine
}

interface Card {
  id: string;
  front: string;
  back: string;
}

interface SessionResult {
  cardId: string;
  known: boolean;
  timestamp: number;
}

interface ScoreNote {
  note: string;       // e.g. 'C4'
  duration: string;   // 'w' | 'h' | 'q'
}

interface ScoreData {
  clef: string;       // 'treble' | 'bass'
  notes: ScoreNote[];
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
| `useTheme` | Provides theme data, selection, and resolved `ResponseEngine` |
| `useSession` | Manages session state, results, localStorage persistence — resolves answers via engine |
| `useAudioPlayback` | Manages Tone.js context, play/stop controls |
| `useScorePreloader` | Pre-computes next card's SVG in background during reading time (see ADR-001) |

## Modules

| Module | Responsibility |
|---|---|
| `IdentityEngine` | Default engine — returns `{ type: 'text', value: card.back }` |
| `ResponseEngine` registry | Resolves `theme.responseEngine ?? IdentityEngine` at session start |
| `renderScore` | Pure function: `{clef, notes} → SVG` injected into DOM target |
| `playScore` | Pure function: `{clef, notes} → sequential audio` via Tone.js + Web Audio API |
| `ScoreCache` | In-memory cache for pre-computed score SVGs (populated by `useScorePreloader`) |

## Constraints

- No backend — all data local
- localStorage only — persistence across sessions
- Algorithm logic in hook — separation of concerns
- GitHub Pages deployment — SPA routing with hash fallback
- Existing flashcard themes and tests must remain unaffected by VexFlow/Tone.js integration