# Slice 3 — Player Control & Firing

## Goal

Implement complete player control system with dual input support (keyboard + touch), movement with boundary constraints, single bullet firing with 1-max constraint, and invincibility frame tracking with visual feedback. This slice delivers a fully playable player cannon that responds to desktop and mobile input and fires bullets at enemies.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-003 — Player Controls](us-003-player-controls.md)
[US-005 — Enemy Bullets & Damage](us-005-enemy-bullets-damage.md)
[US-006 — Player Bullets & Scoring](us-006-player-bullets-scoring.md)

## Impacted Components

### Core Components
- **Player Entity**: Position, bounds, sprite, invincibility tracking
- **InputSystem (Extended)**: Full keyboard handler (arrow keys, spacebar) + touch handler (swipe detection, mobile fire button)
- **PlayerBullet Entity**: Position, velocity, collision box, lifecycle
- **RenderingSystem (Extended)**: Player cannon rendering with invincibility visual feedback
- **Physics/Collision (Preparation)**: Collision box definitions for bullets and player

### Data Structures
- **Player**: x, y, width, height, invincible (boolean), invincibilityTimer (number), bulletInFlight (PlayerBullet | null)
- **PlayerBullet**: x, y, vx, vy, width, height, type: 'player'
- **PlayerInputState**: left (boolean), right (boolean), fire (boolean)
- **TouchState**: lastX (number), swipeThreshold (number)

## Interfaces

### Player Class
```typescript
class Player {
  x: number
  y: number
  width: number
  height: number
  invincible: boolean
  invincibilityTimer: number
  bulletInFlight: PlayerBullet | null
  maxSpeed: number
  
  constructor(x: number, y: number)
  update(deltaTime: number, inputState: PlayerInputState): void
  move(direction: -1 | 0 | 1, deltaTime: number): void
  fire(): PlayerBullet | null
  takeDamage(): void
  updateInvincibility(deltaTime: number): void
  getBoundingBox(): BoundingBox
  render(ctx: CanvasRenderingContext2D): void
}
```

### PlayerBullet Class
```typescript
class PlayerBullet {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  type: 'player'
  
  constructor(x: number, y: number)
  update(deltaTime: number): void
  isOffScreen(canvasHeight: number): boolean
  getBoundingBox(): BoundingBox
  render(ctx: CanvasRenderingContext2D): void
}
```

### InputSystem (Extended)
```typescript
class InputSystem {
  private playerInputState: PlayerInputState
  private touchState: TouchState
  
  onKeyDown(event: KeyboardEvent): void
  onKeyUp(event: KeyboardEvent): void
  onTouchStart(event: TouchEvent): void
  onTouchMove(event: TouchEvent): void
  onTouchEnd(event: TouchEvent): void
  getInputState(): PlayerInputState
  detectSwipe(startX: number, endX: number): -1 | 0 | 1
}
```

### BoundingBox (for collision prep)
```typescript
interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}
```

## Data Changes

### Player Entity State
```typescript
interface Player {
  x: number              // Horizontal position (0 to canvas.width - player.width)
  y: number              // Vertical position (fixed near canvas.height)
  width: number          // Player sprite width (e.g., 40 pixels)
  height: number         // Player sprite height (e.g., 30 pixels)
  invincible: boolean    // true during invincibility frames after hit
  invincibilityTimer: number  // Countdown timer (2000 ms total)
  bulletInFlight: PlayerBullet | null  // Currently firing bullet or null
  maxSpeed: number       // Horizontal movement speed (e.g., 200 px/sec)
}
```

### PlayerBullet Entity State
```typescript
interface PlayerBullet {
  x: number              // Horizontal position (aligned with player.x + width/2)
  y: number              // Vertical position (starts at player.y)
  vx: number             // Horizontal velocity (0 for straight fire)
  vy: number             // Vertical velocity (negative, moving upward)
  width: number          // Bullet width (e.g., 4 pixels)
  height: number         // Bullet height (e.g., 12 pixels)
  type: 'player'         // Bullet classification
}
```

### Player Input State
```typescript
interface PlayerInputState {
  left: boolean          // true if left arrow pressed or swiping left
  right: boolean         // true if right arrow pressed or swiping right
  fire: boolean          // true if spacebar pressed or fire button tapped
}
```

### Touch State
```typescript
interface TouchState {
  startX: number         // Touch start position x
  lastX: number          // Last touch position x
  swipeThreshold: number // Minimum distance to register as swipe (e.g., 30 pixels)
}
```

## Sequence Flow

### Initialization (on Playing state entry)
1. Player entity created at bottom-center: x = canvas.width / 2, y = canvas.height - 50
2. Player width = 40, height = 30 (or sprite dimensions)
3. Player invincible = false, invincibilityTimer = 0
4. Player bulletInFlight = null
5. InputSystem attached with keyboard and touch listeners
6. Player maxSpeed = 200 (pixels per second)

### Game Loop: Each Frame (Playing State)
```
requestAnimationFrame
  ├─ InputSystem reads keyboard/touch
  │   ├─ onKeyDown (Arrow Left/Right, Spacebar)
  │   ├─ onKeyUp (Arrow Left/Right, Spacebar)
  │   ├─ onTouchStart/Move/End (swipe detection)
  │   └─ getInputState() returns { left, right, fire }
  │
  ├─ Player.update(deltaTime, inputState)
  │   ├─ Determine direction: -1 (left), 0 (none), 1 (right)
  │   ├─ move(direction, deltaTime)
  │   │   ├─ x += direction * maxSpeed * deltaTime
  │   │   ├─ Clamp x: [0, canvas.width - player.width]
  │   ├─ if inputState.fire && bulletInFlight === null
  │   │   └─ fire() → creates PlayerBullet at (x + width/2 - bullet.width/2, y)
  │   │       with vy = -300 (upward)
  │   ├─ if bulletInFlight !== null
  │   │   ├─ bulletInFlight.update(deltaTime)
  │   │   ├─ if bulletInFlight.isOffScreen()
  │   │   │   └─ bulletInFlight = null (ready to fire again)
  │   └─ updateInvincibility(deltaTime)
  │       └─ if invincibilityTimer > 0: invincibilityTimer -= deltaTime
  │
  ├─ RenderingSystem.drawPlayer(player)
  │   ├─ if invincible && (invincibilityTimer / 2000) % 0.2 < 0.1
  │   │   └─ Draw player with reduced opacity (flashing effect)
  │   └─ else
  │       └─ Draw player at full opacity
  │
  ├─ RenderingSystem.drawBullets([playerBullet])
  │   └─ if bulletInFlight !== null
  │       └─ Draw bullet at (x, y)
  │
  └─ Canvas re-renders frame
```

### Keyboard Input Handling
```typescript
// Key Mappings
Key: ArrowLeft   → playerInputState.left = true
Key: ArrowRight  → playerInputState.right = true
Key: Spacebar    → playerInputState.fire = true

// Release
KeyUp: ArrowLeft   → playerInputState.left = false
KeyUp: ArrowRight  → playerInputState.right = false
KeyUp: Spacebar    → playerInputState.fire = false (optional, can be impulse)
```

### Touch/Swipe Handling
```
TouchStart (x, y)
  ├─ touchState.startX = x
  ├─ touchState.lastX = x
  └─ playerInputState.fire = true (fire button tap)

TouchMove (x, y)
  ├─ if (x - touchState.lastX) < -threshold
  │   └─ playerInputState.left = true
  ├─ if (x - touchState.lastX) > threshold
  │   └─ playerInputState.right = true
  └─ touchState.lastX = x

TouchEnd (x, y)
  ├─ playerInputState.left = false
  ├─ playerInputState.right = false
  └─ playerInputState.fire = false
```

### Player Bullet Firing Logic
```
1. Check: if inputState.fire === true && bulletInFlight === null
2. Create PlayerBullet at (player.x + player.width/2 - bullet.width/2, player.y)
3. Set vy = -300 (upward velocity)
4. Store in bulletInFlight
5. Each frame: bulletInFlight.update(deltaTime)
6. Check: if bulletInFlight.y + bulletInFlight.height < 0
7. If off-screen: bulletInFlight = null (ready for next fire)
```

### Player Invincibility & Visual Feedback
```
1. On collision with enemy bullet:
   ├─ takeDamage() called
   ├─ invincible = true
   ├─ invincibilityTimer = 2000 (ms)
   └─ lives -= 1

2. Each frame:
   ├─ updateInvincibility(deltaTime)
   ├─ if invincibilityTimer > 0:
   │   └─ invincibilityTimer -= deltaTime
   └─ if invincibilityTimer <= 0:
       └─ invincible = false

3. During invincibility (visual feedback):
   ├─ Flash opacity: blink every 200 ms
   ├─ Render with opacity = 0.5 during off cycles
   └─ Render with opacity = 1.0 during on cycles
```

### Bullet Movement & Despawn
```
1. PlayerBullet.update(deltaTime):
   ├─ y += vy * deltaTime  (upward motion)
   └─ No horizontal movement (vx = 0)

2. Each frame, check despawn:
   ├─ if (y + height) < 0
   │   └─ Bullet is off-screen, mark for removal
   └─ Player can fire new bullet
```

## Deliverables

### Code Files
1. **src/game/entities/Player.ts**
   - Player class with position, bounds, invincibility tracking
   - move() method with boundary constraints
   - fire() method creating PlayerBullet
   - update() orchestrating input response
   - takeDamage() setting invincibility
   - render() with flash effect during invincibility

2. **src/game/entities/PlayerBullet.ts**
   - PlayerBullet class with position, velocity
   - update() for upward movement
   - isOffScreen() check
   - getBoundingBox() for collision prep
   - render() as small rectangle

3. **src/game/InputSystem.ts** (Extended from Slice 1)
   - Full onKeyDown/onKeyUp implementation for arrows + spacebar
   - Prevent default for spacebar (no page scroll)
   - onTouchStart: record touch position
   - onTouchMove: detect left/right swipe
   - onTouchEnd: reset touch state
   - detectSwipe() helper for left/right classification

4. **src/game/RenderingSystem.ts** (Extended)
   - drawPlayer(player) with invincibility flash
   - drawBullets(playerBullet) rendering upward-moving bullets
   - Opacity control for invincibility visual effect

5. **src/components/GameControls.tsx** (Optional UI)
   - Mobile-specific fire button (overlay on canvas)
   - Swipe detection visual hints (optional)

### Canvas Rendering
- Player cannon: Small triangle or rectangle at bottom-center
- Player bullet: 4×12 pixel rectangle, white color
- Invincibility flash: Player sprite flickers at 5 Hz (200 ms cycle) for 2 seconds

## Success Criteria

✅ **Player renders at bottom-center** — Initial position x = canvas.width/2, y = canvas.height - 50  
✅ **Arrow keys move player with bounds** — Left/Right arrows move ±200 px/sec, clamped to [0, canvas.width - player.width]  
✅ **Spacebar fires bullets** — Spacebar spawns bullet at player position moving upward  
✅ **One bullet at a time** — Only one bullet on screen; new fire blocked until previous bullet exits top  
✅ **Bullet movement** — Bullet moves upward at constant velocity, despawns when off-screen  
✅ **Mobile swipe/buttons work** — Swipe left/right moves player; tap fire button fires bullet (on touch devices)  
✅ **Invincibility frames active** — After collision, player invincible for 2 seconds; no damage during period  
✅ **Invincibility visual feedback** — Player sprite flashes (5 Hz blink) during invincibility period  
✅ **Smooth rendering** — Player and bullets render without flickering at 60 FPS  
✅ **No input conflicts** — Multiple input events (keyboard + touch) don't cause state corruption  

## Observability Impact

### Console Logging (Development)
- Player movement: `console.log('Player moved: x=' + player.x)`
- Bullet fired: `console.log('Bullet fired at y=' + bullet.y)`
- Player hit: `console.log('Player hit! Invincibility: ' + player.invincibilityTimer + ' ms')`
- Bullet despawn: `console.log('Bullet off-screen')`

### React DevTools
- Watch Player entity state in game loop ref
- Verify bulletInFlight is null/non-null correctly

### Canvas Debug Overlay (Optional)
- Player bounding box (outline during dev)
- Bullet bounding box (outline during dev)
- Invincibility timer display (e.g., "Invincible: 1.5s remaining")

## Testing Strategy

### Unit Tests
- **Player.move()**: Verify x clamped to [0, canvas.width - width]
- **Player.fire()**: Verify bullet created only when bulletInFlight === null
- **PlayerBullet.update()**: Verify y decreases (upward movement)
- **PlayerBullet.isOffScreen()**: Verify returns true when y < -height
- **InputSystem.detectSwipe()**: Verify swipe detection for left/right
- **Player.updateInvincibility()**: Verify timer countdown and invincible flag reset

### Integration Tests
- **Keyboard Input**: Press left arrow → player.x decreases; press right arrow → player.x increases
- **Boundary Clamp**: Move to left edge → x = 0; move to right edge → x = canvas.width - player.width
- **Fire Mechanic**: Press spacebar → bulletInFlight created; press again → no new bullet; wait for bullet to exit → can fire again
- **Invincibility**: Simulate takeDamage() → invincible = true, invincibilityTimer = 2000; wait 2s → invincible = false
- **Invincibility Rendering**: Watch for 5 Hz flash during invincibility period
- **Mobile Touch**: Swipe left → player.x decreases; swipe right → player.x increases; tap fire button → bullet created

### Manual Testing
- Load game in browser, start game
- Desktop: Press arrow keys → player moves smoothly with clear boundaries
- Desktop: Press spacebar → bullet appears and moves upward; press spacebar while bullet flying → no new bullet
- Mobile: Swipe left/right → player responds; tap fire button → bullet fires
- Simulate collision (manually set invincible=true) → watch player flash for 2 seconds
- Verify smooth 60 FPS rendering with no stuttering

## Related Slices

- **Slice 1** (Foundation): Provides game loop, canvas, input scaffolding
- **Slice 5** (Collision Detection): Detects bullet-enemy collisions, bullet-shield collisions, bullet-player collisions
- **Slice 4** (Enemy Fire): Handles enemy bullets that collide with player (triggers invincibility)
