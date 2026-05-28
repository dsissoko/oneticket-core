/**
 * Renderer — Handles all canvas and DOM rendering
 * 
 * Responsibilities:
 * - Canvas rendering: bricks, ball, paddle, background
 * - DOM rendering: lives counter, speed indicator, menu/UI
 * - Clear and draw operations
 */

class Renderer {
  constructor(canvasId = "gameCanvas") {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    
    // Canvas dimensions
    this.canvasWidth = this.canvas.width || 800;
    this.canvasHeight = this.canvas.height || 600;
    
    // Colors
    this.backgroundColor = "#1a1a1a";
    this.ballColor = "#FFFFFF";
    this.paddleColor = "#4D96FF";
    this.gridColor = "#333333";
  }

  /**
   * Main draw method - orchestrates all rendering
   * Called once per frame by game loop
   */
  draw(gameState) {
    // Clear canvas
    this.clear();
    
    // Draw game background
    this.drawBackground();
    
    // Draw game grid/guides (optional)
    this.drawGrid();
    
    // Draw bricks
    gameState.bricks.forEach(brick => {
      if (!brick.isDestroyed) {
        this.drawBrick(brick);
      }
    });
    
    // Draw ball
    this.drawBall(gameState.ball);
    
    // Draw paddle
    this.drawPaddle(gameState.paddle);
    
    // Render DOM UI
    this.renderUICounter(gameState);
    this.renderPhaseUI(gameState);
  }

  /**
   * Clear canvas - fill with background color
   */
  clear() {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  /**
   * Draw background pattern or solid color
   */
  drawBackground() {
    // Background is already filled by clear()
    // Optional: add gradient or pattern here
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, "#0f0f0f");
    gradient.addColorStop(1, "#1a1a1a");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  /**
   * Draw subtle grid for visual reference (optional)
   */
  drawGrid() {
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 0.5;
    
    // Vertical lines every 50px
    for (let x = 50; x < this.canvasWidth; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }
    
    // Horizontal lines every 50px
    for (let y = 50; y < this.canvasHeight; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw a single brick
   * brick: { x, y, width, height, color, isDestroyed }
   */
  drawBrick(brick) {
    if (brick.isDestroyed) {
      return;
    }
    
    // Draw brick rectangle
    this.ctx.fillStyle = brick.color;
    this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    
    // Draw brick border
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  }

  /**
   * Draw the ball (circle)
   * ball: { x, y, radius, vx, vy }
   */
  drawBall(ball) {
    this.ctx.fillStyle = this.ballColor;
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw subtle shadow
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  /**
   * Draw the paddle (rectangle)
   * paddle: { x, y, width, height, vx }
   */
  drawPaddle(paddle) {
    // x is center, so adjust for left edge
    const leftEdge = paddle.x - (paddle.width / 2);
    
    this.ctx.fillStyle = this.paddleColor;
    this.ctx.fillRect(leftEdge, paddle.y, paddle.width, paddle.height);
    
    // Draw paddle border
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(leftEdge, paddle.y, paddle.width, paddle.height);
    
    // Draw paddle highlight
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(leftEdge + 2, paddle.y + 2);
    this.ctx.lineTo(leftEdge + paddle.width - 2, paddle.y + 2);
    this.ctx.stroke();
  }

  /**
   * Render lives counter in DOM
   */
  renderUICounter(gameState) {
    const uiContainer = document.getElementById("ui-counter");
    if (uiContainer) {
      uiContainer.innerHTML = `
        <div class="ui-info">
          <span class="lives-counter">Lives: ${gameState.lives}</span>
          <span class="speed-indicator">Speed: ${gameState.speedMultiplier.toFixed(1)}x</span>
        </div>
      `;
    }
  }

  /**
   * Render phase-specific UI (menu, game-over, victory)
   */
  renderPhaseUI(gameState) {
    const menuOverlay = document.getElementById("menu-overlay");
    if (!menuOverlay) {
      return;
    }

    switch (gameState.phase) {
      case "menu":
        this.renderMenu();
        menuOverlay.style.display = "block";
        break;
      
      case "playing":
        menuOverlay.style.display = "none";
        break;
      
      case "victory":
        this.renderVictory();
        menuOverlay.style.display = "block";
        break;
      
      case "gameover":
        this.renderGameOver();
        menuOverlay.style.display = "block";
        break;
      
      default:
        menuOverlay.style.display = "none";
    }
  }

  /**
   * Render main menu screen
   */
  renderMenu() {
    const menuOverlay = document.getElementById("menu-overlay");
    if (!menuOverlay) return;
    
    menuOverlay.innerHTML = `
      <div class="menu-content">
        <h1>Breakout</h1>
        <p>Classic brick-breaking arcade game</p>
        <button id="btn-start" class="menu-button">Start Game</button>
        <button id="btn-options" class="menu-button">Options</button>
      </div>
    `;
    
    // Attach event listeners
    const btnStart = document.getElementById("btn-start");
    if (btnStart) {
      btnStart.addEventListener("click", () => {
        if (window.gameController) {
          window.gameController.handleStartGame();
        }
      });
    }
    
    const btnOptions = document.getElementById("btn-options");
    if (btnOptions) {
      btnOptions.addEventListener("click", () => {
        if (window.gameController) {
          window.gameController.handleOptions();
        }
      });
    }
  }

  /**
   * Render victory screen
   */
  renderVictory() {
    const menuOverlay = document.getElementById("menu-overlay");
    if (!menuOverlay) return;
    
    menuOverlay.innerHTML = `
      <div class="menu-content victory">
        <h1>You Won!</h1>
        <p>All bricks destroyed!</p>
        <button id="btn-replay" class="menu-button">Play Again</button>
        <button id="btn-menu-from-victory" class="menu-button">Return to Menu</button>
      </div>
    `;
    
    const btnReplay = document.getElementById("btn-replay");
    if (btnReplay) {
      btnReplay.addEventListener("click", () => {
        if (window.gameController) {
          window.gameController.handleReplay();
        }
      });
    }
    
    const btnMenu = document.getElementById("btn-menu-from-victory");
    if (btnMenu) {
      btnMenu.addEventListener("click", () => {
        if (window.gameController) {
          window.gameController.handleReturnToMenu();
        }
      });
    }
  }

  /**
   * Render game over screen
   */
  renderGameOver() {
    const menuOverlay = document.getElementById("menu-overlay");
    if (!menuOverlay) return;
    
    menuOverlay.innerHTML = `
      <div class="menu-content gameover">
        <h1>Game Over</h1>
        <p>No lives remaining</p>
        <button id="btn-replay-go" class="menu-button">Play Again</button>
        <button id="btn-menu-from-go" class="menu-button">Return to Menu</button>
      </div>
    `;
    
    const btnReplay = document.getElementById("btn-replay-go");
    if (btnReplay) {
      btnReplay.addEventListener("click", () => {
        if (window.gameController) {
          window.gameController.handleReplay();
        }
      });
    }
    
    const btnMenu = document.getElementById("btn-menu-from-go");
    if (btnMenu) {
      btnMenu.addEventListener("click", () => {
        if (window.gameController) {
          window.gameController.handleReturnToMenu();
        }
      });
    }
  }
}
