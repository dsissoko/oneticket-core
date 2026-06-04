# Slice 8 — Wave Progression & Difficulty Scaling

## Goal

Implement progressive wave transitions with escalating difficulty, score persistence across waves, and proper game state management for victories and restarts. This slice delivers the complete game flow: detecting victory conditions when all enemies are destroyed, incrementing the wave counter, respawning enemy formations with increased speed and fire rate, resetting lives to 3 while preserving cumulative score, and resetting all state to initial values on restart after game over.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Enemy Formation Movement](us-002-enemy-formation-movement.md)
[US-005 — Enemy Fire System](us-005-enemy-fire-system.md)
[US-007 — Game States & Wave Progression](us-007-game-states-wave-progression.md)

## Impacted Components

### Core Components

- **State Machine Extensions**: Enhanced Victory → Playing transition logic with wave counter increment and lives reset
- **Victory Detection System**: Monitor enemy alive count; trigger Victory state when formation has zero alive enemies
- **Wave Counter Manager**: Track current wave number (1, 2, 3, ...), increment on victory, reset on restart
- **Difficulty Parameters Engine**: Calculate and apply wave-based speed multipliers for formation and enemy fire rate
- **Formation Reset Logic**: Reset/respawn 55 enemies at top-center with updated wave number for new speed/fire rate calculation
- **Lives Manager**: Reset to 3 at wave start while preserving cumulative score across wave boundaries
- **Score Persistence System**: Maintain score across wave transitions; accumulate kills and bonuses across all waves
- **Restart Handler**: Reset all game state (wave = 1, lives = 3, score = 0, gameState = Start) on restart from game over
- **UI/HUD Extensions (React)**: Display victory screen with wave number and cumulative score before transitioning
- **Game Loop Integration**: Victory detection each frame; auto-transition after 2–3 second delay

### Data Structures

- **Wave Configuration**: baseSpeed, fireInterval, speedMultiplier (1.1x per wave)
- **GameState Extensions**: Track score persistence, wave number, lives reset flag
- **Victory Context**: Trigger conditions (aliveCount === 0), transition delay timer

## Interfaces

### State Machine Extensions

```typescript
type GameState = 'Start' | 'Playing' | 'Victory' | 'GameOver'

interface StateTransition {
  from: GameState
  to: GameState
  condition: () => boolean
  action: () => void
}

class StateMachine {
  currentState: GameState
  transitionTo(newState: GameState): void
  handleStateExit(): void
  handleStateEnter(): void
  // New methods:
  onVictory(): void  // Triggered when formation.countAliveEnemies() === 0
  onWaveComplete(): void  // Auto-transition after victory delay
}
```

### Victory Detection System

```typescript
class VictoryDetector {
  checkVictory(formation: Formation): boolean
  // Returns true when all enemies alive === 0
  
  getVictoryData(): {
    waveNumber: number
    currentScore: number
    enemiesDestroyed: number
  }
}
```

### Wave Counter & Difficulty

```typescript
class WaveManager {
  currentWave: number
  baseFormationSpeed: number  // 100 px/sec at wave 1
  baseEnemyFireInterval: number  // e.g., 1000ms at wave 1
  
  incrementWave(): void
  resetToWave(waveNumber: number): void
  
  getFormationSpeedMultiplier(): number
  // Returns: 1.0 for wave 1, 1.1 for wave 2, 1.21 for wave 3, etc.
  // Formula: 1.1 ^ (waveNumber - 1)
  
  getEnemyFireIntervalMultiplier(): number
  // Returns inverse multiplier: 1.0 for wave 1, 0.91 for wave 2, 0.83 for wave 3
  // Formula: 1 / (1.1 ^ (waveNumber - 1))
  // Shorter interval = faster fire rate
  
  getWaveConfig(waveNumber: number): {
    speedMultiplier: number
    fireRateMultiplier: number
  }
}
```

### Lives Manager

```typescript
class LivesManager {
  lives: number
  
  resetLives(): void  // Sets to 3 at wave start
  loseLive(): number  // Decrements; returns new count
  isGameOver(): boolean  // Returns true if lives === 0
}
```

### Score Persistence

```typescript
class ScoreManager {
  cumulativeScore: number
  
  addScore(points: number): void  // Called on enemy kill; accumulates
  getScore(): number
  resetScore(): void  // Only on restart from game over
  
  // Score persists across:
  // - Victory → Playing transition
  // - Wave 1 → Wave 2 → Wave 3
  // - Does NOT reset between waves
}
```

### Restart Handler

```typescript
class RestartHandler {
  reset(): void
  // Resets all state:
  // - gameState = 'Start'
  // - waveNumber = 1
  // - lives = 3
  // - score = 0
  // - formation = null (will respawn on next Play)
  // - all bullets cleared
}
```

### Game Loop Integration

```typescript
class GameLoopManager {
  // Existing:
  update(deltaTime: number): void
  render(): void
  
  // New:
  checkVictory(): void
  // Monitors formation.countAliveEnemies()
  // If 0: set gameState = 'Victory', start transition timer
  
  updateVictoryTransition(deltaTime: number): void
  // Counts down 2–3 second delay, then:
  // - Increment waveNumber
  // - Reset lives to 3
  // - Reset formation.resetForWave(newWaveNumber)
  // - Transition to 'Playing'
}
```

### React UI Extensions

```typescript
interface GameUIProps {
  gameState: GameState
  score: number  // Cumulative across all waves
  lives: number
  waveNumber: number
  onStartGame: () => void
}

// New Victory Screen Component:
interface VictoryScreenProps {
  waveNumber: number
  score: number
  nextWaveCountdown: number  // 2–3 sec countdown before auto-transition
}

// Victory Screen displays:
// - "Wave {waveNumber} Complete!"
// - "Score: {score}"
// - "Wave {waveNumber + 1} starts in {countdown}s"
// - Auto-transitions to Playing after delay (or manual continue button)
```

## Data Changes

### Game State Persistence

```typescript
interface GameLoopState {
  // Existing:
  formation: Formation | null
  player: Player | null
  bullets: Bullet[]
  shields: Shield[]
  mysteryShip: MysteryShip | null
  inputState: PlayerInputState
  
  // Enhanced:
  score: number  // Persists across waves; only resets on restart
  lives: number  // Resets to 3 at wave start
  waveNumber: number  // Increments on victory; resets to 1 on restart
  gameState: GameState  // 'Start' | 'Playing' | 'Victory' | 'GameOver'
  
  // New for Victory handling:
  victoryTransitionTimer: number  // Counts down from 2000ms (2 sec)
  lastVictoryCheckFrame: number
}

interface GameContextState {
  gameState: GameState
  score: number  // Reflects cumulative score
  lives: number  // Current lives (3 at wave start)
  waveNumber: number
  onScoreChange: (newScore: number) => void
  onLivesChange: (newLives: number) => void
  onGameStateChange: (newState: GameState) => void
  onWaveChange: (newWave: number) => void  // NEW
}
```

### Wave Configuration Constants

```typescript
const WAVE_CONFIG = {
  BASE_FORMATION_SPEED: 100,  // pixels/sec at wave 1
  BASE_ENEMY_FIRE_INTERVAL: 1000,  // milliseconds at wave 1
  WAVE_SPEED_MULTIPLIER: 1.1,  // 10% increase per wave
  LIVES_PER_WAVE: 3,
  VICTORY_TRANSITION_DELAY: 2000,  // milliseconds (2 sec)
}
```

### Enemy Spawn Configuration

```typescript
// On wave start:
const ENEMY_GRID_LAYOUT = {
  rows: 5,
  cols: 11,
  totalEnemies: 55,
  rowTypes: [
    'small',    // Row 0: 11 small (40 points each)
    'small',    // Row 1: 11 small (40 points each)
    'medium',   // Row 2: 11 medium (20 points each)
    'medium',   // Row 3: 11 medium (20 points each)
    'large'     // Row 4: 11 large (10 points each)
  ]
}
```

## Sequence Flow

### Game Initialization (Slice 1 Foundation)

```
Game loads
  ├─ React state initialized:
  │   gameState = 'Start'
  │   score = 0
  │   lives = 3
  │   waveNumber = 1
  ├─ Game loop references (useRef):
  │   formation = null
  │   gameState = 'Start'
  │   score = 0
  │   lives = 3
  │   waveNumber = 1
  └─ Start screen displayed with "Start Game" button
```

### Start → Playing Transition

```
Player clicks "Start Game"
  ├─ onStartGame() called
  ├─ gameState = 'Playing'
  ├─ Formation initialized:
  │   - 55 enemies in 11×5 grid
  │   - Position: x = canvasWidth/2, y = 50
  │   - Speed calculated: baseSpeed * 1.0 (wave 1)
  │   - Fire interval: baseInterval * 1.0 (wave 1)
  ├─ Player initialized at bottom-center
  ├─ Shields initialized
  ├─ HUD displays: Score: 0, Lives: 3, Wave: 1
  └─ Game loop begins full entity updates
```

### Playing State — Each Frame

```
requestAnimationFrame
  ├─ Calculate deltaTime
  ├─ Update phase:
  │   ├─ Input system reads keyboard/touch
  │   ├─ Player updates position
  │   ├─ Formation updates position (already using wave-based speed from Slice 2)
  │   ├─ Enemy bullets spawn at wave-based interval
  │   ├─ Bullets update position
  │   ├─ Collisions detected and resolved
  │   ├─ Score updates on kill
  │   ├─ Lives updates on hit (if not invincible)
  │   │
  │   ├─ *** VICTORY CHECK ***
  │   │   if (formation.countAliveEnemies() === 0) {
  │   │     gameState = 'Victory'
  │   │     victoryTransitionTimer = 2000
  │   │     displayVictoryScreen(waveNumber, score)
  │   │   }
  │   │
  │   ├─ Score/lives synced to React state (debounced)
  │   └─ React HUD updates
  │
  ├─ Render phase:
  │   ├─ Canvas cleared
  │   ├─ Formation rendered
  │   ├─ Player rendered
  │   ├─ Bullets rendered
  │   ├─ Shields rendered
  │   └─ HUD text displayed
  │
  └─ State evaluation:
      ├─ Playing: continue loop
      ├─ Victory: process victory transition (below)
      └─ GameOver: display game over screen
```

### Playing → Victory Transition (Victory Detection)

```
Victory Condition Triggered:
  ├─ Condition: formation.countAliveEnemies() === 0
  ├─ gameState = 'Victory'
  ├─ victoryTransitionTimer = VICTORY_TRANSITION_DELAY (2000ms)
  ├─ HUD displays:
  │   "Wave {waveNumber} Complete!"
  │   "Score: {score}"
  │   "Wave {waveNumber + 1} starts in {countdown}s"
  ├─ Canvas continues rendering for visual feedback (frozen game state)
  └─ Game loop still running, counting down timer
```

### Victory State — Each Frame (2–3 Second Delay)

```
While gameState = 'Victory':
  ├─ Don't update game entities (formation, bullets frozen)
  ├─ Decrement victoryTransitionTimer by deltaTime
  ├─ Update countdown display: remaining ms / 1000
  │
  ├─ When victoryTransitionTimer <= 0:
  │   ├─ *** WAVE PROGRESSION LOGIC ***
  │   │   1. Increment waveNumber (1 → 2, 2 → 3, etc.)
  │   │   2. Reset lives = 3
  │   │   3. Score persists (NOT reset)
  │   │   4. Calculate new difficulty:
  │   │       speedMultiplier = 1.1 ^ (newWave - 1)
  │   │       fireRateMultiplier = 1 / (1.1 ^ (newWave - 1))
  │   │   5. Formation.resetForWave(newWaveNumber):
  │   │       - Create 55 new enemies
  │   │       - Reset position: top-center
  │   │       - Update formation.speed using new waveNumber
  │   │       - Enemy bullet spawn rate uses new fireRateMultiplier
  │   │   6. Clear all bullets from screen
  │   │   7. gameState = 'Playing'
  │   │   8. HUD updates:
  │   │       - waveNumber = new value
  │   │       - lives = 3
  │   │       - score = cumulative (unchanged)
  │   │
  │   └─ Game loop resumes full updates with new wave
  │
  └─ Canvas renders frozen game state + countdown
```

### Wave 1 → Wave 2 Difficulty Increase Example

```
Wave 1 Initial:
  - Formation speed: 100 px/sec
  - Enemy fire interval: 1000 ms between shots
  - Enemy count: 55/55 alive

Wave 2 On Spawn:
  - waveNumber = 2
  - Formation speed: 100 * 1.1 = 110 px/sec (10% faster)
  - Enemy fire interval: 1000 / 1.1 ≈ 909 ms (faster)
  - Enemy count: 55/55 alive (full reset)
  - Player: same speed, same firepower
  - Lives: reset to 3
  - Score: carries forward (e.g., 1200 from wave 1 + wave 2 kills)

As Wave 2 Progresses:
  - Formation speed increases smoothly as enemies die
  - Enemy fire rate remains at wave 2 base until wave 3
  - Player must adapt to increased difficulty
```

### Playing → Game Over Transition

```
Game Over Condition:
  - Lives = 0 (on enemy bullet hit or shield overflow)
  - OR formation reaches player (y + height >= playerY)

Triggered:
  ├─ gameState = 'GameOver'
  ├─ All entity movement stops
  ├─ Game over screen displays:
  │   "Game Over!"
  │   "Final Score: {score}"
  │   "Wave reached: {waveNumber}"
  │   "Restart" button
  └─ Input system listens for restart click
```

### Game Over → Restart Sequence

```
Player clicks "Restart" button:
  ├─ *** FULL STATE RESET ***
  │   ├─ waveNumber = 1
  │   ├─ lives = 3
  │   ├─ score = 0  *** Score resets on restart (different from wave transition) ***
  │   ├─ gameState = 'Start'
  │   ├─ formation = null
  │   ├─ bullets = [] (cleared)
  │   ├─ All shields reset to full health
  │   └─ Player position reset to bottom-center
  │
  ├─ React state updates:
  │   gameState = 'Start'
  │   score = 0
  │   lives = 3
  │   waveNumber = 1
  │
  ├─ Start screen displayed with "Start Game" button
  └─ Game loop continues but entities frozen (playing = false)
```

### Game State Machine Flow

```
                    ┌─────────────┐
                    │   Start     │
                    │ (Start Scr) │
                    └──────┬──────┘
                           │ (Player clicks Start)
                           ↓
                    ┌─────────────────────┐
        ┌──────────→│   Playing           │←──────────────┐
        │           │ (Game loop active)  │               │
        │           └──────┬──────────────┘               │
        │                  │ (All enemies destroyed)       │
        │                  ↓                              │
        │           ┌─────────────────────┐              │
        │           │   Victory           │              │
        │           │ (2-3 sec delay)     │              │
        │           │ + Form reset        │              │
        │           │ + Wave++ + Lives=3  │              │
        │           └──────┬──────────────┘              │
        │                  │ (Delay expires)             │
        │                  └──────────────────────────────┘
        │                  
        │                  ┌─────────────┐
        │                  │  GameOver   │
        └──────────────────│ (Final Scr) │
        (lives=0 or        └──────┬──────┘
         formation at            │
         player)                 │ (Restart)
                                 ↓
                          ┌─────────────┐
                          │   Start     │
                          │ (Wave=1,    │
                          │  Lives=3,   │
                          │  Score=0)   │
                          └─────────────┘
```

## Deliverables

### Code Files

1. **src/game/managers/WaveManager.ts**
   - `currentWave`: track wave number (1, 2, 3, ...)
   - `incrementWave()`: increment on victory
   - `resetToWave(n)`: reset to specific wave
   - `getFormationSpeedMultiplier()`: return 1.1^(wave-1)
   - `getEnemyFireIntervalMultiplier()`: return 1 / (1.1^(wave-1))
   - `getWaveConfig(waveNumber)`: return speed/fire rate multipliers

2. **src/game/managers/ScoreManager.ts**
   - `cumulativeScore`: persist across waves
   - `addScore(points)`: accumulate on kill
   - `getScore()`: return total
   - `resetScore()`: only on restart

3. **src/game/managers/LivesManager.ts**
   - `lives`: current count (0–3)
   - `resetLives()`: set to 3 on wave start
   - `loseLive()`: decrement on hit
   - `isGameOver()`: true if lives === 0

4. **src/game/systems/VictoryDetector.ts**
   - `checkVictory(formation)`: return alive === 0
   - `getVictoryData()`: return wave, score, kills

5. **src/game/systems/RestartHandler.ts**
   - `reset()`: reset all state to initial values
   - Called when player clicks restart after game over

6. **src/game/GameLoopManager.ts** (Extended)
   - `checkVictory()`: monitor formation.countAliveEnemies()
   - `updateVictoryTransition(deltaTime)`: count down 2–3 sec
   - Auto-transition to Playing after delay
   - Call `formation.resetForWave(newWave)` during transition

7. **src/game/StateMachine.ts** (Extended)
   - Enhanced to support Victory → Playing transition
   - `onVictory()`: set victory transition timer
   - `onWaveComplete()`: increment wave, reset lives, transition to Playing

8. **src/game/entities/Formation.ts** (Extended)
   - `resetForWave(waveNumber)`: respawn 55 enemies with updated speed
   - Already calculates speed using waveNumber (from Slice 2)
   - Clear dead enemy references and spawn fresh grid

9. **src/components/VictoryScreen.tsx** (NEW)
   - Display "Wave {N} Complete!"
   - Show score and countdown to next wave
   - Auto-close after 2–3 seconds or on button click
   - Centered modal with styling matching Start/GameOver screens

10. **src/components/GameOverScreen.tsx** (Extended)
    - Update to show "Wave reached: {waveNumber}"
    - Add "Final Score: {score}"
    - "Restart" button calls restart handler

11. **src/components/HUD.tsx** (Extended)
    - Display wave number prominently
    - Ensure score displays cumulatively (not wave-specific)
    - Lives display: 3 lives per wave (resets on victory)

12. **src/hooks/useGameState.ts** (Enhanced or NEW)
    - Centralize game state management
    - Expose methods: startGame(), victoryDetected(), resetGame()
    - Manage React state sync with game loop refs

### Configuration Files

- **src/game/config/WaveConfig.ts**
  - `WAVE_BASE_SPEED = 100`
  - `WAVE_BASE_FIRE_INTERVAL = 1000`
  - `WAVE_SPEED_MULTIPLIER = 1.1`
  - `LIVES_PER_WAVE = 3`
  - `VICTORY_TRANSITION_DELAY = 2000`
  - `RESTART_WAIT_TIME = 0` (immediate)

### Canvas Rendering Updates

- Victory screen overlay (semi-transparent dark background + modal)
- Game over screen with wave and final score
- HUD wave number positioned prominently (top-center or top-right)

## Success Criteria

✅ **Victory detection works** — All enemies destroyed triggers Victory state immediately  
✅ **Victory screen displays** — Shows wave number and cumulative score with 2–3 sec countdown  
✅ **Wave counter increments** — Victory → Playing transition increments wave from 1 → 2 → 3  
✅ **Lives reset on wave start** — Set to 3 at victory transition, preserved across previous wave kills  
✅ **Score persists across waves** — Cumulative score displayed and carried forward (not reset until restart)  
✅ **Formation respawns with new speed** — Wave 2 formation visibly ~10% faster than Wave 1  
✅ **Enemy fire rate increases per wave** — Visual/observable faster enemy fire on Wave 2+  
✅ **Game over resets all state** — Restart button resets score=0, lives=3, wave=1, returns to Start screen  
✅ **Restart clears all entities** — No residual bullets, enemies, or shields from previous session  
✅ **State machine transitions smooth** — No visual glitches or state inconsistencies during transitions  
✅ **HUD updates correctly** — Wave number, lives, and score display accurately during and after transitions  
✅ **Victory auto-transitions** — 2–3 second delay before auto-advancing to next wave (or manual button)  
✅ **Multiple waves playable** — Can progress from Wave 1 → 2 → 3+ without crashes or state corruption  
✅ **Formation reaches bottom = game over** — Victory not triggered; game over state entered instead  
✅ **Score accumulates correctly** — 1200 (wave 1) + 500 (wave 2) = 1700 displayed (not reset)

## Observability Impact

### Console Logging (Development)

```typescript
// Victory detection:
console.log(`Victory! Wave ${waveNumber} complete. Alive enemies: 0`)

// Victory transition:
console.log(`Starting victory transition. Next wave in ${VICTORY_TRANSITION_DELAY}ms`)

// Wave progression:
console.log(`Wave progression: ${waveNumber} → ${waveNumber + 1}`)
console.log(`Formation speed: ${baseSpeed} → ${baseSpeed * 1.1} px/sec`)
console.log(`Enemy fire interval: ${baseInterval}ms → ${baseInterval / 1.1}ms`)

// Lives reset:
console.log(`Lives reset: ${prevLives} → 3 (wave start)`)

// Score persistence:
console.log(`Score persists across wave transition: ${score}`)

// Restart:
console.log(`Game reset: wave=1, lives=3, score=0, gameState=Start`)

// Game over:
console.log(`Game Over! Final score: ${score}, wave reached: ${waveNumber}`)
```

### React DevTools

- Watch `gameState` state variable: 'Start' → 'Playing' → 'Victory' → 'Playing' → 'GameOver' → 'Start'
- Watch `waveNumber`: increments on each Victory → Playing transition
- Watch `lives`: resets to 3 on Victory, decrements on hit during Playing
- Watch `score`: accumulates during Playing, persists across Victory, resets on restart
- Verify no excessive re-renders (only on state changes, not every frame)

### Canvas Debug Overlay (Optional, Development)

- Wave number overlay: top-left or top-center
- Current difficulty multiplier display: "Speed: 1.1x, Fire: 1.1x"
- Victory transition countdown: "Next wave in {countdown}s"
- Entity count: "Enemies: 55, Bullets: 3"
- State indicator: "State: Playing | Victory | GameOver"

## Testing Strategy

### Unit Tests

- `WaveManager.getFormationSpeedMultiplier()`: verify 1.1^(n-1) formula
  - Wave 1 → 1.0
  - Wave 2 → 1.1
  - Wave 3 → 1.21
  - Wave 5 → 1.464
- `WaveManager.getEnemyFireIntervalMultiplier()`: verify inverse formula
  - Wave 1 → 1.0
  - Wave 2 → 0.909
  - Wave 3 → 0.826
- `ScoreManager.addScore(points)`: verify accumulation
  - addScore(100) → getScore() = 100
  - addScore(50) → getScore() = 150
- `LivesManager.resetLives()`: verify reset
  - loseLive() → loseLive() → livesLeft = 1
  - resetLives() → livesLeft = 3
- `VictoryDetector.checkVictory(formation)`: verify detection
  - formation with 55 alive enemies → false
  - formation with 1 alive enemy → false
  - formation with 0 alive enemies → true
- `RestartHandler.reset()`: verify state reset
  - Before: wave=3, lives=1, score=5000
  - After reset: wave=1, lives=3, score=0

### Integration Tests

- **Wave 1 → Victory Transition**
  - Setup: Playing state, all 55 enemies spawned
  - Action: Kill last enemy
  - Expected: gameState = Victory, victoryTransitionTimer = 2000ms, victory screen displayed
  - Verify: Victory screen shows "Wave 1 Complete", score visible, countdown running

- **Victory → Playing (Wave 2) Transition**
  - Setup: gameState = Victory, timer counting down
  - Action: Wait 2–3 sec for auto-transition
  - Expected: waveNumber = 2, lives = 3, score persisted, formation.resetForWave(2) called
  - Verify: New formation spawns with 55 enemies, HUD updates to Wave 2, game resumes

- **Formation Speed Increase per Wave**
  - Setup: Wave 1 formation at x=0
  - Action: Note formation position after 1 sec
  - Expected: Δx ≈ 100 pixels
  - Switch to Wave 2: Note position after 1 sec
  - Expected: Δx ≈ 110 pixels (10% faster)

- **Enemy Fire Rate Increase per Wave**
  - Setup: Wave 1, count enemy bullets per 5 sec
  - Expected: ~5 bullets spawned (1 every ~1 sec)
  - Switch to Wave 2: Count bullets per 5 sec
  - Expected: ~5.5 bullets spawned (~0.909 sec interval)

- **Lives Reset on Wave Transition**
  - Setup: Wave 1, take 2 hits, lives = 1
  - Action: Trigger victory, wait for transition
  - Expected: lives = 3 during Victory → Playing transition, HUD updates
  - Verify: New wave starts with 3 lives

- **Score Persistence Across Waves**
  - Setup: Wave 1, kill 3 enemies (points = 100 + 20 + 10 = 130)
  - Expected: score = 130 on victory
  - Action: Victory transition to Wave 2
  - Expected: score still = 130 (not reset)
  - Kill 1 enemy in Wave 2 (points = 40)
  - Expected: score = 130 + 40 = 170

- **Restart Resets All State**
  - Setup: Wave 2, lives = 2, score = 500
  - Action: Trigger game over, click restart
  - Expected: gameState = Start, waveNumber = 1, lives = 3, score = 0
  - Verify: Start screen displayed, HUD shows 0, wave 1

- **Multiple Wave Progression**
  - Setup: Complete Wave 1 → 2 → 3
  - Expected: Wave counter increments correctly, difficulty increases, score accumulates
  - Verify: No crashes, state stays consistent across 3+ waves

### Manual Testing

1. **Start game, complete Wave 1:**
   - Click "Start Game"
   - Destroy all 55 enemies (cheat key or play normally)
   - Observe: Victory screen displays with wave number, score, countdown
   - Wait 2–3 sec
   - Observe: Transition to Wave 2, HUD updates, new formation spawns

2. **Verify lives reset:**
   - During Wave 1, take 2 hits (lives = 1)
   - Destroy last enemy, trigger victory
   - Observe: Lives reset to 3 on victory transition screen
   - Wave 2 starts with 3 lives displayed in HUD

3. **Verify score persistence:**
   - Wave 1: Kill several enemies, accumulate score (e.g., 500)
   - Victory screen shows 500
   - Wave 2 starts, verify HUD still shows 500
   - Kill more enemies in Wave 2 (e.g., +300)
   - HUD shows 800 (not reset)

4. **Verify difficulty increase:**
   - Wave 1: Observe formation movement speed, enemy fire rate
   - Wave 2: Observe formation visibly faster, enemies fire more frequently
   - Wave 3: Observe further speed/fire rate increase

5. **Verify restart resets all:**
   - Progress to Wave 2, score = 300
   - Trigger game over (let formation reach player)
   - Click restart on game over screen
   - Observe: Start screen, HUD shows score = 0, wave = 1, lives = 3
   - Click start, verify fresh Wave 1

6. **Verify formation respawn:**
   - Victory screen displays
   - Wait for transition
   - Observe: New formation appears at top-center with 55 enemies
   - No residual enemies from Wave 1

7. **Stress test: Multiple waves:**
   - Progress through 5+ waves (use cheat key to skip if needed)
   - Verify: Wave counter increments, no crashes, state stays consistent
   - Verify: Score accumulates correctly across all waves
   - Verify: Difficulty visibly increases each wave

## Technical Notes

### Wave Progression Logic Location

- Victory detection: in `GameLoopManager.update()` → `checkVictory()` check
- Victory transition: counted in `GameLoopManager.update()` → `updateVictoryTransition(deltaTime)`
- Wave increment: triggered in victory transition countdown expiry
- Formation reset: `formation.resetForWave(newWaveNumber)` called during transition
- Lives reset: `livesManager.resetLives()` called during transition
- Score persistence: `scoreManager` NOT called for reset during transition (only on restart)

### Difficulty Scaling Integration

- Formation speed scaling: delegated to `Formation.update(deltaTime, waveNumber)` (Slice 2)
  - `Formation` already receives `waveNumber` and calculates speed internally
  - This slice ensures `waveNumber` is passed and incremented correctly
- Enemy fire rate scaling: delegated to enemy bullet spawn logic (Slice 4)
  - Enemy spawning system already scales fire interval by wave
  - This slice ensures `waveNumber` context is available

### State Management Pattern

- React state: `gameState`, `score`, `lives`, `waveNumber` (UI layer)
- Game loop refs (useRef): mirrors above for game loop access without triggering re-renders
- Managers (classes): `WaveManager`, `ScoreManager`, `LivesManager` (business logic)
- Sync: Game loop updates managers → managers notify game loop state updates → React state updates on changes

### Transition Timing

- **Start → Playing**: Immediate (no delay)
- **Playing → Victory**: Immediate (on alive count = 0)
- **Victory → Playing**: 2–3 sec delay (VICTORY_TRANSITION_DELAY = 2000ms)
- **Playing → GameOver**: Immediate (on lives = 0 or formation at player)
- **GameOver → Start**: Immediate (on restart button click)

