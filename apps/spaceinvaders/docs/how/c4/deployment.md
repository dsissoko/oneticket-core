# C4 Deployment — SpaceInvaders MVP

## Scope

This deployment view captures the MVP target runtime: static frontend hosting and browser execution.

```mermaid
C4Deployment
  title Deployment Diagram — SpaceInvaders MVP (planned)

  Deployment_Node(playerDevice, "Player Device", "Desktop/Mobile Browser", "Runs the SPA client") {
    Container(browserRuntime, "Browser Runtime", "Canvas + Web APIs", "Executes SpaceInvaders game module")
    ContainerDb(browserStorage, "Browser localStorage", "Web Storage", "Stores bestScore")
  }

  Deployment_Node(githubPages, "GitHub Pages", "Static Hosting", "Serves built frontend assets") {
    Container(staticBundle, "Frontend Bundle", "Vite static assets", "AppShell + SpaceInvaders route")
  }

  Rel(browserRuntime, staticBundle, "Downloads app assets", "HTTPS")
  Rel(browserRuntime, browserStorage, "Reads/Writes bestScore", "Web Storage API")
```

## Related Documents

- [Architecture — SpaceInvaders MVP](../architecture.md)
