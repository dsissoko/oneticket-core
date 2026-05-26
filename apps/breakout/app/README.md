# Breakout — A Classic Brick-Breaker Game

## How to Play

Control the paddle using your keyboard or mouse to keep the ball in play. Use the **Arrow Keys** (←/→) or **A/D keys** to move the paddle left and right. Alternatively, you can move your mouse to control the paddle position. The objective is to break all the bricks on the screen by bouncing the ball into them. Don't let the ball fall below the paddle, or you'll lose!

## Features

The Breakout MVP includes six core capabilities:

1. **Game Canvas Setup** — A responsive 800×600px canvas with a visible border and a "Start Game" button to begin gameplay
2. **Paddle Control** — Full paddle control via keyboard (Arrow Keys/A-D) and mouse movement with smooth, responsive motion
3. **Ball Physics** — Realistic ball movement with gravity-independent velocity, wall bouncing, and paddle/brick collision detection
4. **Brick Grid** — Auto-generated 5×8 brick grid (40 bricks total) with progressive destruction as the ball collides
5. **Scoring System** — Real-time score tracking displayed on-screen, incrementing 10 points per brick destroyed
6. **Game States** — Complete state machine handling menu, active gameplay, game over, and victory conditions

## Getting Started

To play the game:

1. Open the `index.html` file in your web browser
2. Click the "Start Game" button
3. Use your keyboard or mouse to control the paddle
4. Break all the bricks to win!

No build process, no dependencies—just open and play.

## Technical Details

Breakout is built entirely in **vanilla JavaScript** with no frameworks or external libraries. The game uses:

- **Vanilla JS** — Pure JavaScript for game logic and state management
- **HTML5 Canvas** — 2D drawing context for rendering game objects
- **CSS3** — Styling and layout without any CSS frameworks
- **RequestAnimationFrame** — Hardware-accelerated animation loop for smooth 60 FPS gameplay

The codebase is minimal, self-contained, and educational.

## Project Structure

The Breakout app consists of three core files:

- **`index.html`** — The entry point; defines the canvas element (800×600px), loads the CSS stylesheet and JavaScript game engine, and provides the "Start Game" button
- **`style.css`** — Handles all styling: canvas centering, borders, button styling, score display, and responsive layout. Uses a classic dark theme (black background, white text, colorful bricks)
- **`game.js`** — The complete game engine; implements the game state machine, ball physics, paddle control, brick grid, collision detection, scoring, and win/lose conditions
