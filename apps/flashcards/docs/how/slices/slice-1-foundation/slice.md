# Slice 1 — Foundation

Project scaffold, routing, theme data, type definitions, and core hooks.

## Context

Epic: [Epic 0 — MVP Flashcard App (World Capitals)](epic-0-mvp/epic.md)

User Stories: [US-001](us-001-home-screen.md), [US-002](us-002-session-flip.md), [US-003](us-003-results-screen.md), [US-004](us-004-complete-flow.md)

## Files

| File | Purpose |
|---|---|
| `src/data/themes/world-capitals.json` | Theme data: id, name, cards[] with front/back |
| `src/types/index.ts` | Type definitions: LearningMode, Theme, Card, SessionResult |
| `src/hooks/useLearningMode.ts` | Algorithm logic for flip timing and spaced-repetition scheduling |
| `src/hooks/useTheme.ts` | Provides theme data and selection state |
| `src/App.tsx` | Routing setup: /, /session, /results |
| `src/screens/HomeScreen.tsx` | Empty shell component (placeholder for slice 2) |

## Implementation

- Scaffold React + Vite + TypeScript project
- Configure MSW for local development
- Set up hash-based routing for GitHub Pages SPA fallback
- Define TypeScript interfaces matching architecture.md
- Load world-capitals.json theme data
- Export empty HomeScreen component as routing anchor

## Verification

- `npm run dev` starts without errors
- TypeScript compiles without errors
- All type exports resolve correctly