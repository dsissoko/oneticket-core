## Goal
Build a classic 2D arcade Space Invaders game as a React+Vite+TypeScript single-page
application, scaffolded from the Breakout template (which is itself based on AppShell)
and deployed on GitHub Pages.

## Game Overview
Space Invaders is a fixed-screen 2D arcade game. The player controls a cannon at the
bottom of the screen and must destroy all aliens before they reach the cannon line.

### Arcade mechanics
- Enemy formation: alien wave — 5 rows × 11 columns, single sprite
- Wave progression: left/right movement, drops one row on boundary hit
- Projectiles: player missiles (upward) and alien missiles (downward, random fire)
- Scoring: each alien destroyed increments the score
- Shields: 4 destructible shields between cannon and alien wave — absorb projectiles
  from both sides, progressive visual degradation, destroyed after 10 impacts
- Player lives: 1 life — cannon hit = game over
- Game states: playing → game over | victory → restart
- Best score persisted across sessions (localStorage)

### Player controls
- Desktop: keyboard (arrow keys to move, space to fire)
- Mobile: touch gestures — swipe to move cannon, tap to fire
- No reload limit — configurable reload delay (default 0ms, max 5,000ms)

### Responsive layout
- Breakout template (AppShell-based) — canvas fills the content area (flex-grow pattern)
- `GameScreen`: `<div className="flex-grow flex flex-col overflow-hidden">` wrapping `<GameCanvas />`
- `GameCanvas` returns `<canvas>` as root element — CSS `style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}`
- Dimensions from `canvas.parentElement.clientWidth/Height`
- Adaptive sizing: alien grid and cannon scale proportionally to viewport
- Wave width ≈ 70% of canvas width on all screen sizes
- Mobile touch zones: fire zone (top 80%), movement zone (bottom 20%)

### HUD
- Current score (top left) and best score (top right) — rendered on canvas
- Game Over and Victory end screens with Restart button — rendered on canvas

## Documentation scope
Produce the full documentation structure for this project:
- Architecture (`architecture.md`) following the C4 model (system context, containers,
  components) — use the `c4` and `architecture` skills
- Vertical slices covering the full MVP delivery — use the `vertical-slice` and
  `slice-for-vite-react-primer` skills
- Doc structure following the standard `what/`, `how/`, `ship/`, `run/` layout —
  use the `doc-structure` skill

## App scaffold
The app will be scaffolded from the Breakout template (`apps/breakout/app/`) — use the
`scaffold-appshell` skill (Breakout is AppShell-based).
Stack: Vite + React + TypeScript + Tailwind + Canvas API — use the
`stack-vite-react-primer` skill.

## Reference
- `apps/breakout/app/` — template for AppShell integration and canvas pattern
- `apps/breakout/app/src/components/GameCanvas.tsx` — canvas reference implementation

## Out of scope
- UFO bonus ship
- Multiple high scores or leaderboard
- HTML overlays — everything rendered via Canvas API (`ctx`)
- External game framework (no Phaser, no Pixi.js)
