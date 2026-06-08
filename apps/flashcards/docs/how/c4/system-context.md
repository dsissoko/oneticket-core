---
title: System Context — Flashcard App
---

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
    VexFlow[("VexFlow<br/><small>SVG music score rendering</small>")]
    ToneJS[("Tone.js<br/><small>Web Audio API synthesis</small>")]

    %% Interactions
    Learner -->|1. Browse to app| FlashcardApp
    Learner -->|2. Select theme/mode| FlashcardApp
    Learner -->|3. Study cards| FlashcardApp
    Learner -->|4. See results| FlashcardApp

    FlashcardApp -->|Reads/writes cards| localStorage
    FlashcardApp -->|Mocks API responses| MSW
    FlashcardApp -->|Renders score SVG| VexFlow
    FlashcardApp -->|Plays audio| ToneJS

    style Learner fill:#02703a,stroke:#02703a,color:#fff
    style FlashcardApp fill:#0969da,stroke:#0969da,color:#fff
    style localStorage fill:#6e7781,stroke:#6e7781,color:#fff
    style MSW fill:#6e7781,stroke:#6e7781,color:#fff
    style VexFlow fill:#6e7781,stroke:#6e7781,color:#fff
    style ToneJS fill:#6e7781,stroke:#6e7781,color:#fff
```

## Interactions

1. **Browse to app** — Learner navigates to the Flashcard App URL
2. **Select theme/mode** — Learner picks a theme and learning mode on the home screen
3. **Study cards** — Learner flips through cards, marking known/unknown
4. **See results** — Learner views session score and can replay or return home
5. **Score rendering** — Flashcard App renders the session score as an SVG music score using VexFlow
6. **Audio playback** — Flashcard App plays audio feedback and musical cues using Tone.js

## External Dependencies

| External | Purpose |
|---|---|
| `localStorage` | Persists theme selection, session results, and progress across visits |
| `MSW` | Intercepts and mocks API calls for consistent offline/demo behavior |
| `VexFlow` | OSS, MIT — SVG music score rendering for visual score display |
| `Tone.js` | OSS, MIT — Web Audio API synthesis for audio playback and musical cues |
