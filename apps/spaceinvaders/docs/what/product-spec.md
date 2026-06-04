---
title: Space Invaders Game Specification
---

# Space Invaders Game Specification

<!-- SITE_DESCRIPTION: A classic 2D arcade game where players defend against waves of descending enemies using a cannon and shields -->

## 1. Vision

Deliver an authentic, engaging Space Invaders arcade game that captures the timeless appeal of the 1978 classic while running smoothly in the modern web browser. The game emphasizes quick reflexes, strategic shield management, and escalating challenge through wave progression.

## 2. Users and Actors

**Primary User:** Casual arcade game player
- Audience: Ages 6–80, gaming enthusiasts, nostalgic arcade players, casual mobile/web gamers
- Plays in short sessions (5–10 minutes) or extended sessions for high-score competition
- Uses either desktop (keyboard+mouse) or mobile (touch controls)

**Secondary Actors:**
- The Game Engine (controls enemy AI, collisions, scoring, state transitions)
- The Player Cannon (responds to input, fires projectiles)
- Enemy Formation (moves in synchronized pattern, fires randomly)
- Mystery Ships (appear periodically for bonus points)

## 3. Problems to Solve

1. **Lack of engaging classic arcade gameplay:** Players want an authentic, fast-paced shooter experience.
2. **No strategic defense options:** Shields provide partial protection, requiring players to manage resources and position tactically.
3. **Single-difficulty play feels stale:** Wave progression with increasing speed and fire rate keeps challenge fresh.
4. **Mobile accessibility gap:** Desktop-only controls exclude mobile/touch players; need cross-platform input handling.
5. **Missing feedback on performance:** Score display and lives system give clear feedback on player success.

## 4. Product Goals

1. Create a fully playable Space Invaders game with authentic arcade mechanics
2. Support both desktop (keyboard/mouse) and mobile (touch) input methods
3. Implement progressive difficulty through 3+ waves with increasing enemy speed and fire rates
4. Deliver smooth 60 FPS gameplay on modern browsers
5. Provide visual feedback for all interactions (collisions, damage, scoring)
6. Enable players to compete for high scores across sessions

## 5. Out of Scope

- Persistent leaderboard or account system (local high-score only)
- Difficulty settings (fixed progression)
- Downloadable app or offline mode (browser-based only)
- Multiplayer or competitive modes
- Custom ship upgrades or power-ups
- Advanced graphics or 3D rendering
- Sound/music system (visual-only gameplay)

## 6. Business Concepts

### Enemy Formation
- **Structure:** 11 × 5 grid (55 total enemies)
- **Visual Types & Point Values:**
  - Top 2 rows: 30 points (small alien)
  - Middle 2 rows: 20 points (medium alien)
  - Bottom row: 10 points (large alien)
- **Movement:** Synchronized horizontal sweep left/right, then down one row when hitting screen edge
- **Speed:** Base speed increases as enemies are destroyed; higher speed = faster sweep cycles

### Shields (Bunkers)
- **Count:** 4 bunkers positioned between player and enemies
- **Structure:** Each bunker is a grid of destructible segments
- **Damage:** Segments degrade when hit by player projectiles, enemy fire, or formation contact
- **Degradation:** Visual representation updates as segments are removed
- **Destruction:** Bunker removed from game when all segments are destroyed

### Player Cannon
- **Movement:** Left/right across bottom of screen at fixed Y position
- **Projectiles:** One active projectile at a time (fire-and-forget)
- **Firing:** Instant trajectory upward; travels until hitting enemy, mystery ship, or shield segment
- **Lives System:** 3 starting lives; respawn at center with brief invincibility (0.5 seconds)
- **Game Over:** Triggered when lives reach 0 or enemy formation reaches player row

### Enemy Fire
- **Mechanics:** Random enemy fires downward projectile from bottom of formation column
- **Frequency:** 3 maximum concurrent enemy projectiles on screen
- **Trigger:** Random selection from each column; frequency increases with wave progression
- **Collision:** Enemy projectile hitting player = –1 life; enemy projectile hitting shield segment = degrade segment

### Mystery Ships
- **Appearance:** Horizontal movement across top of screen at random intervals
- **Point Values:** Randomly assigned (50, 100, 150, or 300 points)
- **Collision:** Player projectile destroys ship, awards bonus points
- **Frequency:** One every 15–25 seconds

### Waves & Progression
- **Wave Trigger:** All enemies destroyed → new wave spawns
- **Difficulty Increase:**
  - Enemy movement speed increases by 15% per wave
  - Enemy fire interval decreases (fires more frequently)
- **Lives Reset:** New wave resets lives to 3
- **Score Persistence:** Score carries forward across all waves
- **Game Over:** Triggered if formation reaches player row OR lives = 0
- **Victory:** Theoretically infinite; game continues with escalating difficulty

## 7. Product Capabilities

### 7.1 Gameplay Loop
- Render frame at 60 FPS with smooth animation
- Update game state (positions, collisions, scoring)
- Poll input (keyboard/mouse or touch)
- Detect and resolve collisions
- Update UI (score, lives, wave count)

### 7.2 Enemy AI
- Formation movement: synchronized horizontal sweep with downward step
- Collision detection: formation hitting left/right boundary, reaching player row
- Firing: random column selection with frequency scaling per wave
- Speed scaling: increase movement speed as enemy count decreases

### 7.3 Collision Detection
- **Projectile–Enemy:** Destroy enemy, award points, remove projectile
- **Projectile–Shield Segment:** Degrade segment, remove projectile
- **Projectile–Mystery Ship:** Destroy ship, award bonus points
- **Enemy Fire–Player:** –1 life, play respawn animation
- **Enemy Fire–Shield Segment:** Degrade segment
- **Formation–Player Row:** Game over

### 7.4 Scoring System
- Enemy destruction: 10 (bottom row) | 20 (middle rows) | 30 (top rows)
- Mystery ship: 50 | 100 | 150 | 300 (random per ship)
- High score tracked during session; may persist to local storage

### 7.5 Wave Progression
- Wave count displayed to player
- Speed multiplier per wave: 1.0 (wave 1) → 1.15 (wave 2) → 1.30 (wave 3), etc.
- Fire rate multiplier: base interval / (1 + 0.1 × wave_number)
- Lives reset to 3 at start of each wave
- Victory condition: eliminate all 55 enemies

## 8. High-Level Workflows

### Workflow 1: Game Start
1. Player sees title screen with "Space Invaders" logo and "Start" button
2. Player clicks/taps "Start"
3. Game initializes wave 1 with formation (11×5 grid), player cannon (center bottom), shields (4 bunkers), lives (3), score (0)
4. Gameplay loop begins

### Workflow 2: Active Gameplay
1. Player input (keyboard left/right arrows, spacebar to fire OR touch swipe/buttons)
2. Player cannon moves; projectile fires upward
3. Enemy formation moves in sweep pattern; fires randomly downward
4. Mystery ship appears periodically, moving horizontally
5. Collisions detected and resolved (scoring, degradation, life loss)
6. Game state updated; frame rendered
7. Repeat until wave complete (all enemies destroyed) or game over (lives = 0 or formation reached)

### Workflow 3: Wave Completion
1. Last enemy destroyed
2. Brief pause (1–2 seconds)
3. Wave count incremented
4. New formation spawned at original position
5. Enemy speed and fire rate adjusted (increased)
6. Lives reset to 3
7. Gameplay resumes (score persists)

### Workflow 4: Game Over
1. Game detects loss condition (lives = 0 or formation reached player row)
2. "GAME OVER" screen displays final score
3. Player sees "Restart" button
4. Player clicks/taps "Restart"
5. Return to Workflow 1 (title screen)

## 9. Business Rules

### Enemy Movement Rules
- Formation moves left/right by 1 unit per frame (or adjusted for speed multiplier)
- When left boundary hit: reverse direction, move down 1 row
- When right boundary hit: reverse direction, move down 1 row
- When reaching player row Y-coordinate: game over

### Enemy Firing Rules
- Each frame, random selection from 11 columns decides if a fire event occurs
- Max 3 concurrent enemy projectiles on screen
- Enemy projectiles move downward at constant velocity
- Projectile removed when: hits player, hits shield segment, or passes bottom boundary

### Shield Degradation Rules
- Each shield segment has binary state: intact or destroyed
- Hit by projectile (player or enemy): segment marked as destroyed, removed from rendering
- Formation contact: all segments in contact row destroyed
- Entire shield removed when all segments destroyed

### Scoring Rules
- Enemy destroyed: points awarded based on visual type (10/20/30)
- Mystery ship destroyed: bonus points (50/100/150/300, random per ship)
- No penalty for shots fired or lives lost
- Score persists across waves and only resets on new game (game restart)

### Game Over Conditions (loss)
1. Lives reach 0 (player hit 3 times without shield or mercy period)
2. Enemy formation reaches player row (Y-coordinate of cannon)

### Victory Conditions
1. All 55 enemies in formation destroyed → wave complete, new wave spawns
2. Infinite waves available; no "winning" the game, only achieving high scores

### Difficulty Scaling Rules
- **Speed Multiplier per Wave:** 1.0 + (0.15 × (wave_number – 1))
  - Wave 1: ×1.0
  - Wave 2: ×1.15
  - Wave 3: ×1.30
- **Fire Interval per Wave:** base_interval / (1 + 0.1 × wave_number)
  - Base interval: 1 second
  - Wave 1: 1.0 second
  - Wave 2: 0.91 second
  - Wave 3: 0.83 second

### Lives & Respawn Rules
- Starting lives: 3
- Player respawn: center bottom of screen with 0.5-second invincibility (projectiles can't hit)
- Lives reset to 3 at start of each new wave
- Final life lost → game over

## 10. Success Criteria

- [ ] Game renders at 60 FPS consistently on modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] All 55 enemies spawn in 11×5 formation with correct point values
- [ ] Player cannon moves smoothly and fires projectiles with accurate collision detection
- [ ] Shields degrade realistically; visual feedback clear when segments destroyed
- [ ] Enemy fire mechanics trigger randomly and at correct frequency per wave
- [ ] Mystery ships appear periodically and award correct bonus points
- [ ] Score displayed accurately; persists across waves
- [ ] Wave progression increases difficulty (speed + fire rate) per defined multipliers
- [ ] Game over conditions trigger correctly (lives = 0 or formation reached)
- [ ] Mobile touch controls work smoothly on iOS and Android browsers
- [ ] Desktop keyboard + mouse controls work on Windows/macOS

## 11. Open Questions

- Should we include a pause/resume feature? (Y/N decision required)
- What is the target minimum FPS (60 or 30)? Impacts rendering optimizations.
- Should local high-score storage persist after browser close? (local storage or session-only)
- What is the acceptable frame-time budget for input latency (16 ms @ 60 FPS)?
- Should shield regeneration occur between waves, or remain damaged?
- Are there audio/visual "juice" effects desired (screen shake, particle effects, etc.)?
