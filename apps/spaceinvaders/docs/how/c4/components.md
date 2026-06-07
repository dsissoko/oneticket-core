# C4 Components — SpaceInvaders MVP Runtime

## Scope

This view decomposes the SpaceInvaders game module into technical components aligned with `architecture.md`.

```mermaid
C4Component
  title Component Diagram — SpaceInvaders MVP (planned)

  Container(appShellSpa, "AppShell SPA", "React + Vite", "Hosts game route")
  ContainerDb(browserStorage, "Browser localStorage", "Web Storage", "Best score persistence")

  Container_Boundary(spaceInvaders, "SpaceInvaders Module") {
    Component(gameScreen, "GameScreen", "React component", "Full-area layout wrapper for GameCanvas")
    Component(gameCanvas, "GameCanvas", "Canvas adapter", "Responsive canvas sizing and draw surface")
    Component(inputController, "InputController", "Input adapter", "Keyboard + touch intent translation")
    Component(gameEngine, "GameEngine", "Application service", "Tick loop and phase transitions")
    Component(collisionSystem, "CollisionSystem", "Domain service", "Missile/entity collisions and effects")
    Component(scoreService, "ScoreService", "Domain + persistence adapter", "Score update and best score sync")
    Component(endStateView, "EndStateView", "React component", "Victory/Game Over overlay and restart")
  }

  Rel(appShellSpa, gameScreen, "Renders route")
  Rel(gameScreen, gameCanvas, "Hosts")
  Rel(gameCanvas, inputController, "Forwards user interactions")
  Rel(inputController, gameEngine, "Sends move/fire intents")
  Rel(gameEngine, collisionSystem, "Resolves collisions")
  Rel(gameEngine, scoreService, "Emits score events")
  Rel(gameEngine, gameCanvas, "Publishes frame state")
  Rel(gameEngine, endStateView, "Triggers win/lose view state")
  Rel(scoreService, browserStorage, "Reads/Writes bestScore")
  Rel(endStateView, gameEngine, "Restart command")
```

## Related Documents

- [Architecture — SpaceInvaders MVP](../architecture.md)
- [C4 Deployment View](deployment.md)
