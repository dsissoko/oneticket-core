---
title: Space Invaders — Architecture
---

# Space Invaders — Architecture

## 1. Architecture Principles

- **Canvas-only rendering** — All game visuals rendered exclusively via Canvas API `ctx` draw calls; no HTML overlays, no DOM-based game elements.
- **No external game frameworks** — No Phaser, no Pixi.js, no third-party game engines. All game logic and rendering built from scratch.
- **Responsive-first design** — Canvas fills the content area using a flex-grow pattern; all game elements scale proportionally to viewport dimensions.
- **Separation of game logic from rendering** — Game state management is decoupled from Canvas rendering; renderers consume state, they do not mutate it.
- **localStorage for persistence** — Best score persisted in browser localStorage; sandboxed to origin, no server-side storage.

## 2. System Overview

Single-page React application built with Vite as the build tool and TypeScript for type safety. All game rendering is performed via the Canvas API within a single `<canvas>` element. Tailwind CSS provides layout scaffolding for the React component tree. The application is fully client-side with no backend services.

## 3. Architectural Style

- **Component-based React** — UI layout and game container managed as React components.
- **Game loop pattern** — `requestAnimationFrame` drives the game loop at a consistent frame rate.
- **State machine** — Game states managed as a finite state machine: `menu` → `playing` → `game over` | `victory` → `restart`.
- **Event-driven input handling** — Keyboard and touch events translated into game input events consumed by the game loop.

## 4. Main Technical Boundaries

| Boundary | Description |
|----------|-------------|
| **UI layer vs Game layer** | React components handle page layout and canvas container; Canvas API handles all in-game rendering. |
| **Input layer vs Game logic layer** | Keyboard/touch event handlers translate raw DOM events into game input events; game logic consumes these events without direct DOM coupling. |
| **Rendering layer vs State layer** | Canvas renderers read game state and produce visual output; they do not mutate state. State mutations occur exclusively in the game logic layer. |

## 5. Key Components

| Component | Responsibility |
|-----------|---------------|
| **GameLoop** | `requestAnimationFrame` driver; orchestrates update → render cycle at consistent frame rate. |
| **GameState** | State machine managing game states: `menu`, `playing`, `gameover`, `victory`. Transitions driven by events. |
| **InputHandler** | Captures keyboard (arrow keys, space) and touch (swipe, tap, touch zones) events; emits game input events. |
| **CannonRenderer** | Renders the player cannon at the bottom of the canvas. |
| **AlienWaveRenderer** | Renders the 5×11 alien grid; handles wave movement (left/right/drop) and individual alien positions. |
| **ProjectileRenderer** | Renders player missiles (upward) and alien fire (downward). |
| **ShieldRenderer** | Renders 4 destructible shields with progressive visual degradation (0–10 health states). |
| **HUDRenderer** | Renders score (top-left), best score (top-right), menu screen, game over screen, and victory screen on canvas. |
| **CollisionDetector** | Detects collisions between projectiles and targets (aliens, cannon, shields); emits hit events. |
| **ScoreManager** | Manages current score, increments on alien destruction, updates best score. |
| **StorageManager** | Persists and loads best score from localStorage. |

## 6. Key Interfaces

| Source → Target | Data/Events | Description |
|-----------------|-------------|-------------|
| **InputHandler → GameState** | `move-left`, `move-right`, `fire` | Player input events consumed by game state. |
| **GameState → Renderers** | State snapshot (positions, scores, game state) | Renderers consume state to produce canvas output. |
| **CollisionDetector → GameState** | `alien-hit`, `cannon-hit`, `shield-hit` | Hit events triggering state transitions and score updates. |
| **ScoreManager → StorageManager** | `save(bestScore)`, `load()` | Persist and retrieve best score from localStorage. |

## 7. Data Architecture

- **Game state** — Held in React state/refs; updated by the game loop.
- **Alien positions** — Array of coordinate objects `{x, y, alive}` for each of the 55 aliens.
- **Projectiles** — Array of `{x, y, vx, vy, direction}` objects for active missiles and alien fire.
- **Shield health** — Integer counters (0–10) for each of the 4 shields; 0 = destroyed.
- **Score** — Integer, incremented per alien destroyed.
- **Best score** — Integer, persisted in localStorage under a namespaced key.
- **Reload delay** — Configurable integer (0–5000ms), controls minimum time between player fire events.

## 8. Security Architecture

- **No server-side** — Entirely client-side application; no backend, no API calls.
- **No authentication** — Single-player game with no user accounts.
- **localStorage sandboxed** — Best score stored in browser localStorage, scoped to the application origin.
- **No external API calls** — No network requests; no third-party data dependencies.

## 9. Deployment Strategy

Static build output from Vite deployed to GitHub Pages. The build produces a self-contained `dist/` directory served as static assets.

## 10. Observability Strategy

- **Console logging** — Development-only logging for debugging game loop, collisions, and state transitions.
- **No production telemetry** — No analytics, no crash reporting, no production logging.

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

## 13. Technical Constraints

- No external game frameworks (no Phaser, no Pixi.js).
- All rendering via Canvas API `ctx` — no HTML overlays for game elements.
- Responsive canvas with flex-grow pattern for content area filling.
- Mobile touch zones: fire zone (top 80%), movement zone (bottom 20%).
- Reload delay configurable: 0–5000ms (default 0ms).
- Wave width ≈ 70% of canvas width on all screen sizes.
- Single sprite type for all aliens (5×11 grid).
- 4 shields with progressive degradation, destroyed at 10 impacts.
- Single life — cannon hit triggers game over.

## 14. Open Questions

None.
