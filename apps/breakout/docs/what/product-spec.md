# Product Specification — Breakout

<!-- SITE_DESCRIPTION: Classic arcade Breakout game in vanilla JavaScript — destroy bricks with a bouncing ball and paddle (max 160 chars) -->

## 1. Vision

Deliver a faithful classic arcade Breakout game in vanilla JavaScript (HTML/CSS/JS, no external dependencies) that captures the essence of the timeless brick-breaker experience. Players control a paddle to keep a ball in play, destroy bricks arranged in rows, and master increasingly challenging ball physics. The game features simple, responsive controls and adjustable difficulty via ball speed settings.

## 2. Users and Actors

- **Arcade Player** — An individual seeking a nostalgic, skill-based gaming experience. Motivated by challenge, quick feedback, and competition. Plays in short, focused sessions.
- **Casual Gamer** — Someone exploring retro games for entertainment. Values ease of learning and adjustable difficulty to match their skill level.

## 3. Problems to Solve

- **Limited Vanilla JS Arcade Games** — Few modern, well-made Breakout implementations without heavy frameworks or external dependencies.
- **Inaccessible Difficulty Tuning** — Classic Breakout games often have fixed, non-adjustable difficulty; new players struggle, experts find it trivial.
- **Predictable Ball Physics** — Standard brick breaker games lack engaging, responsive ball dynamics and collision behavior.

## 4. Product Goals

1. Create a fully playable, frame-accurate Breakout game in vanilla JavaScript.
2. Enable players to adjust ball speed dynamically via an in-game slider (slow → fast spectrum).
3. Deliver responsive paddle control with keyboard arrows (left/right) for fluid, arcade-like gameplay.
4. Implement fair lives system (3 lives per game) with clear loss conditions and win conditions.
5. Support flexible menu navigation using mouse/pointer without relying on game-critical keyboard input.

## 5. Out of Scope

- **Level Progression** — No multi-level campaigns, progressive difficulty, or staged brick layouts for V1.
- **Scoring System** — No point accumulation, high-score persistence, or ranking.
- **Power-ups & Special Effects** — No bonus items, explosions, visual effects, or game-altering pickups.
- **Multiplayer** — No networked or local co-op play.
- **Mobile Responsive Design** — Focus is keyboard/mouse input; mobile touch controls deferred.
- **Audio** — No sound effects or background music for V1.
- **Game Modes** — No endless mode, time attack, or variant rule sets; standard Breakout rules only.

## 6. Business Concepts

- **Brick** — An on-canvas obstacle with a visual representation and collision bounds. Destroyed when the ball collides with it; removed from play immediately.
- **Ball** — A moving projectile with velocity and collision logic. Bounces off walls, ceiling, paddle, and bricks. Game over if it falls below the paddle (screen bottom).
- **Paddle** — A player-controlled horizontal bar that reflects the ball. Moves left/right within screen bounds. Acts as the sole means of keeping the ball in play.
- **Life/Lives** — A counter tracking the player's remaining attempts. Game starts with 3 lives; decrements by 1 each time the ball falls. Game over at 0 lives.
- **Game State** — The running configuration of the game: active play, paused, game over (loss or win).
- **Brick Layout** — A fixed arrangement of bricks in rows (5 rows total) spanning the playfield. Uniform at game start; progressively destroyed.

## 7. Product Capabilities

### Core Mechanics
- **Ball Physics** — Ball bounces realistically off walls, ceiling, paddle, and brick surfaces with angle-dependent reflection.
- **Collision Detection** — Accurate detection of ball-vs-paddle, ball-vs-brick, ball-vs-wall, and ball-vs-floor collisions.
- **Paddle Control** — Real-time keyboard input (left/right arrow keys) to move the paddle horizontally within play area bounds.

### Game Loop
- **Frame Rendering** — Continuous canvas-based rendering at 60 FPS (or display refresh rate).
- **Physics Update** — Position, velocity, and collision state updated each frame.
- **Input Processing** — Keyboard input captured and applied to paddle movement without lag.

### Difficulty & Settings
- **Speed Slider** — In-game UI control (range: very slow to very fast) that scales ball velocity multiplier.
- **Real-Time Adjustment** — Speed changes apply immediately to the active ball during play.

### User Interface
- **Main Menu** — Start screen with game title, start button, speed slider, and instructions.
- **In-Game Display** — Current lives counter, ball speed indicator, brick count or progress visual.
- **Game Over Screen** — Loss screen (lives exhausted) or win screen (all bricks destroyed) with restart option.
- **Menu Navigation** — Mouse/pointer-driven (no keyboard menu navigation in V1).

### Game Rules
- **Start Condition** — Player launches game from menu; ball appears at paddle center.
- **Win Condition** — All bricks destroyed; ball remains in play.
- **Loss Condition** — Ball falls below paddle (below play area); life decremented. Game over when lives reach 0.
- **Pause/Resume** — Optional: pause on Escape key; resume with same key or UI button.

## 8. High-Level Workflows

### Game Session Workflow
1. **Player opens game** → Main menu displayed.
2. **Player adjusts speed slider** (optional) → Speed indicator updates.
3. **Player clicks "Start"** → Game state enters active play; ball spawns at paddle.
4. **Player controls paddle** with arrow keys → Ball bounces; bricks destroyed on contact.
5. **Ball falls** → Life decremented; ball respawns at paddle (if lives > 0).
6. **Outcome** → All bricks destroyed (win) OR lives exhausted (loss) → Game over screen displayed.
7. **Player clicks "Play Again"** or "Return to Menu"** → Resets to step 1.

### Speed Adjustment Workflow
1. **In main menu or during pause** → Player interacts with speed slider.
2. **Slider position updates** → Ball speed multiplier changes immediately.
3. **Feedback** → Visual indicator (text, gauge, or label) shows current speed tier.
4. **In active play** → Speed change takes effect on next ball physics update.

## 9. Business Rules

1. **Lives System** — Each game begins with exactly 3 lives. One life is lost when the ball crosses the bottom boundary (below the play area). Game ends immediately when lives reach 0.

2. **Brick Destruction** — A brick is destroyed on first collision with the ball. No brick health or multi-hit mechanics. Destroyed bricks are instantly removed from the play area.

3. **Brick Layout** — Bricks are arranged in exactly 5 rows of equal-sized, evenly-spaced bricks at the top of the play area. Layout does not vary during a game session.

4. **Ball Spawning** — After a loss (ball falls), the ball respawns centered above the paddle. Player must re-engage paddle control to keep the ball in play.

5. **Paddle Bounds** — Paddle cannot move outside the left or right edges of the play area. Leftmost and rightmost positions are clamped.

6. **Speed Range** — Ball speed slider operates on a continuous range from "very slow" to "very fast." Speed multiplier is applied uniformly to both X and Y velocity components.

7. **Collision Precedence** — If the ball collides with multiple surfaces in a single frame, collisions are resolved in order: floor (loss), brick (destruction), paddle (bounce), walls/ceiling (bounce). Only one collision type is resolved per frame to prevent tunneling.

8. **Win Condition Finality** — Once all bricks are destroyed, the game is won immediately. No further play is possible until "Play Again" is selected.

9. **Speed Persistence in Session** — Speed slider value persists while the menu is open; resets to default (medium) on each new game session start.

10. **No Pausing in Loss State** — Once the ball has fallen and life is decremented, pause is disabled until the ball respawns or the player acknowledges game over.

11. **Keyboard-Only Ball Control** — Only arrow keys (left/right) control the paddle. Diagonal or modifer+key combinations are ignored. All menu navigation is mouse/pointer-driven.

## 10. Success Criteria

1. **Game is playable end-to-end** — Player can start a game, control the paddle, destroy bricks, and reach a win or loss state.

2. **Ball physics are responsive** — Ball bounces predictably off all surfaces; no tunneling or stuck-ball scenarios. Paddle impact angles influence ball trajectory naturally.

3. **Paddle is responsive** — Arrow keys produce immediate, smooth paddle movement. No input lag or jitter.

4. **Speed slider works in real-time** — Adjusting the slider during active play changes ball speed visibly without interrupting the game.

5. **Lives system is clear** — Players always see their current life count. Loss of a life is clear; game over is explicit.

6. **Win/Loss states are clear** — Game does not continue play after all bricks are destroyed. Game over screen clearly indicates win or loss.

7. **No external dependencies** — Game runs in vanilla JavaScript with no npm packages, frameworks, or build tools required.

8. **Runs in any modern browser** — HTML5 Canvas, ES6 JavaScript, and CSS3 support; works in Chrome, Firefox, Safari, Edge (current versions).

9. **Performance is smooth** — Game maintains consistent 60 FPS (or display refresh rate). No stuttering, frame drops, or memory leaks during extended play.

10. **Menu is intuitive** — Players understand the main menu, speed slider, and game over options without instructions. Buttons have clear labels and visual feedback (hover, click states).

## 11. Open Questions

1. **Default speed tier** — What is the default ball speed multiplier when a new game starts? (Suggested: 1.0x / medium speed)

2. **Speed slider granularity** — Should the slider have discrete steps (e.g., slow, medium, fast) or continuous values? How many presets?

3. **Brick arrangement** — Should bricks be arranged in a single static pattern (e.g., rainbow rows) or randomized per game?

4. **Paddle size and speed** — What are the initial dimensions and max movement speed of the paddle?

5. **Ball size and initial speed** — What is the ball radius and initial velocity magnitude?

6. **Respawn delay** — After a loss, is there a delay before the ball respawns, or does it appear immediately?

7. **Pause key behavior** — Should Escape key toggle pause, or should pause be menu-only?

8. **Win/loss screen timeout** — Do game over screens auto-dismiss after a delay, or wait for user input?

9. **Visual style** — Should the game use flat colors, gradients, or textured brick styles? Any color palette constraints?

10. **Accessibility** — Should keyboard-only play be supported without a mouse? Should text sizes be adjustable?

11. **Browser storage** — Should the speed preference be persisted across sessions in localStorage, or reset on each page load?
