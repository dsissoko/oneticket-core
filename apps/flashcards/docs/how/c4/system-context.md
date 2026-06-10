# System Context — Flashcard App

```mermaid
graph LR
    %% People
    Learner(("Learner"))

    %% System
    FlashcardApp["Flashcard App<br/><small>React SPA on GitHub Pages</small>"]

    %% External systems
    localStorage[("localStorage<br/><small>Browser persistence</small>")]
    MSW[("MSW<br/><small>Mock API service</small>")]

    %% Interactions
    Learner -->|1. Browse to app| FlashcardApp
    Learner -->|2. Select theme/mode| FlashcardApp
    Learner -->|3. Study cards| FlashcardApp
    Learner -->|4. See results| FlashcardApp

    FlashcardApp -->|Reads/writes cards| localStorage
    FlashcardApp -->|Mocks API responses| MSW

    style Learner fill:#02703a,stroke:#02703a,color:#fff
    style FlashcardApp fill:#0969da,stroke:#0969da,color:#fff
    style localStorage fill:#6e7781,stroke:#6e7781,color:#fff
    style MSW fill:#6e7781,stroke:#6e7781,color:#fff
```

## Interactions

1. **Browse to app** — Learner navigates to the Flashcard App URL
2. **Select theme/mode** — Learner picks a theme and learning mode on the home screen
3. **Study cards** — Learner flips through cards, marking known/unknown
4. **See results** — Learner views session score and can replay or return home

## External Dependencies

| External | Purpose |
|---|---|
| `localStorage` | Persists theme selection, session results, and progress across visits |
| `MSW` | Intercepts and mocks API calls for consistent offline/demo behavior |
| `VexFlow (bundled)` | SVG music notation rendering — used by ScoreEngine and ScoreAudioEngine |
| `Tone.js (bundled)` | Web Audio API abstraction — used by ScoreAudioEngine for note playback |