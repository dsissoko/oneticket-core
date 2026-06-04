# Slice 7 — Mystery Ship & Bonus Encounters

## Goal

Introduce a bonus target—the mystery ship—that traverses the top of the screen at random intervals with variable point values (50, 100, 150, 300). This slice implements the complete end-to-end lifecycle: spawn timing, visual rendering, movement, collision detection integration, and score awarding. Players gain high-value bonus opportunities by intercepting the mystery ship before it exits the screen.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-006 — Collision Detection & Scoring](us-006-collision-detection-scoring.md)

## Impacted Components

### Core Components
- **MysteryShip Entity**: Object holding position, velocity, point value, alive flag, and spawn/despawn lifecycle
- **MysteryShip Spawner**: Logic managing random spawn intervals (10–20 second window) and point value assignment
- **RenderingSystem**: Extended to render mystery ship sprite/geometry to canvas
- **PhysicsSystem (Collision)**: Extended to detect player bullet ↔ mystery ship collisions
- **GameLoopManager**: Update loop integration for mystery ship position and bounds checking
- **Scoring System**: Extended to award bonus points on mystery ship destruction

### Data Structures
- **MysteryShip** (useRef): Holds active mystery ship instance or null
- **MysteryShipSpawner** (useRef): Tracks spawn timer, interval state, and point value pool
- **GameLoopState** (useRef): Extended to include mysteryShip reference

## Interfaces

### MysteryShip Entity
```typescript
interface MysteryShip {
  x: number                    // Horizontal position (starts off-screen left or right)
  y: number                    // Vertical position (top of screen, ~20 pixels from top)
  width: number                // Sprite width (~40–50 pixels)
  height: number               // Sprite height (~20–30 pixels)
  vx: number                   // Horizontal velocity (pixels/ms, constant speed across screen)
  pointValue: number           // 50 | 100 | 150 | 300 (randomly assigned at spawn)
  alive: boolean               // true while on screen, false when destroyed or off-screen
  spawnTime: number            // Timestamp of spawn (for cleanup/bounds checking)
}
```

### MysteryShip Spawner
```typescript
interface MysteryShipSpawner {
  nextSpawnTime: number        // Absolute timestamp for next spawn
  spawnInterval: number        // Random interval (10,000–20,000 ms)
  pointValues: number[]        // Pool: [50, 100, 150, 300]
  update(currentTime: number): MysteryShip | null  // Returns new ship or null
}
```

### Collision Detection Extension
```typescript
interface CollisionResult {
  // ... existing fields ...
  mysteryShipDestroyed: boolean       // true if mystery ship hit
  mysteryShipBonusPoints: number      // 0 or pointValue from ship
}

// PhysicsSystem method signature (existing, extended):
checkCollisions(
  formation: Formation,
  player: Player,
  playerBullets: Bullet[],
  enemyBullets: Bullet[],
  shields: Shield[],
  mysteryShip: MysteryShip | null  // New parameter
): CollisionResults
```

## Data Changes

### Game Loop State (useRef extension)
```typescript
interface GameLoopState {
  // ... existing fields ...
  mysteryShip: MysteryShip | null      // Active ship or null
  mysteryShipSpawner: MysteryShipSpawner
}
```

### React State (no changes)
```typescript
// Score is updated via existing onScoreChange callback
// No new React state required — mystery ship bonus points accumulate in score
```

## Sequence Flow

### Mystery Ship Lifecycle (Spawn to Despawn)

#### 1. Spawner Initialization (Foundation Slice → Slice 7 transition)
```
GameLoopManager.init()
  ├─ Create MysteryShipSpawner
  │   ├─ nextSpawnTime = now + random(10,000–20,000 ms)
  │   ├─ pointValues = [50, 100, 150, 300]
  │   └─ gameLoopRef.current.mysteryShip = null (no ship initially)
  └─ Register spawner in game loop update phase
```

#### 2. Per-Frame Update (during Playing state)
```
gameLoop.update(deltaTime):
  1. Check spawner: if currentTime >= nextSpawnTime:
     a. Generate random direction: directionX = random(-1, 1)
     b. Calculate starting x:
        - If directionX < 0: x = canvasWidth (enter from right)
        - If directionX > 0: x = -mysteryShipWidth (enter from left)
     c. Assign pointValue = random choice from [50, 100, 150, 300]
     d. Create new MysteryShip:
        {
          x: startX,
          y: 20,  // Top of screen
          width: 40,
          height: 20,
          vx: directionX * 100,  // pixels/ms (adjust speed as needed)
          pointValue: pointValue,
          alive: true,
          spawnTime: currentTime
        }
     e. gameLoopRef.current.mysteryShip = newShip
     f. Schedule next spawn: nextSpawnTime = currentTime + random(10,000–20,000 ms)

  2. Update active mystery ship (if alive):
     a. mysteryShip.x += mysteryShip.vx * deltaTime
     b. Check bounds: if x < -width or x > canvasWidth:
        - mysteryShip.alive = false
        - gameLoopRef.current.mysteryShip = null
        - Schedule next spawn (as in 1f)

  3. Collision detection (existing checkCollisions):
     a. Check all playerBullets against mysteryShip.boundingBox
     b. On collision:
        - mysteryShip.alive = false
        - Destroy colliding bullet
        - Add mysteryShip.pointValue to score
        - gameLoopRef.current.mysteryShip = null
        - Schedule next spawn immediately or with small delay
```

#### 3. Rendering (RenderingSystem)
```
render():
  if (gameLoopRef.current.mysteryShip && gameLoopRef.current.mysteryShip.alive):
    a. Get ship reference
    b. Draw mystery ship sprite/rectangle to canvas:
       - Draw filled rectangle at (x, y, width, height)
       - Optionally: add a unique color or gradient to distinguish from enemies
       - Example: ctx.fillStyle = '#FF00FF'; ctx.fillRect(ship.x, ship.y, ship.width, ship.height)
    c. Optionally: render point value text near ship (useful for player feedback)
```

### State Transitions
```
Playing state (mystery ship enabled):
  ├─ Spawner timer counts down
  ├─ Ship spawns every 10–20 seconds
  ├─ Player can destroy ship for bonus
  ├─ If ship escapes: respawn timer resets
  ├─ If ship destroyed: bonus added to score, respawn timer resets
  └─ No impact if mystery ship disabled or feature disabled
```

### Player Interaction (Collision Path)
```
Player fires bullet at mystery ship:
  1. Bullet moves upward via existing bullet update
  2. Per-frame collision check:
     a. PlayerBullet.boundingBox intersects MysteryShip.boundingBox
     b. PhysicsSystem.checkCollisions() detects hit
     c. Response:
        - mysteryShip.alive = false (marked for cleanup)
        - Bullet destroyed (removed from bullets array)
        - score += mysteryShip.pointValue
        - React state updated: onScoreChange(newScore)
        - HUD re-renders to show updated score immediately
  3. Next frame:
     a. Cleanup: gameLoopRef.current.mysteryShip = null
     b. Spawner schedules next ship
```

## Deliverables

### Code Files

1. **src/game/MysteryShip.ts**
   - Class/interface definitions for MysteryShip and MysteryShipSpawner
   - MysteryShip.update(deltaTime): Updates position, checks bounds, returns alive status
   - MysteryShip.getPointValue(): Returns assigned point value
   - MysteryShipSpawner.update(currentTime): Returns new ship or null
   - MysteryShipSpawner.getNextSpawnTime(): Helper for testing

2. **src/game/RenderingSystem.ts** (extended)
   - drawMysteryShip(mysteryShip: MysteryShip | null): Renders ship to canvas
   - Call from existing render() loop

3. **src/game/PhysicsSystem.ts** (extended)
   - checkCollisions() signature now includes mysteryShip parameter
   - Add collision detection: playerBullets ↔ mysteryShip
   - Return collisionResult.mysteryShipDestroyed and mysteryShipBonusPoints

4. **src/game/GameLoopManager.ts** (extended)
   - Initialize MysteryShipSpawner in constructor
   - Call spawner.update(currentTime) in update() loop
   - Call renderer.drawMysteryShip() in render() loop
   - Integrate collision results into score

5. **src/components/Game.tsx** (minor update)
   - Pass mysteryShip to collision detection
   - Handle bonus points in collision response

### Configuration / Data Files
- None (spawner logic is inline; no JSON config required)

### Documentation Files
- This slice document (you are here)

## Success Criteria

✅ **Mystery ship spawns at random intervals** — Ship appears every 10–20 seconds consistently (verify with console logs or dev overlay)

✅ **Ship renders at top of screen with unique sprite** — Visual distinct from enemies; clearly visible at y ≈ 20

✅ **Ship moves horizontally smoothly** — Movement frame-independent (delta-time scaled); no jumps or stuttering

✅ **Point value assigned randomly** — Ship displays or encodes one of [50, 100, 150, 300] on spawn; verify in collision results

✅ **Player bullet destroys ship + adds bonus score** — Collision detected, ship removed, score increases immediately, HUD updates

✅ **Ship exits screen and respawns after interval** — If ship reaches edge (x < -width or x > canvasWidth), ship is marked dead and next spawn timer starts

✅ **No impact on core game if disabled** — Feature can be toggled off (via a flag or comment-out) without breaking game loop or collision system

✅ **Performance maintained** — No FPS drop when mystery ship is on screen; spawner logic is O(1) per frame

## Observability Impact

### Console Logging (Development)
- Mystery ship spawn: `console.log(`Mystery ship spawned at ${currentTime} with ${pointValue} pts`)`
- Collision detected: `console.log(`Mystery ship destroyed! Bonus +${pointValue} pts`)`
- Ship escapes: `console.log(`Mystery ship escaped. Next spawn at ${nextSpawnTime}`)`
- Spawn timer: `console.log(`Spawner: next spawn in ${nextSpawnTime - currentTime} ms`)`

### React DevTools
- Score updates when mystery ship destroyed (visible in React state changes)

### Canvas Debug Overlay (Optional)
- Display next spawn countdown in top-right corner (development mode only)
- Show active mystery ship point value as text overlay on ship sprite

## Testing Strategy

### Unit Tests
- MysteryShipSpawner.update() returns null until nextSpawnTime is reached
- MysteryShipSpawner.update() returns valid MysteryShip with correct pointValue after spawn time
- MysteryShip.update(deltaTime) advances x position correctly (x += vx * deltaTime)
- MysteryShip position check: ship marked dead when x < -width or x > canvasWidth
- Bounds checking: negative x and x > 800 both trigger cleanup

### Integration Tests
- Start game, wait 10–20 seconds, verify mystery ship appears
- Player bullet hits mystery ship, verify: ship destroyed, bullet removed, score += pointValue
- Mystery ship escapes off-screen, verify: cleanup triggered, next spawn timer starts
- Multiple mystery ships spawned over 60 seconds: all spawn at correct intervals, no memory leaks
- Mystery ship disabled (flag off): no spawns occur, collision detection handles null gracefully

### Manual Testing
- Load game, start playing, listen for console logs of spawn/destruction events
- Watch for mystery ship visual on screen, verify it matches spec (color, size, position)
- Fire at ship, verify score increases and ship disappears
- Let ship escape, verify next one spawns ~10–20 seconds later
- Run for 5+ minutes, check DevTools memory (no growth leaks expected)
- Test on mobile: touch to move player, tap to fire, verify ship interactions work

## Notes

- **Backward compatibility**: Slice 5 (Collision Detection & Scoring) handles player bullet ↔ enemy collisions; this slice extends that system to include mystery ship. No changes to existing enemy collision logic required.
- **Performance**: Mystery ship is a single object per frame (or null); overhead is negligible compared to 55+ enemies.
- **Difficulty**: Mystery ship point values can be tuned (50, 100, 150, 300) based on playtesting feedback.
- **Future expansions**: Mystery ship could animate, use pixel art, emit particles on destruction, or trigger achievements.
