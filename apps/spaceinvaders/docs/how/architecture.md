---
title: 'Architecture — SpaceInvaders MVP'
---

# Architecture — SpaceInvaders MVP

## 1. Architecture Principles

- Keep gameplay deterministic where specified and configurable where balancing is expected.
- Separate game domain rules from rendering/input adapters.
- Ensure parity between desktop and mobile behavior for core game rules.
- Preserve AppShell integration constraints (full-area responsive canvas pattern).

## 2. System Overview

SpaceInvaders runs as a browser game module inside the existing AppShell frontend. The runtime manages a game loop, state transitions, collision handling, input mapping (keyboard/touch), HUD rendering, and localStorage persistence for best score.

## 3. Architectural Style

- Client-side single-page game module.
- State-driven game loop with explicit phases: running, victory, game over.
- Layered separation:
  - Domain rules (entities, collisions, state transitions).
  - Application orchestration (tick/update cycle).
  - UI and platform adapters (canvas rendering, keyboard/touch, localStorage).

## 4. Main Technical Boundaries

- **Game Domain Boundary**: alien grid, cannon, missiles, shields, scoring, win/lose conditions.
- **Input Boundary**: keyboard mapping (desktop) and touch zones/drag mapping (mobile).
- **Rendering Boundary**: canvas sizing, sprite/entity drawing, HUD overlay and end screens.
- **Persistence Boundary**: best score read/write in localStorage.

## 5. Key Components

- `GameScreen`: layout container enforcing Breakout-style full-height canvas wrapping.
- `GameCanvas`: responsive canvas surface bound to parent dimensions.
- `GameEngine`: update loop, phase transitions, timing and entity updates.
- `CollisionSystem`: interactions among missiles, aliens, shields, cannon, and bounds.
- `InputController`: keyboard and touch gesture translation into cannon/fire intents.
- `ScoreService`: in-memory score update and localStorage best-score persistence.
- `EndStateView`: victory/game-over screen with final score and restart action.

## 6. Key Interfaces

- `InputController -> GameEngine`: move and fire intents.
- `GameEngine -> CollisionSystem`: entity world snapshot and collision resolution.
- `GameEngine -> ScoreService`: score events and best score updates.
- `GameEngine -> Renderer`: immutable frame state to draw.
- `EndStateView -> GameEngine`: restart command.

## 7. Data Architecture

- In-memory runtime state:
  - Alien wave matrix (5×11).
  - Cannon position and reload timer.
  - Missile collections (player and alien).
  - Shield durability and degradation state (4 shields, 10 impacts each).
  - Score and game phase.
- Persistent state:
  - `bestScore` in localStorage.

## 8. Security Architecture

- No server-side data exchange in MVP scope.
- localStorage usage is limited to non-sensitive numeric best score.
- Input handling restricted to gameplay interactions only.

## 9. Deployment Strategy

- Bundle and deploy as part of the existing frontend app.
- No additional infrastructure services required for MVP.

## 10. Observability Strategy

- Minimal runtime error visibility through existing frontend logging.
- Optional debug metrics (FPS/tick diagnostics) remain non-blocking and non-user-facing.

## 11. Related C4 Views

- [System Context](c4/system-context.md)
- [Containers](c4/containers.md)

## 12. Related Implementation Slices

To be produced from user stories once implementation slicing is requested.

## 13. Technical Constraints

- Maintain fixed alien grid size (5×11) on all screen sizes.
- Wave width remains approximately 70% of screen width.
- `GameScreen` must use `<div className="flex-grow flex flex-col overflow-hidden">` around `GameCanvas`.
- Canvas must use responsive CSS (`width: 100%`, `height: 100%`) with dynamic logical sizing from parent dimensions.
- Mobile interaction must remain gesture-only with fixed percentage zones (80% fire / 20% movement).

## 14. Open Questions

- Target frame/tick rate and update strategy details are not yet specified.
- Concrete balancing constants (movement speed, enemy fire rate, score per alien) remain to be defined.
