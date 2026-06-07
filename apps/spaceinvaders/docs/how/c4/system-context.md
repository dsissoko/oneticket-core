# System Context — SpaceInvaders MVP

This diagram shows the SpaceInvaders MVP in its product context.

## C4 Context Diagram

```mermaid
C4Context
  title System Context — SpaceInvaders MVP

  Person(playerDesktop, "Desktop Player", "Plays with keyboard inputs")
  Person(playerMobile, "Mobile Player", "Plays with touch gestures")

  System(spaceinvaders, "SpaceInvaders MVP", "Canvas-based arcade module embedded in AppShell")
  System_Ext(browser, "Web Browser", "Executes React app, Canvas API, and localStorage")

  Rel(playerDesktop, spaceinvaders, "Plays using Left/Right and Space")
  Rel(playerMobile, spaceinvaders, "Plays using top-zone taps and bottom-zone drag")
  Rel(spaceinvaders, browser, "Renders canvas and stores best score", "Canvas API + localStorage")
```

## Scope Notes

- In scope: gameplay loop, rendering, input handling, scoring, end states.
- Out of scope: backend services, authentication, multiplayer, leaderboard.

See [Architecture — SpaceInvaders MVP](../architecture.md) for decisions and constraints.
