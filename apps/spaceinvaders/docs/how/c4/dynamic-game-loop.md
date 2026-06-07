# C4 Dynamic — SpaceInvaders Gameplay Loop

## Scope

This dynamic view shows the runtime flow from player input to frame rendering and score persistence.

```mermaid
C4Dynamic
  title Dynamic Diagram — SpaceInvaders Tick and End-State Flow

  Container(inputController, "InputController", "Input adapter", "Keyboard/touch intents")
  Component(gameEngine, "GameEngine", "Loop orchestration", "Tick/update state machine")
  Component(collisionSystem, "CollisionSystem", "Domain service", "Collision resolution")
  Component(scoreService, "ScoreService", "Domain + persistence", "Score and best score updates")
  Container(gameCanvas, "GameCanvas", "Canvas adapter", "Frame renderer")
  Component(endStateView, "EndStateView", "UI component", "Victory/Game Over + restart")
  ContainerDb(browserStorage, "Browser localStorage", "Web Storage", "bestScore")

  Rel(inputController, gameEngine, "1. Send move/fire intents")
  Rel(gameEngine, collisionSystem, "2. Resolve missiles/entities")
  Rel(collisionSystem, gameEngine, "3. Return collision outcomes")
  Rel(gameEngine, scoreService, "4. Emit scoring events")
  Rel(scoreService, browserStorage, "5. Persist bestScore when exceeded")
  Rel(gameEngine, gameCanvas, "6. Publish frame state for render")
  Rel(gameEngine, endStateView, "7. Trigger victory/game-over overlay")
  Rel(endStateView, gameEngine, "8. Restart run")
```

## Related Documents

- [Architecture — SpaceInvaders MVP](../architecture.md)
