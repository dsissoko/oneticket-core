## Goal
Implement the full SpaceInvaders MVP as a 2D arcade game using the Canvas API and
React+Vite+TypeScript stack, following the vertical slices defined in
`apps/spaceinvaders/docs/how/slices/`.

## Specs
See `apps/spaceinvaders/docs/` — all slices.

## Arcade mechanics
- Enemy formation: alien wave — 5 rows × 11 columns, single sprite
- Wave progression: left/right movement, drops one row on boundary hit
- Projectiles: player missiles (upward) and alien missiles (downward, random fire)
- Scoring: each alien destroyed increments the score
- Shields: 4 destructible shields — absorb projectiles from both sides,
  progressive visual degradation, destroyed after 10 impacts
- Game states: playing → game over | victory → restart
- Best score persisted across sessions (localStorage)

## Player controls
- Desktop: keyboard (arrow keys to move, space to fire)
- Mobile: touch gestures — swipe (bottom 20%) to move cannon, tap (top 80%) to fire
- Configurable reload delay (default 0ms, max 5,000ms)

## Responsive layout — Breakout pattern
- AppShell scaffold — canvas fills content area (flex-grow pattern)
- `GameCanvas` returns `<canvas>` as root element (no wrapper div)
- Dimensions read from `canvas.parentElement.clientWidth/Height`
- `engine.resize()` called before `engine.start()` in a single `useEffect`
- Wave width ≈ 70% of canvas width on all screen sizes

## HUD — rendered via Canvas API (`ctx`)
- Current score (top left), best score (top right)
- Game Over and Victory end screens with Restart button — rendered on canvas

## Stack
- Vite + React + TypeScript + Tailwind + Canvas API
- game-engine skill: game loop, collision detection, rendering via `requestAnimationFrame`
- 2d-arcade skill: enemy formations, projectiles, wave progression, game states
- No external game framework (no Phaser, no Pixi.js)
- Reference: `apps/breakout/app/src/components/GameCanvas.tsx`

## Out of scope
- UFO bonus ship
- Multiple high scores or leaderboard
- HTML overlays — everything rendered via Canvas API (`ctx`)
