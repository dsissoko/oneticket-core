# C4 Containers — SpaceInvaders MVP

## Scope

This view details the deployable/runtime containers used by the MVP in-browser architecture.

```mermaid
C4Container
  title Container Diagram — SpaceInvaders MVP (planned)

  Person(player, "Player", "Desktop or mobile player")

  Container_Boundary(app, "OneTicket Frontend") {
    Container(appShellSpa, "AppShell SPA", "React + Vite + TypeScript", "Shell routing and page composition")
    Container(spaceInvadersModule, "SpaceInvaders Module", "React + Canvas", "Game route with loop, entities, collisions, HUD")
    Container(scorePersistence, "Score Persistence Adapter", "Web Storage API", "Persists and retrieves bestScore")
    ContainerDb(browserStorage, "Browser localStorage", "Key/Value", "Stores bestScore")
  }

  Rel(player, appShellSpa, "Uses", "Browser UI")
  Rel(appShellSpa, spaceInvadersModule, "Renders route", "SPA navigation")
  Rel(spaceInvadersModule, scorePersistence, "Gets/Sets best score", "Adapter calls")
  Rel(scorePersistence, browserStorage, "Reads/Writes bestScore", "localStorage API")
```

## Related Documents

- [Architecture — SpaceInvaders MVP](../architecture.md)
- [C4 Component View](components.md)
