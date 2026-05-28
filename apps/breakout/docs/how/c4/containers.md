# C4 Containers Diagram — Breakout Game Engine

## Overview

This diagram shows the major containers (deployable units and subsystems) of the Breakout game engine. All containers run within a single browser instance as a vanilla JavaScript single-page application.

## C4 Container Diagram

```mermaid
C4Container
  title Container Diagram — Breakout Game Engine

  Person(player, "Player", "Plays the Breakout game")

  Container_Boundary(spa, "Breakout Game (Browser SPA)") {
    Container(gameLoop, "Game Loop", "JavaScript", "Orchestrates each frame: input → physics → collision → render")
    Container(gameState, "Game State Manager", "JavaScript", "Maintains single source of truth: lives, bricks, ball, paddle, phase")
    Container(physics, "Physics Engine", "JavaScript", "Updates ball and paddle position/velocity based on deltaTime")
    Container(collision, "Collision Detector", "JavaScript", "Detects and resolves collisions: ball vs walls, paddle, bricks, floor")
    Container(renderer, "Renderer (Canvas + DOM)", "Canvas 2D + DOM", "Draws game objects (bricks, ball, paddle) on canvas and UI on DOM")
    Container(input, "Input Handler", "JavaScript", "Captures keyboard (arrows) and mouse (clicks, slider) events")
    Container(menu, "Menu Controller", "JavaScript + DOM", "Manages navigation: main menu, options, game, victory, game-over screens")
    Container(brickFactory, "Brick Factory", "JavaScript", "Generates initial brick layout for each game session")
  }

  Rel(player, gameLoop, "Interacts with game via", "keyboard/mouse")
  Rel(input, gameState, "Updates", "paddle.vx, speedMultiplier")
  Rel(gameLoop, gameState, "Reads/writes", "all game state")
  Rel(gameLoop, physics, "Calls update(dt)", "per frame")
  Rel(physics, gameState, "Updates", "ball, paddle position/velocity")
  Rel(gameLoop, collision, "Calls detectAndResolve()", "per frame")
  Rel(collision, gameState, "Modifies", "ball velocity, bricks, lives")
  Rel(gameLoop, renderer, "Calls draw()", "per frame")
  Rel(renderer, gameState, "Reads", "all game state for rendering")
  Rel(menu, gameState, "Updates", "phase, speedMultiplier, resets game")
  Rel(brickFactory, gameState, "Populates", "initial brick array")
```

## Container Descriptions

| Container | Technology | Responsibility |
|-----------|-----------|-----------------|
| **Game Loop** | JavaScript | Synchronizes all subsystems each frame: input processing, physics update, collision detection, rendering, win/loss checking |
| **Game State Manager** | JavaScript | Single source of truth for all game data: phase, lives, ball state, paddle state, bricks array, speed multiplier |
| **Physics Engine** | JavaScript | Calculates ball and paddle motion using deltaTime; applies speed multiplier; enforces screen bounds on paddle |
| **Collision Detector** | JavaScript | Detects ball collisions (walls, ceiling, paddle, bricks, floor) in priority order; resolves one collision per frame |
| **Renderer (Canvas + DOM)** | Canvas 2D + DOM | Draws game objects on canvas; renders UI (lives counter, speed gauge) and menus on DOM |
| **Input Handler** | JavaScript | Listens to keyboard (arrow keys) and mouse (clicks, slider) events; updates game state accordingly |
| **Menu Controller** | JavaScript + DOM | Manages screen transitions (main menu → options → game → victory/gameover); persists speed preference in memory |
| **Brick Factory** | JavaScript | Generates initial 5×5 brick layout; creates brick objects with id, position, dimensions, color |

## Data Flow

1. **Input Flow** — Player keyboard/mouse → Input Handler → Game State (paddle velocity, speed multiplier)
2. **Physics Flow** — Game Loop → Physics Engine → Game State (ball position, paddle position)
3. **Collision Flow** — Game Loop → Collision Detector → Game State (ball velocity, destroyed bricks, lives)
4. **Render Flow** — Game Loop → Renderer → Canvas/DOM (visual game state)
5. **Menu Flow** — Player clicks → Menu Controller → Game State (phase transitions, resets)

## Key Architectural Properties

- **Single Page Application** — All containers run in one JavaScript execution context (no server/backend)
- **Frame-Driven Architecture** — Game Loop orchestrates all updates at 60 FPS using `requestAnimationFrame`
- **Immutable State Transitions** — Game state changes flow unidirectionally: input → state update → render
- **No External Dependencies** — Pure vanilla HTML5, CSS3, ES6 JavaScript
- **Single Collision Per Frame** — Prevents ball tunneling by resolving only one collision per frame

## Deployment Model

All containers are packaged as a single `index.html` file with embedded or linked JavaScript modules, served directly to the browser with no build step required.

---

**See also:** [Architecture](../architecture.md) | [System Context](./system-context.md) *(planned)*
