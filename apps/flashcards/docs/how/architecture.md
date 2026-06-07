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
| `FlashcardDisplay` | Renders card front/back with flip animation |
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
  front: string;
  back: string;
}

interface SessionResult {
  cardId: string;
  known: boolean;
  timestamp: number;
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
| `useTheme` | Provides theme data and selection |
| `useSession` | Manages session state, results, localStorage persistence |

## Constraints

- No backend — all data local
- localStorage only — persistence across sessions
- Algorithm logic in hook — separation of concerns
- GitHub Pages deployment — SPA routing with hash fallback