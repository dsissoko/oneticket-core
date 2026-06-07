# Component Diagram — SpaceInvaders Runtime

This diagram details internal components of the runtime that implement gameplay behavior.

## C4 Component Diagram

```mermaid
C4Component
  title Component Diagram — SpaceInvaders Runtime

  Container(appShell, "AppShell Route", "React", "Hosts SpaceInvaders page")
  ContainerDb(localStorageDb, "localStorage", "Browser API", "Stores bestScore")

  Container_Boundary(runtime, "SpaceInvaders Runtime") {
    Component(gameScreen, "GameScreen", "React component", "Responsive host container")
    Component(gameCanvas, "GameCanvas", "React + Canvas", "Canvas element and render scheduling")
    Component(gameEngine, "GameEngine", "TypeScript orchestrator", "Tick loop and phase transitions")
    Component(alienWaveSystem, "AlienWaveSystem", "Domain module", "5x11 wave movement and random fire")
    Component(cannonSystem, "CannonSystem", "Domain module", "Cannon movement, reload bounds, missile spawn")
    Component(collisionSystem, "CollisionSystem", "Domain module", "Missile collisions and outcomes")
    Component(shieldSystem, "ShieldSystem", "Domain module", "Shield durability and visual degradation")
    Component(scoreService, "ScoreService", "Application service", "Current score and best score logic")
    Component(inputController, "InputController", "Input adapter", "Keyboard and touch intent mapping")
    Component(endStatePresenter, "EndStatePresenter", "UI presenter", "Victory/Game Over overlays and restart action")
  }

  Rel(appShell, gameScreen, "Renders route")
  Rel(gameScreen, gameCanvas, "Hosts")
  Rel(gameCanvas, inputController, "Registers event listeners")
  Rel(inputController, gameEngine, "Sends intents")
  Rel(gameEngine, alienWaveSystem, "Updates wave state")
  Rel(gameEngine, cannonSystem, "Updates cannon and player missiles")
  Rel(gameEngine, collisionSystem, "Resolves collisions")
  Rel(collisionSystem, shieldSystem, "Applies shield impacts")
  Rel(gameEngine, scoreService, "Publishes scoring events")
  Rel(scoreService, localStorageDb, "Persists bestScore")
  Rel(gameEngine, endStatePresenter, "Sends phase + final score")
  Rel(gameEngine, gameCanvas, "Provides frame state for drawing")
```

## Component Coverage

- US-001/US-002: `AlienWaveSystem`, `CannonSystem`, `InputController`.
- US-003: `CollisionSystem`, `ShieldSystem`.
- US-004/US-005: `EndStatePresenter`, `ScoreService`.
- US-006: `GameScreen`, `GameCanvas`, `InputController`.
