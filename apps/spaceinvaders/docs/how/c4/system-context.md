# C4 System Context — SpaceInvaders MVP

## Scope

This diagram shows the SpaceInvaders MVP boundaries in AppShell and the external actors/systems it depends on.

```mermaid
C4Context
  title System Context — SpaceInvaders MVP (planned)

  Person(playerDesktop, "Player (Desktop)", "Uses keyboard controls and reads HUD/end screens")
  Person(playerMobile, "Player (Mobile)", "Uses touch gestures and reads HUD/end screens")

  System(spaceInvaders, "SpaceInvaders MVP", "Browser game module embedded in AppShell")
  System_Ext(appShell, "OneTicket AppShell", "Hosts game route and responsive layout")
  System_Ext(localStorage, "Browser localStorage", "Persists best score across sessions")

  Rel(playerDesktop, spaceInvaders, "Plays game", "Keyboard + Canvas")
  Rel(playerMobile, spaceInvaders, "Plays game", "Touch + Canvas")
  Rel(spaceInvaders, appShell, "Runs inside", "SPA module")
  Rel(spaceInvaders, localStorage, "Reads/Writes bestScore", "Web Storage API")
```

## Related Documents

- [Architecture — SpaceInvaders MVP](../architecture.md)
- [C4 Container View](containers.md)
