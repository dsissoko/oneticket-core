# Space Invaders MVP

<!-- SITE_DESCRIPTION: Classic arcade Space Invaders browser game with responsive controls for desktop and mobile platforms -->

## 1. Vision

Recreate the iconic Space Invaders arcade experience as a playable, responsive browser game that captures the essence of the 1978 classic while providing modern controls and cross-platform compatibility.

## 2. Users and Actors

- **Primary Users**: Casual players, nostalgia seekers, arcade enthusiasts
- **Skill Levels**: Beginner to intermediate
- **Devices**: Desktop (keyboard + mouse) and mobile (touch + swipe)

## 3. Problems to Solve

- Limited access to authentic arcade hardware and cabinet experiences
- Need for responsive, cross-platform game implementations
- Modern players expect both traditional and contemporary input methods
- No existing Space Invaders implementation in the OneTicket ecosystem

## 4. Product Goals

- Deliver a fully playable Space Invaders MVP with core mechanics
- Support responsive controls across desktop and mobile platforms
- Maintain classic gameplay progression (waves, difficulty scaling, lives system)
- Provide smooth 60 FPS performance using Canvas rendering and requestAnimationFrame
- Establish a foundation for future arcade game features in the platform

## 5. Out of Scope

- Leaderboards and persistent player statistics
- Sound effects and background music
- Difficulty settings or configurable parameters
- Multiplayer or networked gameplay
- Advanced particle effects or post-processing

## 6. Business Concepts

- **Formation**: 11×5 grid of aliens that move laterally and descend when reaching screen edges
- **Player Cannon**: Bottom-center sprite controlled by arrow keys or swipe gestures; fires one bullet at a time
- **Shields**: Four destructible bunkers that degrade when struck by bullets
- **Enemy Fire**: Aliens shoot back; maximum 3 simultaneous bullets on screen
- **Mystery Ship**: Bonus target that periodically traverses the top of the screen
- **Wave Progression**: When all enemies defeated, lives reset to 3 and new wave begins with increased speed
- **Game Over**: Formation reaching player's vertical position or lives exhausted

## 7. Product Capabilities

### V1.0 Core Mechanics

- **Game Initialization**: Start button triggers game loop; HUD displays score (0) and lives (3)
- **Enemy Formation Movement**: 11×5 grid moves horizontally; bounces at screen edges; drops one unit vertically after bounce
- **Formation Speed Scaling**: Speed increases with each wave; proportional to enemies remaining (fewer enemies = faster movement)
- **Player Controls**: 
  - Desktop: Arrow keys (left/right) + Spacebar (fire)
  - Mobile: Swipe left/right + on-screen fire button
  - Single bullet constraint: new bullet only fires after previous bullet exits screen or hits target
- **Shields**: Four destructible bunkers positioned above player; segments degrade on collision with bullets; formation contact destroys entire shield
- **Enemy Fire**: Enemies fire at random intervals (configurable max 3 bullets on screen); bullets descend toward player
- **Collision Detection**: AABB (Axis-Aligned Bounding Box) for all collisions
- **Scoring System**:
  - Enemy bullet hit: +10 points
  - Shield segment destruction: +5 points
  - Mystery ship bonus: +100–300 points (depends on timing)
- **Game States**: Start, Playing, Victory (all enemies destroyed), Game Over (lives exhausted or formation reaches player)
- **Wave Progression**: Victory transitions to new wave; lives reset to 3; formation speed increases by 10%

## 8. High-Level Workflows

### Game Start
1. Player sees start screen with start button
2. Player clicks/taps start button
3. Game initializes: HUD shows score=0, lives=3
4. Game loop begins with formation at top-center, player cannon at bottom-center

### Gameplay Loop
1. Formation moves horizontally; player moves and fires
2. Collisions are evaluated (bullets ↔ enemies, bullets ↔ shields, bullets ↔ player)
3. Scoring updates; entity state changes (enemy destroyed, shield degraded, player loses life)
4. Game state evaluated: continue playing, transition to victory, or trigger game over

### Wave Progression
1. All enemies in formation destroyed
2. Victory state triggered; wave increments
3. Lives reset to 3; score persists
4. Formation respawns with increased speed
5. Game loop resumes

### Game Over
1. Lives reach 0 or formation reaches player's Y position
2. Game Over state triggered
3. Start screen re-displayed; high score shown (if applicable)

## 9. Business Rules

- Formation reaching player's vertical position = immediate game over
- All enemies in formation destroyed = victory → new wave with lives reset to 3
- Player cannot fire more than 1 bullet simultaneously; new bullet fires only after previous bullet leaves screen
- Enemy bullet hitting player = −1 life + 2-second invincibility period
- Shield segment hit by bullet = segment destroyed; formation contact = entire shield destroyed
- Score accumulates across waves; persists until game over
- Maximum 3 enemy bullets on screen simultaneously; oldest bullet removed if limit exceeded
- Enemy fire intervals randomized but weighted toward more frequent fire in later waves

## 10. Success Criteria

- Game loads in under 2 seconds
- Frame rate maintains 60 FPS during normal gameplay
- All user stories pass acceptance criteria
- Responsive controls work on iPhone 12+ and desktop (Chrome, Firefox, Safari)
- Formation reaches bottom of screen in 60–90 seconds; wave completes in 120–180 seconds
- Score increments correctly for all collision types
- Lives system functions correctly; game over triggers appropriately

## 11. Open Questions

- Should enemy fire speed scale with wave progression?
- What is the optimal number of shields (4 vs. 6)?
- Should mystery ship appearance be timer-based or random?
- Should player invincibility period be configurable in later versions?
