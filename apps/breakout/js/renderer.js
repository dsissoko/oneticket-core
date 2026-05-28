/**
 * Renderer.js
 * Renders all game objects on canvas and DOM elements.
 * Handles both canvas graphics and UI/menu overlays.
 */

class Renderer {
  /**
   * Initialize renderer with canvas reference.
   * @param {HTMLCanvasElement} canvas - Game canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
  }

  /**
   * Main render function: draw entire game frame.
   * @param {Object} gameState - Current game state
   */
  draw(gameState) {
    // Clear canvas
    this.clearCanvas();

    // Draw background
    this.drawBackground();

    // Draw game objects
    this.drawBricks(gameState.bricks);
    this.drawBall(gameState.ball);
    this.drawPaddle(gameState.paddle);

    // Update UI display
    this.updateUIPanel(gameState);

    // Render phase-specific overlays
    if (gameState.phase === 'menu') {
      this.renderMenu();
    } else if (gameState.phase === 'victory') {
      this.renderVictory();
    } else if (gameState.phase === 'gameover') {
      this.renderGameOver();
    }
  }

  /**
   * Clear canvas with background color.
   */
  clearCanvas() {
    this.ctx.fillStyle = '#0f0f0f';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  /**
   * Draw background (gradient or pattern).
   */
  drawBackground() {
    // Optional: add gradient or pattern here
    // For now, background is solid color from clearCanvas
  }

  /**
   * Draw all active bricks.
   * @param {Array} bricks - Array of brick objects
   */
  drawBricks(bricks) {
    for (const brick of bricks) {
      if (!brick.isDestroyed) {
        this.drawBrick(brick);
      }
    }
  }

  /**
   * Draw a single brick.
   * @param {Object} brick - Brick object
   */
  drawBrick(brick) {
    this.ctx.fillStyle = brick.color;
    this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    // Optional: draw border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  }

  /**
   * Draw ball (circle).
   * @param {Object} ball - Ball object
   */
  drawBall(ball) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Optional: add glow effect
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * Draw paddle (rectangle).
   * @param {Object} paddle - Paddle object
   */
  drawPaddle(paddle) {
    this.ctx.fillStyle = '#4ade80';
    this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Optional: draw border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  /**
   * Update UI panel (lives counter, speed indicator).
   * @param {Object} gameState - Current game state
   */
  updateUIPanel(gameState) {
    const livesElement = document.querySelector('.lives-counter span');
    const speedElement = document.querySelector('.speed-indicator span');

    if (livesElement) {
      livesElement.textContent = gameState.lives;
    }

    if (speedElement) {
      speedElement.textContent = gameState.speedMultiplier.toFixed(1) + 'x';
    }
  }

  /**
   * Render main menu overlay.
   */
  renderMenu() {
    const menuOverlay = document.getElementById('menu-overlay');
    const menuContent = document.getElementById('menu-content');

    if (!menuOverlay) return;

    menuOverlay.classList.remove('hidden');

    menuContent.innerHTML = `
      <div class="menu-title">BREAKOUT</div>
      <div class="menu-subtitle">Classic Arcade Game</div>
      <button class="menu-button" id="start-button">Start Game</button>
      <button class="menu-button secondary" id="options-button">Options</button>
    `;
  }

  /**
   * Render victory/win screen overlay.
   */
  renderVictory() {
    const menuOverlay = document.getElementById('menu-overlay');
    const menuContent = document.getElementById('menu-content');

    if (!menuOverlay) return;

    menuOverlay.classList.remove('hidden');

    menuContent.innerHTML = `
      <div class="menu-title">VICTORY!</div>
      <div class="menu-text victory">You destroyed all bricks!</div>
      <button class="menu-button" id="replay-button">Play Again</button>
      <button class="menu-button secondary" id="return-button">Return to Menu</button>
    `;
  }

  /**
   * Render game-over screen overlay.
   */
  renderGameOver() {
    const menuOverlay = document.getElementById('menu-overlay');
    const menuContent = document.getElementById('menu-content');

    if (!menuOverlay) return;

    menuOverlay.classList.remove('hidden');

    menuContent.innerHTML = `
      <div class="menu-title">GAME OVER</div>
      <div class="menu-text gameover">You ran out of lives!</div>
      <button class="menu-button" id="replay-button">Play Again</button>
      <button class="menu-button secondary" id="return-button">Return to Menu</button>
    `;
  }

  /**
   * Render options menu overlay.
   */
  renderOptions() {
    const menuOverlay = document.getElementById('menu-overlay');
    const menuContent = document.getElementById('menu-content');

    if (!menuOverlay) return;

    menuOverlay.classList.remove('hidden');

    menuContent.innerHTML = `
      <div class="menu-title">Options</div>
      <div class="slider-container">
        <label class="slider-label">Game Speed</label>
        <input type="range" id="speed-slider" min="0.5" max="2.0" step="0.1" value="1.0">
        <div class="slider-value"><span id="speed-value">1.0</span>x</div>
      </div>
      <button class="menu-button secondary" id="back-button">Back</button>
    `;
  }

  /**
   * Hide menu overlay.
   */
  hideMenuOverlay() {
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
      menuOverlay.classList.add('hidden');
    }
  }

  /**
   * Set canvas dimensions (if needed for responsive design).
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  setCanvasDimensions(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}
