# Epic 0 — MVP Breakout

## Goal

Deliver a fully playable, self-contained breakout arcade game built with vanilla JavaScript, HTML, and CSS. The MVP establishes core game mechanics: ball physics, collision detection, paddle control, brick destruction, and state management—all without external dependencies.

## Business Value

- **Accessibility**: Players can immediately engage with a responsive, intuitive arcade game experience
- **Technical Foundation**: Demonstrates core game development concepts (physics, collision detection, input handling, state management) in vanilla JavaScript
- **Engagement**: Adjustable difficulty via ball speed slider and clear game state feedback keep players engaged
- **Completeness**: Fully self-contained game with no external libraries or dependencies

## Scope

### In Scope

1. **Game Board Setup**
   - 5 rows of bricks arranged in a grid
   - Playable area with bounded dimensions
   - Paddle centered at bottom

2. **Ball Physics**
   - Continuous motion with constant velocity
   - Bouncing on vertical walls (left/right boundaries)
   - Bouncing on ceiling (top boundary)
   - Bouncing on paddle with angle adjustment based on hit location
   - Speed controlled by player slider (very slow to very fast)

3. **Paddle Control**
   - Movement via left/right arrow keys
   - Confined to playable boundaries
   - Immediate, responsive input handling

4. **Brick Destruction**
   - Ball collision detection with bricks
   - Visual removal on collision
   - Brick count tracking

5. **Life Management**
   - Start with 3 lives
   - Lose one life when ball passes below paddle
   - Ball resets to starting position after life loss
   - Game over when lives = 0

6. **Game States**
   - Menu: Start game, adjust settings, quit
   - Active: Gameplay with ball physics and paddle control
   - Pause: Suspended gameplay (if available)
   - Win: All bricks destroyed, offer replay
   - Loss: No lives remaining, offer replay

7. **Speed Adjustment**
   - Slider control ranges from very slow to very fast
   - Affects ball velocity magnitude
   - Adjustable before game starts and during play

### Out of Scope

- Level progression or multiple difficulty levels
- High score tracking or persistent data storage (beyond MVP)
- Power-ups or special abilities
- Sound or music
- Mobile touch controls (keyboard/mouse only)
- Leaderboards or multiplayer features
- Custom themes or visual customization

## Related User Stories

- US-001 — Game Setup and Initialization
- US-002 — Paddle Control and Movement
- US-003 — Ball Physics and Collision Detection
- US-004 — Brick Destruction and State Management
- US-005 — Life Management and Game Over
- US-006 — Game State Transitions (Menu, Active, Pause, Win, Loss)
- US-007 — Speed Slider Control
- US-008 — Win Condition and Victory Screen
- US-009 — Responsive Input Handling

## Related Slices

- Slice 1: Game Board and Paddle Setup
- Slice 2: Ball Physics Engine
- Slice 3: Collision Detection System
- Slice 4: Brick Destruction and Scoring
- Slice 5: Game State Management and Transitions
- Slice 6: Speed Adjustment and UI Controls
- Slice 7: Win/Loss Conditions and Final Integration
