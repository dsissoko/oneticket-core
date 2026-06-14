---
title: 'C4 Containers — Opération Jungle'
---

# C4 Containers — Opération Jungle

Container diagram for Opération Jungle, showing the internal structure of the browser-based game.

```mermaid
C4Container
  title Container Diagram — Opération Jungle

  Person(player, "Player", "Human playing the arcade game")

  Container_Boundary(browser, "Web Browser") {
    Container(spa, "React SPA", "React + TypeScript + Vite", "Single-page application hosting the game")

    Container_Boundary(game, "Opération Jungle") {
      Component(engine, "Game Engine", "TypeScript", "Core game loop, state machine, collision detection")
      Component(ui, "UI Components", "React + Primer", "Score display, menus, game over screen")
      Component(input, "Input Handler", "TypeScript", "Keyboard and touch event processing")
      Component(renderer, "Renderer", "HTML5 Canvas", "Game frame rendering and animation")
    }
  }

  Rel(player, spa, "Interacts with")
  Rel(spa, engine, "Runs")
  Rel(spa, ui, "Displays")
  Rel(input, engine, "Sends player actions")
  Rel(engine, renderer, "Draws game state")
  Rel(engine, ui, "Updates score & status")

  UpdateLayoutConfig($c4ShapeInRow="3")
```

## Notes

- **No external services or databases** — everything runs in the browser.
- **Game Engine** manages the core game loop, state transitions, and collision detection.
- **UI Components** handle menus, score display, and game-over overlays using React + Primer.
- **Input Handler** normalizes keyboard (desktop) and touch (mobile) events into game actions.
- **Renderer** draws each frame on an HTML5 Canvas element.
- Status: **current** — this is the V1 architecture.
