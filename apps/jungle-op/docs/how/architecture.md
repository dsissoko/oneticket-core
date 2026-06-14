---
title: 'Architecture — Opération Jungle'
---

# Architecture — Opération Jungle

## 1. Architecture Principles

- **Single-page application** — the entire game runs client-side in the browser with no backend dependency.
- **Game loop via `requestAnimationFrame`** — smooth 60fps rendering driven by the browser's native animation frame scheduler.
- **Separation of concerns** — UI screens (StartScreen, GameScreen, EndScreen) are distinct React components; game logic (state, collision, scoring) is isolated from rendering.
- **Responsive by design** — the same game adapts to desktop (keyboard) and mobile (touch) inputs without code duplication.
- **Deterministic game state** — all game state is held in React state (`useState`/`useReducer`), making it easy to serialize, debug, and replay.
- **No external dependencies beyond the stack** — React + Vite + TypeScript + Primer UI only. No game engine (Phaser, PixiJS) for V1.

## 2. System Overview

Opération Jungle is a browser-based 2D arcade game. The player rescues animals from fire jets shot by a red ball positioned at the top-center of the screen. Animals traverse a jungle terrain occupying the bottom 20% of the viewport. The game is a single-page React application with no server-side component.

```
┌─────────────────────────────────────────────┐
│                 Red Ball                     │  ← Top-center, enemy
│              (auto-shooter)                  │
│                                              │
│         Fire Jets (sprinkler pattern)        │  ← Non-rectilinear trajectories
│                                              │
│                                              │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │        Jungle Terrain (bottom 20%)     │  │  ← Animal movement zone
│  │   [Animal → → →]                       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Score: 42                      Speed: 1.0x  │
└─────────────────────────────────────────────┘
```

## 3. Architectural Style

**Component-based SPA with game loop pattern.**

The application follows the React component architecture from the AppShell template, augmented with a game loop:

- **React components** manage the UI lifecycle (StartScreen → GameScreen → EndScreen).
- **A custom `useGameLoop` hook** wraps `requestAnimationFrame`, advancing game state each frame.
- **State is managed via `useReducer`** for the core game state (animals, fire jets, score, HP), providing a single source of truth and predictable state transitions.
- **Input handling** is abstracted into a `useInput` hook that normalizes keyboard and touch events into a unified directional command (`left` / `right` / `none`).

## 4. Main Technical Boundaries

| Boundary | Description |
|---|---|
| **UI Layer** | React components (StartScreen, GameScreen, EndScreen, ScoreDisplay) — responsible for rendering and user interaction. |
| **Game Logic Layer** | Pure functions and reducers (`gameReducer`, `collisionDetection`, `trajectoryCalculation`) — no DOM access, fully testable. |
| **Input Layer** | `useInput` hook — translates DOM events (keydown, touchmove) into game commands. |
| **Render Layer** | HTML5 Canvas or DOM-based rendering within GameScreen — draws animals, fire jets, red ball, and terrain each frame. |

```
┌──────────────────────────────────────────────┐
│                  UI Layer                     │
│  StartScreen │ GameScreen │ EndScreen         │
├──────────────────────────────────────────────┤
│               Game Loop Hook                  │
│         useGameLoop (rAF driver)              │
├──────────────┬───────────────┬────────────────┤
│  Input Hook  │  Game Logic   │  Render Layer  │
│  useInput    │  gameReducer  │  Canvas / DOM  │
│  (kbd/touch) │  collision    │  per-frame     │
└──────────────┴───────────────┴────────────────┘
```

## 5. Key Components

| Component | Responsibility |
|---|---|
| **StartScreen** | Displays game title, speed slider (-2x to +2x), control instructions, and Start button. |
| **GameScreen** | Main gameplay container. Hosts the game loop, renders RedBall, FireJet, Animal, and JungleTerrain. |
| **RedBall** | Enemy entity at top-center. Fires fire jets at intervals determined by the speed multiplier. |
| **FireJet** | Projectile entity with non-rectilinear (sprinkler) trajectory. Travels from RedBall to jungle terrain. |
| **Animal** | Player-controlled entity. Moves left-to-right on the jungle terrain. Has HP, position, and type (Lion=20, Mouse=5, Girafe=15, Elephant=25). |
| **JungleTerrain** | Visual and logical play area occupying the bottom 20% of the viewport. Defines the collision zone for fire jets. |
| **ScoreDisplay** | Real-time score overlay showing current score and remaining animals. |
| **EndScreen** | Displays final score, animals saved vs. lost, and a Restart button. |
| **useGameLoop** | Custom hook that drives `requestAnimationFrame`, calls `gameReducer` each frame with delta time. |
| **useInput** | Custom hook that listens for ArrowLeft/ArrowRight (keyboard) and touchmove (mobile) events. |
| **gameReducer** | Pure reducer function handling state transitions: move animal, spawn fire jet, detect collision, update score, check game end. |

## 6. Key Interfaces

### Game State Shape

```typescript
interface GameState {
  phase: 'start' | 'playing' | 'ended';
  animals: Animal[];
  fireJets: FireJet[];
  score: number;
  currentAnimalIndex: number;
  speedMultiplier: number; // 0.5x to 2.5x (slider -2 to +2)
  lastFireTime: number;
}

interface Animal {
  type: 'lion' | 'mouse' | 'girafe' | 'elephant';
  hp: number;
  maxHp: number;
  x: number; // position on jungle terrain (0 = left edge)
  y: number; // fixed: bottom 20% zone
}

interface FireJet {
  x: number;
  y: number;
  vx: number; // horizontal velocity (sprinkler spread)
  vy: number; // vertical velocity (downward)
  active: boolean;
}
```

### Reducer Actions

```typescript
type GameAction =
  | { type: 'START_GAME'; speedMultiplier: number }
  | { type: 'MOVE_ANIMAL'; direction: 'left' | 'right' }
  | { type: 'TICK'; deltaTime: number }
  | { type: 'SPAWN_FIRE_JET'; pattern: FirePattern }
  | { type: 'ANIMAL_HIT'; animalIndex: number }
  | { type: 'ANIMAL_SAVED'; hp: number }
  | { type: 'RESTART' };
```

### Input Interface

```typescript
interface InputState {
  direction: 'left' | 'right' | 'none';
}
```

## 7. Data Architecture

- **No persistent storage** — all state is ephemeral and held in React memory during the game session.
- **Game state** is a single `GameState` object managed by `useReducer`. Each frame, the game loop dispatches a `TICK` action; input events dispatch `MOVE_ANIMAL`.
- **Animal definitions** are static constants (type → maxHp mapping) loaded at build time.
- **Fire jet trajectories** are computed procedurally each tick using a sprinkler pattern algorithm: jets spawn from the RedBall position with randomized horizontal velocity spread and constant downward velocity, creating a non-rectilinear arc.
- **Score** is derived from remaining HP when an animal reaches the right edge (BR-005).

### Sprinkler Pattern Algorithm

Fire jets follow a parabolic trajectory influenced by:
1. **Spawn angle** — randomized within a cone (e.g., ±30° from vertical).
2. **Horizontal spread** — each jet gets a unique `vx` value, creating a fan pattern.
3. **Gravity simulation** — `vy` increases slightly each frame for a natural arc feel.

```
Red Ball (top-center)
    │
   ╱│╲    ← Sprinkler cone
  ╱ │ ╲
 ●  ●  ●  ← Fire jets landing on jungle terrain
```

## 8. Security Architecture

- **No backend, no network calls** — the game is entirely client-side, eliminating server-side attack vectors.
- **No user data collection** — no analytics, no tracking, no personal data processed.
- **XSS prevention** — all rendering is done through React's JSX (auto-escaped) or Canvas API (no HTML injection possible).
- **Content Security Policy** — the Vite dev server and production build should include a CSP header restricting script sources to `self`.

## 9. Deployment Strategy

- **Static site** — the game is built as a static SPA via `vite build`, producing an `index.html` and bundled JS/CSS assets.
- **Hosting** — deployable to any static hosting provider (GitHub Pages, Vercel, Netlify, S3 + CloudFront).
- **No server-side rendering** — the game requires a browser with JavaScript enabled; SSR is not applicable.
- **CDN-friendly** — all assets are cacheable with long TTLs; the `index.html` is the only file that should not be aggressively cached.

## 10. Observability Strategy

- **Console logging** — development-only logging for game events (animal saved, animal lost, game end).
- **Error Boundary** — a React Error Boundary at the root catches rendering errors and displays a fallback UI.
- **Performance monitoring** — the game loop tracks frame delta time; significant deviations from 16.67ms (60fps) can be logged for debugging.
- **No analytics in V1** — per product spec, no telemetry or tracking is included.

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)
- [Deployment](../c4/deployment.md)

## 12. Related Sprints

See [how/sprints/](../sprints/) for all implementation sprints derived from this architecture.

## 13. Technical Constraints

| Constraint | Detail |
|---|---|
| **Browser support** | Modern browsers (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+). |
| **Performance** | Game must load within 3 seconds and maintain 60fps on mid-range devices. |
| **Input latency** | Keyboard and touch responses must be under 100ms (success criterion). |
| **Viewport** | Responsive — must work on viewports from 320px (mobile) to 1920px (desktop). |
| **No external game engine** | V1 uses raw React + Canvas/DOM; no Phaser, PixiJS, or similar libraries. |
| **TypeScript strict mode** | All code must compile with `strict: true` in `tsconfig.json`. |
| **Bundle size** | Initial JS bundle should not exceed 200KB gzipped for fast loading. |

## 14. Open Questions

| Question | Status |
|---|---|
| Total number of animals per session? | Open — product spec does not define a fixed count. Recommend a fixed sequence of 10-15 animals for V1. |
| Animal spawn order (random, fixed, difficulty-based)? | Open — recommend a fixed sequence for reproducibility, with randomization as a V2 enhancement. |
| Visual HP indicator on animals? | Open — a simple HP bar or numeric overlay above each animal would improve player feedback. |
| Time limit per animal? | Open — recommend a constant left-to-right movement speed; the player must keep up with the pace. |
| Fire jet pattern evolution over time? | Open — recommend fixed sprinkler pattern for V1, with progressive difficulty (wider spread, faster jets) as a V2 feature. |
| End screen detail level? | Open — recommend showing total score, animals saved count, and animals lost count for V1. |
