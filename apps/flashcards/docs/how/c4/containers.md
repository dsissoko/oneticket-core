# Container C4 Diagram — Flashcards App

## System Context

```mermaid
C4Context
    Person(user, "User", "Learns with flashcard sessions")
    System(flashcards, "Flashcards App", "React SPA for flashcard learning")

    Rel(user, flashcards, "Uses")
```

## Container Diagram

```mermaid
C4Container
    Person(user, "User", "Learns with flashcard sessions")

    Container(spa, "Web Application", "React SPA", "Serves flashcard UI, manages client-side routing")
    ContainerDb(localStorage, "Local Storage", "Browser localStorage", "Persists session state and results")

    System_Ext(msw, "MSW Handlers", "Mock Service Worker", "Serves theme data (world-capitals.json) and session results")

    Rel(user, spa, "Interacts with")
    Rel(spa, localStorage, "Reads/Writes session data")
    Rel(spa, msw, "Fetches theme data and results")
```

## Component Details

### React SPA Container

**Technology:** React + Vite + TypeScript + MSW

**Client-side routes:**
- `/` — HomeScreen (theme picker, mode selector, Start button)
- `/session` — SessionScreen (flashcard display, progress, score buttons)
- `/results` — ResultsScreen (session score, replay, back to home)

**State management:**
- React Context for session state (current card, progress, score)
- localStorage for persistence across sessions

**MSW handlers:**
- Theme data: `world-capitals.json` (card deck with front/back pairs)
- Session results: stores/retrieves per-session outcomes

### Components

| Component | Responsibility |
|---|---|
| `HomeScreen` | Theme picker, mode selector, Start button |
| `SessionScreen` | Flashcard display, progress bar, score buttons |
| `ResultsScreen` | Session score display, replay, back to home |
| `FlashcardDisplay` | Renders card front/back with flip animation |
| `ThemePicker` | Selects from available themes |
| `ModeSelector` | Chooses learning mode (flip, spaced-repetition) |
| `ProgressBar` | Shows session advancement (X/Y) |
| `ScoreButtons` | "I knew it" / "I didn't know" post-flip |

### External Integrations

| External | Purpose |
|---|---|
| Local Storage | Persist session results and user preferences |
| MSW (world-capitals.json) | Serve flashcard theme data |
| MSW (session results) | Mock storage for session outcomes |

## RenderEngine Layer

### Rendering Architecture

```mermaid
C4Component
    Container(spa, "Web Application", "React SPA", "Flashcard app with RenderEngine")
    
    Component(FlashcardDisplay, "FlashcardDisplay", "React Component", "Delegates rendering to resolved engine")
    Component(EngineRegistry, "Engine Registry", "TypeScript", "Resolves engines by renderEngineId")
    Component(TextEngine, "TextEngine", "TypeScript", "Plain text rendering")
    Component(MarkdownEngine, "MarkdownEngine", "TypeScript", "Markdown to HTML rendering")
    
    Rel(FlashcardDisplay, EngineRegistry, "Resolves engine by ID")
    Rel(EngineRegistry, TextEngine, "Instantiates")
    Rel(EngineRegistry, MarkdownEngine, "Instantiates")
```

### Engine Resolution Flow

1. CardSide is normalized: plain string → `{ data, renderEngineId: 'text' }`
2. EngineRegistry resolves the engine by `renderEngineId`
3. FlashcardDisplay calls `engine.render(data, targetElement)`
4. If engine supports `precompute`, SessionScreen calls it during question display

### Components Updated

| Component | Change |
|---|---|
| `FlashcardDisplay` | Now delegates rendering to resolved RenderEngine instead of direct text rendering |
| `SessionScreen` | Implements precompute lifecycle for async engines |