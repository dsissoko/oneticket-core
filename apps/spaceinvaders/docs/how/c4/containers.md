---
title: Containers — Space Invaders
---

# Containers — Space Invaders

## C4 Container Diagram

```mermaid
C4Container
    title Space Invaders Container Diagram

    Person(player, "Player", "Desktop or mobile user")

    Container_Boundary(browser, "Web Browser") {
        Container_SpaceInvaders("Space Invaders SPA", "React + Vite + TypeScript", "Game application")
        Container_CanvasAPI("Canvas API", "Browser native", "All game rendering")
        Container_Storage("localStorage", "Browser native", "Best score persistence")
    }

    Rel(player, SpaceInvaders, "Controls via", "keyboard/touch")
    Rel(SpaceInvaders, CanvasAPI, "Renders via", "ctx draw calls")
    Rel(SpaceInvaders, Storage, "Reads/writes", "best score")
```

## Description
The application runs as a single container (SPA) within the browser. It uses the browser's native Canvas API for all rendering and localStorage for persisting the best score across sessions. No server-side components or external services are required.

## Related Architecture

- [Architecture](../architecture.md)
