# Slice 2 — Player Input & Cannon

## Goal

Implement input handling (desktop + mobile) and player cannon rendering, movement, and projectile firing logic. This slice covers the complete lifecycle of player interaction from keyboard/touch input through projectile creation.

## Related Epics

[Epic 0 — MVP Complete Playable Space Invaders Game](epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Game Start](us-001-game-start.md)

[US-003 — Player Controls](us-003-player-controls.md)

## Impacted Components

- **Input Handler** (`useInputHandler`): Normalize desktop (keyboard) and mobile (touch) input
- **Player Entity** (`Player.ts`): Cannon position, velocity, lives, invincibility state
- **Renderer** (`useRenderer`): Draw cannon with invincibility blinking animation
- **Game Loop** (`SpaceInvaders.tsx` / `useGameLoop`): Apply input to player each frame, manage projectile firing state
- **Projectile System** (`Projectile.ts`): Create and track active projectiles from player cannon

## Interfaces

### Input Handler (`useInputHandler`)

```typescript
interface InputState {
  moveLeft: boolean;
  moveRight: boolean;
  fire: boolean;
}

interface InputHandler {
  getInput(): InputState;
  destroy(): void;
}
```

**Desktop Implementation:**
- KeyboardEvent listeners for `keydown` and `keyup`
- Left Arrow = `moveLeft`; Right Arrow = `moveRight`; Spacebar = `fire`

**Mobile Implementation:**
- TouchEvent listeners on canvas
- Swipe detection (left swipe = `moveLeft`, right swipe = `moveRight`)
- On-screen fire button = `fire`

### Player Entity (`Player.ts`)

```typescript
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
  invincibilityTimer: number; // 0 = none, >0 = active
  hasActiveProjectile: boolean;
  lives: number;
}
```

### Projectile Creation

```typescript
interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  owner: 'player' | 'enemy';
  active: boolean;
}
```

## Data Changes

- **Player State:** Position (x, y), velocity, invincibility timer, active projectile flag, lives count
- **Projectile Array:** Add new projectile when fire action triggered and no active projectile exists
- **Input State:** Maintain temporary input state for each frame (moveLeft, moveRight, fire)

## Sequence Flow

```
1. Input Phase
   ├─ Desktop: Poll keyboard state (Left/Right arrows, Spacebar)
   ├─ Mobile: Detect swipe direction + fire button tap
   └─ Output: InputState { moveLeft, moveRight, fire }

2. Player Update Phase
   ├─ Apply velocity: player.x += player.velocity * inputState.moveLeft/Right
   ├─ Clamp position: player.x = clamp(player.x, 0, canvasWidth - player.width)
   ├─ Manage invincibility: invincibilityTimer -= deltaTime
   └─ Update hasActiveProjectile flag

3. Projectile Firing Phase
   ├─ If inputState.fire AND !player.hasActiveProjectile:
   │  ├─ Create new Projectile at (player.x + player.width/2, player.y)
   │  ├─ Set velocity (vx=0, vy=-projectileSpeed)
   │  ├─ Set owner='player'
   │  ├─ Add to playerProjectiles array
   │  └─ Set hasActiveProjectile=true
   └─ If active projectile exits screen:
      └─ Set hasActiveProjectile=false

4. Render Phase
   ├─ Draw player cannon at (player.x, player.y)
   ├─ If invincibilityTimer > 0: Apply blinking (toggle visible/hidden ~100ms intervals)
   └─ Draw active player projectile if exists
```

## Observability Impact

- **Frame Rate:** Input polling and player movement must complete within 16 ms frame budget
- **Input Latency:** Measure time from key press to visible cannon movement (target <50 ms)
- **Projectile Lifecycle:** Log projectile creation and destruction in dev mode (collision, exit screen)
- **Invincibility Duration:** Verify 2-second invincibility period matches spec after respawn
