---
title: System Context — Space Invaders
---

# System Context — Space Invaders

## C4 System Context Diagram

```mermaid
C4Context
    title Space Invaders System Context

    Person(player, "Player", "Desktop or mobile user playing the game")
    System_SpaceInvaders("Space Invaders Game", "React+Vite+TypeScript SPA with Canvas API rendering", "Browser-based arcade game")
    System_ghpages("GitHub Pages", "Static hosting platform", "Deploys the built SPA")
    System_browser("Web Browser", "Executes the game, provides Canvas API and localStorage")

    Rel(player, System_browser, "Interacts with via", "keyboard/touch")
    Rel(browser, System_SpaceInvaders, "Runs")
    Rel(ghpages, browser, "Serves static files to")
```

## Description
The Space Invaders game is a single-page application served via GitHub Pages and executed in the user's web browser. The player interacts through keyboard (desktop) or touch gestures (mobile). All game rendering uses the Canvas API. Best score is persisted in browser localStorage.
