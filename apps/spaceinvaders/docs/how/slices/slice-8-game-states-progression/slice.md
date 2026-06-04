# Slice 8 — Game States and Wave Progression

## Goal

Implement complete game state machine (Title, Playing, Wave Complete, Game Over) with proper transitions, UI screens for start/restart, and wave progression mechanics (speed increase, fire interval reduction, lives reset, score persistence).

## Related Epics

[Epic 0 — MVP Complete Playable Space Invaders Game](epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Game Start](us-001-game-start.md)
[US-006 — Wave Progression and Scoring](us-006-wave-progression-scoring.md)

## Impacted Components

### Game Loop (`SpaceInvaders.tsx` / `useGameLoop`)
- Add game phase state management
- Implement phase transition logic
- Control game loop execution based on phase

### Phase Overlays (new)
- **Title Screen Component:** Logo, Start button, mobile touch support
- **Game Over Screen Component:** Final score display, Restart button, loss reason
- **Wave Complete Component:** Pause overlay (1–2 seconds), wave increment feedback

### Game State Manager
- Extend `GameState` interface to include phase tracking
- Implement wave configuration calculation (speed multiplier, fire rate multiplier)
- Add lives reset logic on wave start
- Persist score across wave transitions

### Entity System
- Formation initialization per wave with updated speed/fire rates
- Player respawn at wave start
- Shields reset per wave

## Interfaces

### GamePhase Type
```typescript
type GamePhase = 'title' | 'playing' | 'waveComplete' | 'gameOver';
```

### WaveConfig Interface (from architecture.md)
```typescript
interface WaveConfig {
  waveNumber: number;
  speedMultiplier: number; // 1.0 + (0.15 × (waveNumber - 1))
  fireRateMultiplier: number; // 1.0 / (1.0 + 0.1 × waveNumber)
  lives: number; // always 3
}
```

### Extended GameState
```typescript
interface GameState {
  // ... existing fields ...
  phase: GamePhase;
  gameOverReason?: 'lives-exhausted' | 'formation-reached';
  waveStartTime: number;
}
```

### Phase Transition Handler
```typescript
interface PhaseTransition {
  from: GamePhase;
  to: GamePhase;
  onTransition: (state: GameState) => GameState;
}
```

## Data Changes

### Wave Progression Calculations
- **Speed Multiplier:** `1.0 + (0.15 × (waveNumber - 1))`
  - Wave 1: 1.0× (baseline)
  - Wave 2: 1.15× (+15%)
  - Wave 3: 1.30× (+30%)
  - Scales formation and enemy projectile speed

- **Fire Rate Multiplier:** `1.0 / (1.0 + 0.1 × waveNumber)`
  - Wave 1: 1.0× (baseline)
  - Wave 2: 0.91× (fires ~10% more often)
  - Wave 3: 0.83× (fires ~20% more often)
  - Reduces fire interval on formation

### Lives Reset
- Each new wave resets lives to 3 (even if player finished previous wave with 2 lives)
- Lives persist within a single wave until loss condition

### Score Persistence
- Score increments during gameplay
- Score carries forward across wave transitions
- Score only resets when player clicks Restart from Game Over screen

## Sequence Flow

### Title Phase → Playing Phase
```
[Title Screen Displayed]
  ↓ (player clicks/taps Start)
[Transition triggered]
  1. Initialize wave 1 (speedMultiplier=1.0, fireRateMultiplier=1.0)
  2. Reset lives to 3
  3. Reset score to 0
  4. Spawn player at center-bottom
  5. Spawn enemy formation (11×5, 55 enemies)
  6. Spawn shields at standard positions
  7. Set phase to 'playing'
  8. Start game loop
[Playing Phase - Game Loop Active]
```

### Playing Phase → Wave Complete Phase
```
[Game Loop Active - Playing]
  ↓ (all enemies destroyed - victory condition)
[Wave Complete Transition triggered]
  1. Pause game loop
  2. Set phase to 'waveComplete'
  3. Display wave complete overlay (1–2 second pause)
  4. Play victory sound/feedback (visual only, no audio in MVP)
[Wave Complete Phase Displayed]
```

### Wave Complete Phase → Playing Phase (next wave)
```
[Wave Complete Overlay Displayed]
  ↓ (after 1–2 second pause, auto-advance)
[Next Wave Transition triggered]
  1. Increment wave counter (e.g., 1 → 2)
  2. Calculate new WaveConfig (speedMultiplier, fireRateMultiplier)
  3. Reset lives to 3
  4. Keep score from previous wave
  5. Despawn old formation and shields
  6. Spawn new formation with updated speed/fire rates
  7. Spawn new shields
  8. Respawn player (invincible for 0.5 seconds)
  9. Set phase to 'playing'
  10. Resume game loop
[Playing Phase - Game Loop Active with updated difficulty]
```

### Playing Phase → Game Over Phase (Loss Condition 1: Lives Exhausted)
```
[Game Loop Active - Playing]
  ↓ (player lives reach 0)
[Game Over Transition triggered - Loss Reason: lives-exhausted]
  1. Pause game loop
  2. Set phase to 'gameOver'
  3. Set gameOverReason to 'lives-exhausted'
  4. Display Game Over screen with final score
[Game Over Phase Displayed]
```

### Playing Phase → Game Over Phase (Loss Condition 2: Formation Reached)
```
[Game Loop Active - Playing]
  ↓ (enemy formation descends to player row)
[Game Over Transition triggered - Loss Reason: formation-reached]
  1. Pause game loop
  2. Set phase to 'gameOver'
  3. Set gameOverReason to 'formation-reached'
  4. Display Game Over screen with final score
[Game Over Phase Displayed]
```

### Game Over Phase → Title Phase
```
[Game Over Screen Displayed - Final Score Visible]
  ↓ (player clicks/taps Restart)
[Restart Transition triggered]
  1. Reset all game state (wave = 1, lives = 3, score = 0)
  2. Despawn all entities
  3. Set phase to 'title'
  4. Stop game loop
[Title Phase Displayed]
```

## Observability Impact

### State Transition Logging
- Log phase transitions with timestamp and reason:
  ```
  [TITLE → PLAYING] Wave 1 started
  [PLAYING → WAVE_COMPLETE] All enemies destroyed
  [WAVE_COMPLETE → PLAYING] Wave 2 initialized (speed: 1.15×, fire: 0.91×)
  [PLAYING → GAME_OVER] Lives exhausted, final score: 1250
  [GAME_OVER → TITLE] Player clicked Restart
  ```

### Debug Overlays (Development Mode)
- Display current phase in corner
- Show wave config (speed multiplier, fire rate multiplier)
- Display loss reason on game over

### Performance Metrics
- Measure transition overhead (should be <1 ms)
- Monitor frame skip during wave complete pause (intentional)

### User Analytics (Optional)
- Track games played, average wave reached, high score
- Store in localStorage as optional feature
