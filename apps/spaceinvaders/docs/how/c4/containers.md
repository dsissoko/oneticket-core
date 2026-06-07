# Container Diagram — SpaceInvaders MVP

This diagram shows the runtime containers and integrations used by the SpaceInvaders MVP.

## C4 Container Diagram

```mermaid
C4Container
  title Container Diagram — SpaceInvaders MVP

  Person(player, "Player", "Desktop or mobile player")

  System_Boundary(spaceinvadersBoundary, "SpaceInvaders in AppShell") {
    Container(gameScreen, "GameScreen", "React + Primer layout", "Hosts full-area responsive game surface")
    Container(gameEngine, "GameEngine", "TypeScript domain/application", "Runs tick loop, state transitions, and rules")
    Container(renderer, "GameCanvas Renderer", "Canvas 2D API", "Draws entities, HUD, and end overlays")
    Container(inputController, "InputController", "Keyboard + Touch adapters", "Translates keyboard/touch to intents")
    Container(scoreService, "ScoreService", "TypeScript service", "Computes current score and best score updates")
    ContainerDb(localStorageDb, "Best Score Storage", "Browser localStorage", "Persists bestScore across sessions")
  }

  Rel(player, gameScreen, "Uses")
  Rel(gameScreen, inputController, "Subscribes to input events")
  Rel(inputController, gameEngine, "Sends move/fire intents")
  Rel(gameEngine, renderer, "Publishes immutable frame state", "In-memory")
  Rel(gameEngine, scoreService, "Emits score/end events")
  Rel(scoreService, localStorageDb, "Reads/writes best score", "localStorage API")
  Rel(renderer, player, "Displays gameplay and HUD")
```

## Mapping to Architecture

- Boundaries and components match [Architecture — SpaceInvaders MVP](../architecture.md).
- Container-level scope is implementation-ready for slices in `../slices/`.
