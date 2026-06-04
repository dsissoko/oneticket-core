# 2D Arcade Patterns Implementation Guide

This document describes the reusable implementation patterns for Space Invaders-style 2D arcade games: enemy formations, projectiles, shooting mechanics, lives management, wave progression, scoring systems, and game state management.

## Game States

The game follows a finite state machine with four main states:

```ts
type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';
```

### State Transitions

- **menu → playing**: Player initiates start action (spacebar or button click)
- **playing → paused**: Player presses Escape (optional feature)
- **playing → gameover**: Player lives reach 0 OR enemies reach bottom boundary
- **playing → victory**: All enemies destroyed
- **gameover | victory → menu**: Player selects restart

Each state governs what inputs are processed, which animations play, and whether the game loop updates physics.

---

## Player System

### Player Data Structure

```ts
interface Player {
  x: number;              // horizontal position (px)
  y: number;              // vertical position (px)
  width: number;
  height: number;
  speed: number;          // movement speed (px/s)
  lives: number;          // remaining lives (starts at 3-5)
  invincible: boolean;    // temporary invincibility after hit
  invincibleTimer: number; // countdown to end invincibility (ms)
}
```

### Movement & Boundaries

- Constrain horizontal movement: `x = clamp(x, 0, canvas.width - width)`
- Accept left/right keyboard input: `ArrowLeft`, `ArrowRight`, or `A`, `D`
- Update position each frame: `x += direction * speed * deltaTime`

### Invincibility & Respawn

After the player is hit:
1. Set `invincible = true`
2. Start `invincibleTimer = 2000` (ms)
3. During invincibility, flash sprite: toggle visibility every 100ms
4. Decrement timer each frame: `invincibleTimer -= deltaTime`
5. When timer ≤ 0, set `invincible = false`
6. Respawn player at center-bottom of canvas: `x = canvas.width / 2 - width / 2`

---

## Enemy Formation (Space Invaders Pattern)

### Formation Structure

```ts
interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;         // false when destroyed
  row: number;            // 0 = top (highest value)
  col: number;            // column position in formation
  points: number;         // points awarded on kill (10-30)
}

interface Formation {
  enemies: Enemy[];       // typically 5 rows × 10 columns = 50 enemies
  dx: number;             // horizontal direction: +1 (right) or -1 (left)
  speed: number;          // px/s — increases as enemies die
  dropDistance: number;   // pixels to drop when direction changes (typically 20-30)
  shootInterval: number;  // ms between enemy shots (decreases each wave)
  shootTimer: number;     // countdown to next shot
}
```

### Points by Row

Higher rows have more points (classic arcade design):
- Row 0 (top): 30 points
- Row 1: 20 points
- Row 2: 10 points

### Formation Movement Algorithm

Each frame:

1. **Horizontal movement**: Move all alive enemies by `dx * speed * deltaTime`

2. **Boundary detection**: If any alive enemy reaches the left or right edge:
   ```ts
   if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
     dx *= -1;  // flip direction
     // Drop formation downward
     formation.enemies.forEach(e => e.y += dropDistance);
   }
   ```

3. **Dynamic speed scaling**: As enemies are destroyed, remaining enemies move faster:
   ```ts
   const aliveCount = formation.enemies.filter(e => e.alive).length;
   const totalCount = formation.enemies.length;
   const speedMultiplier = 1 + (totalCount - aliveCount) / totalCount;
   speed = baseSpeed * speedMultiplier;
   ```

This creates tension — the fewer enemies remain, the more aggressive they become.

### Enemy Shooting

- Maintain `shootTimer` countdown (initialized to `shootInterval`)
- Each frame: `shootTimer -= deltaTime`
- When `shootTimer <= 0`:
  - Pick a random alive enemy
  - Spawn a projectile from that enemy's center
  - Reset timer: `shootTimer = shootInterval`
  - Decrease interval each wave for difficulty progression

---

## Projectiles & Object Pool

### Projectile Interface

```ts
interface Projectile {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;             // velocity: negative = up (player), positive = down (enemy)
  active: boolean;        // in-use flag
}
```

### Object Pool Pattern

Pre-allocate a fixed pool of projectiles to avoid GC overhead:

```ts
const POOL_SIZE = 20;
const projectilePool: Projectile[] = Array.from({ length: POOL_SIZE }, () => ({
  x: 0,
  y: 0,
  width: 5,
  height: 10,
  dy: 0,
  active: false,
}));

function spawnProjectile(x: number, y: number, dy: number) {
  const projectile = projectilePool.find(p => !p.active);
  if (projectile) {
    projectile.x = x;
    projectile.y = y;
    projectile.dy = dy;
    projectile.active = true;
  }
  // If no inactive projectiles available, skip (max 20 active at once)
}
```

### Update Loop

Each frame, for each active projectile:
```ts
projectile.y += projectile.dy * deltaTime;

// Deactivate if off-screen
if (projectile.y < -projectile.height || projectile.y > canvas.height) {
  projectile.active = false;
}
```

### Player Shooting Constraint

Classic arcade games limit player bullets to 1-2 active at a time:
```ts
const activePlayerBullets = projectilePool.filter(p => p.active && p.dy < 0).length;
if (activePlayerBullets < MAX_PLAYER_BULLETS && spacebarPressed) {
  spawnProjectile(player.x + player.width / 2, player.y, -bulletSpeed);
}
```

---

## Collision Detection & Resolution

Process collisions in this order each frame:

### 1. Player Bullets vs Enemies
```ts
for (const playerBullet of playerBullets) {
  for (const enemy of enemies) {
    if (enemy.alive && collision(playerBullet, enemy)) {
      playerBullet.active = false;
      enemy.alive = false;
      score += enemy.points;
      combo++;
    }
  }
}
```

### 2. Enemy Bullets vs Player
```ts
for (const enemyBullet of enemyBullets) {
  if (collision(enemyBullet, player) && !player.invincible) {
    enemyBullet.active = false;
    player.lives--;
    player.invincible = true;
    player.invincibleTimer = 2000;
    combo = 0;  // reset on hit
  }
}
```

### 3. Enemies Reaching Bottom
```ts
for (const enemy of enemies) {
  if (enemy.alive && enemy.y + enemy.height >= canvas.height) {
    gameState = 'gameover';
  }
}
```

### Collision Function
```ts
function collision(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}
```

---

## Scoring System

### Base Points

```ts
const POINTS = {
  row0: 30,   // top row
  row1: 20,
  row2: 10,
  bonus: 100, // mystery ship or special targets
};
```

### Combo Multiplier (Optional)

For more advanced games, implement a combo system:

```ts
let combo = 0;  // multiplier: 0 = ×1, 1 = ×1.1, 2 = ×1.2, etc.

// On enemy kill:
combo++;
score += basePoints * (1 + combo * 0.1);

// On player hit:
combo = 0;
```

---

## Wave Progression

### Wave Scaling

When all alive enemies are destroyed:

```ts
function startNextWave() {
  wave++;
  
  // Increase difficulty
  formation.speed *= 1.2;          // formation moves 20% faster
  formation.shootInterval *= 0.85; // enemies shoot 15% more frequently
  
  // Reset formation
  resetFormation();
  
  // Optional: reduce player invincibility duration
  // invincibilityDuration *= 0.95;
}
```

### Victory Condition

```ts
const allEnemiesDead = formation.enemies.every(e => !e.alive);
if (allEnemiesDead && gameState === 'playing') {
  startNextWave();
}
```

---

## Game Over Conditions

The game ends with a game over when:

1. **Player loses all lives**: `player.lives <= 0`
2. **Enemy formation reaches bottom**: Any alive enemy's `y + height >= canvas.height`

Upon game over:
- Set `gameState = 'gameover'`
- Display final score
- Show "Game Over" message with restart prompt
- Transition back to menu on restart action

---

## Victory Condition

Victory occurs when:
- All enemies destroyed AND
- No more waves to progress (optional: set a wave limit, or infinite waves)

Upon victory:
- Set `gameState = 'victory'`
- Display final score
- Show "Victory" message with restart prompt
- Transition back to menu on restart action

---

## HUD (Heads-Up Display)

Render game information as **React components above the canvas**, not directly on canvas:

```tsx
<div className="hud">
  <div className="hud-item">Score: {score}</div>
  <div className="hud-item">Lives: {'♥'.repeat(player.lives)}</div>
  <div className="hud-item">Wave: {wave}</div>
</div>
```

Or with combo display:
```tsx
{combo > 0 && <div className="combo">x{(1 + combo * 0.1).toFixed(1)}</div>}
```

Style with fixed positioning so it doesn't interfere with canvas interaction.

---

## Summary: Key Principles

| Principle | Implementation |
|-----------|---|
| **Formation Tension** | Increase speed as enemies die |
| **Difficulty Progression** | Increase speed & shooting frequency each wave |
| **Resource Management** | Use object pool for projectiles (pre-allocated) |
| **Collision Priority** | Player bullets → enemies → enemy bullets → shields |
| **Player Feedback** | Invincibility flash, combo multiplier, score updates |
| **State Clarity** | Finite state machine: menu/playing/gameover/victory |
| **Classic Constraints** | Limit player bullets, boundary drops for formation |

These patterns scale to any grid-based arcade game (Galaga, Breakout, Pac-Man style) with appropriate modifications.
