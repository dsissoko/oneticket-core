# Epic 0 — MVP Complete Playable Space Invaders Game

## Goal

Deliver a fully playable Space Invaders arcade game that captures the authentic 1978 classic experience in the web browser with all core mechanics operational and smooth 60 FPS gameplay.

## Business Value

This MVP establishes the foundational game loop and all primary mechanics (enemy formation, player controls, shields, firing, collisions, scoring, lives system, wave progression, and game states), enabling players to enjoy complete arcade gameplay and setting the stage for future enhancements and polish.

## Scope

### Core Mechanics
- **Start Screen:** Title screen with "Space Invaders" logo and "Start" button
- **Enemy Formation:** 11×5 grid (55 total enemies) with three visual types and point values (30/20/10 points)
- **Formation Movement:** Synchronized horizontal sweep left/right with downward step at boundaries
- **Player Cannon:** Left/right movement across bottom of screen with single-projectile fire system
- **Player Controls:** Keyboard (arrow keys + spacebar) and mobile touch (swipe/tap buttons)
- **Shields (Bunkers):** 4 destructible bunkers positioned between player and enemies with segment-based degradation
- **Enemy Fire:** Random enemy projectiles with max 3 concurrent on screen; frequency scales per wave
- **Player Life System:** 3 starting lives; respawn at center with 0.5-second invincibility; game over at 0 lives
- **Collision Detection:** All interactions (projectile–enemy, projectile–shield, enemy fire–player, formation–player)
- **Scoring System:** Points awarded for enemy destruction (10/20/30 based on type) and mystery ship bonuses (50/100/150/300)
- **Mystery Ships:** Periodic appearance across top of screen with random point values
- **Wave Progression:** Wave count display; speed multiplier increases 15% per wave; fire interval decreases per wave; lives reset to 3 each wave
- **Game Over State:** Triggered by lives reaching 0 or formation reaching player row; displays final score with "Restart" button
- **Victory State:** Wave completion triggers formation respawn with increased difficulty; infinite waves available

### Technical Requirements
- **Rendering:** 60 FPS consistent performance on modern browsers (Chrome, Firefox, Safari, Edge)
- **Game Loop:** Frame-based rendering with input polling, state updates, collision resolution, and UI updates
- **Enemy AI:** Formation movement patterns, collision detection for boundaries and player row, random firing with frequency scaling
- **Visual Feedback:** Clear indication of collisions, damage, scoring, shield degradation, and state transitions
- **Mobile Support:** Touch controls work smoothly on iOS and Android browsers
- **Desktop Support:** Keyboard and mouse controls work on Windows/macOS

## Acceptance Criteria

- [ ] Game renders at 60 FPS consistently on modern browsers
- [ ] Title screen displays "Space Invaders" logo with "Start" button; clicking starts wave 1
- [ ] All 55 enemies spawn in 11×5 formation with correct visual types and point values (top 2 rows: 30, middle 2 rows: 20, bottom row: 10)
- [ ] Enemy formation moves in synchronized horizontal sweep pattern with downward step at screen boundaries
- [ ] Player cannon moves smoothly left/right with keyboard arrow keys (desktop) or swipe/buttons (mobile)
- [ ] Player fires single projectile upward with spacebar (desktop) or tap button (mobile)
- [ ] All projectile–enemy collisions detected; enemy destroyed and points awarded immediately
- [ ] All projectile–shield segment collisions detected; segment degraded and projectile removed
- [ ] All enemy projectile–player collisions detected; player loses 1 life and respawns at center with 0.5-second invincibility
- [ ] All enemy projectile–shield segment collisions detected; segment degraded
- [ ] Formation collision with player row detected; game immediately ends
- [ ] 4 shields positioned between player and enemies; each shield degrades realistically when hit
- [ ] Enemy fire triggers randomly with max 3 concurrent projectiles on screen
- [ ] Mystery ships appear periodically (every 15–25 seconds) across top of screen with random point values (50/100/150/300)
- [ ] Score displays accurately and persists across all waves
- [ ] Lives display shows current count (starting at 3, reset to 3 each new wave)
- [ ] Wave count displays to player
- [ ] When all 55 enemies destroyed, brief pause (1–2 seconds) before new wave spawns
- [ ] New wave increases enemy speed by 15% and decreases enemy fire interval
- [ ] Game over condition triggered when lives reach 0 or formation reaches player row
- [ ] Game over screen displays "GAME OVER" message with final score and "Restart" button
- [ ] Clicking/tapping "Restart" returns to title screen
- [ ] Mobile touch controls (swipe and tap buttons) work smoothly on iOS and Android browsers
- [ ] Desktop keyboard (arrow keys + spacebar) and mouse controls work on Windows/macOS

## Related User Stories

- [US-001 — Game Start](user-stories/us-001-game-start.md)
- [US-002 — Enemy Formation](user-stories/us-002-enemy-formation.md)
- [US-003 — Player Controls](user-stories/us-003-player-controls.md)
- [US-004 — Shields and Collisions](user-stories/us-004-shields-collisions.md)
- [US-005 — Enemy Fire and Mystery Ships](user-stories/us-005-enemy-fire-mystery-ships.md)
- [US-006 — Wave Progression and Scoring](user-stories/us-006-wave-progression-scoring.md)
