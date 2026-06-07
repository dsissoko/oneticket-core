# Deployment Diagram — SpaceInvaders MVP

This diagram represents the target MVP deployment model (`planned`) for the browser-only runtime.

## C4 Deployment Diagram

```mermaid
C4Deployment
  title Deployment Diagram — SpaceInvaders MVP (planned)

  Deployment_Node(userDevice, "Player Device", "Desktop/Mobile Browser") {
    Container(spaBundle, "AppShell + SpaceInvaders Bundle", "React + Vite static assets", "Loads route and game module")
    Container(gameRuntime, "SpaceInvaders Runtime", "TypeScript + Canvas 2D", "Executes game loop and rendering")
    ContainerDb(browserStorage, "Browser localStorage", "Web Storage", "Persists bestScore")
  }

  Deployment_Node(staticHost, "Static Hosting", "CDN / Static Server") {
    Container(artifactStore, "Built Artifacts", "HTML/CSS/JS", "Serves compiled frontend bundle")
  }

  Rel(artifactStore, spaBundle, "Served via HTTPS")
  Rel(spaBundle, gameRuntime, "Bootstraps route and starts game")
  Rel(gameRuntime, browserStorage, "Reads/writes bestScore", "localStorage API")
```

## Deployment Notes

- No backend container is required for MVP scope.
- Best score persistence remains browser-local only.
- Any future leaderboard would introduce additional containers and trust boundaries.
