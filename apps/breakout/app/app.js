/**
 * Breakout Game - Complete Implementation
 * Pure JavaScript (Vanilla JS) - No external dependencies
 * 
 * Components:
 * 1. Game Engine - Main loop with requestAnimationFrame
 * 2. Paddle - Keyboard/Mouse controls
 * 3. Ball - Physics and collision detection
 * 4. Bricks - Grid management and collision
 * 5. Score - Points system
 * 6. GameState - State management (playing, game-over, victory)
 * 7. Renderer - Canvas rendering
 */

// ============================================================================
// GAME CONFIGURATION
// ============================================================================
const GAME_CONFIG = {
  canvasWidth: 800,
  canvasHeight: 600,
  paddleWidth: 80,
  paddleHeight: 10,
  paddleSpeed: 6,
  ballRadius: 5,
  ballSpeed: 4,
  brickRows: 4,
  brickCols: 8,
  brickWidth: 90,
  brickHeight: 15,
  brickPadding: 5,
  brickOffsetTop: 30,
  brickOffsetLeft: 10,
  pointsPerBrick: 10
};

// ============================================================================
// GAME STATE MANAGEMENT
// ============================================================================
class GameState {
  constructor() {
    this.state = 'playing'; // 'playing', 'game-over', 'victory'
    this.isPaused = false;
  }

  setState(newState) {
    this.state = newState;
  }

  getState() {
    return this.state;
  }

  setPaused(paused) {
    this.isPaused = paused;
  }

  isPausedState() {
    return this.isPaused;
  }
}

// ============================================================================
// SCORE SYSTEM
// ============================================================================
class Score {
  constructor() {
    this.currentScore = 0;
    this.highScore = this.loadHighScore();
  }

  addPoints(points) {
    this.currentScore += points;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore();
    }
  }

  getCurrentScore() {
    return this.currentScore;
  }

  getHighScore() {
    return this.highScore;
  }

  reset() {
    this.currentScore = 0;
  }

  saveHighScore() {
    localStorage.setItem('breakout_high_score', this.highScore);
  }

  loadHighScore() {
    const saved = localStorage.getItem('breakout_high_score');
    return saved ? parseInt(saved) : 0;
  }
}

// ============================================================================
// PADDLE CONTROL
// ============================================================================
class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2 - GAME_CONFIG.paddleWidth / 2;
    this.y = canvasHeight - 20;
    this.width = GAME_CONFIG.paddleWidth;
    this.height = GAME_CONFIG.paddleHeight;
    this.speed = GAME_CONFIG.paddleSpeed;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    this.keys = {};
    this.mouseX = canvasWidth / 2;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    window.addEventListener('mousemove', (e) => {
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
    });
  }

  update() {
    // Keyboard controls
    if (this.keys['ArrowLeft']) {
      this.x -= this.speed;
    }
    if (this.keys['ArrowRight']) {
      this.x += this.speed;
    }

    // Mouse control (center paddle on mouse)
    this.x = this.mouseX - this.width / 2;

    // Keep paddle within bounds
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.width > this.canvasWidth) {
      this.x = this.canvasWidth - this.width;
    }
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}

// ============================================================================
// BALL PHYSICS AND COLLISION
// ============================================================================
class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 40;
    this.radius = GAME_CONFIG.ballRadius;
    this.speed = GAME_CONFIG.ballSpeed;
    this.vx = this.speed * 0.7;
    this.vy = -this.speed * 0.7;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Wall collisions (left and right)
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx;
    }
    if (this.x + this.radius > this.canvasWidth) {
      this.x = this.canvasWidth - this.radius;
      this.vx = -this.vx;
    }

    // Top collision
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = -this.vy;
    }
  }

  checkPaddleCollision(paddle) {
    const bounds = paddle.getBounds();
    const ballBounds = {
      left: this.x - this.radius,
      right: this.x + this.radius,
      top: this.y - this.radius,
      bottom: this.y + this.radius
    };

    // Check if ball overlaps with paddle
    if (ballBounds.right > bounds.left &&
        ballBounds.left < bounds.right &&
        ballBounds.bottom > bounds.top &&
        ballBounds.top < bounds.bottom) {
      
      // Ball hit paddle
      if (this.vy > 0) {
        this.y = bounds.top - this.radius;
        this.vy = -this.vy;

        // Add spin based on where ball hit paddle
        const paddleCenter = bounds.left + (bounds.right - bounds.left) / 2;
        const diff = this.x - paddleCenter;
        const maxDiff = (bounds.right - bounds.left) / 2;
        this.vx = (diff / maxDiff) * this.speed;
      }

      return true;
    }

    return false;
  }

  checkBrickCollision(brick) {
    const ballBounds = {
      left: this.x - this.radius,
      right: this.x + this.radius,
      top: this.y - this.radius,
      bottom: this.y + this.radius
    };

    const brickBounds = {
      left: brick.x,
      right: brick.x + brick.width,
      top: brick.y,
      bottom: brick.y + brick.height
    };

    // Check overlap
    if (ballBounds.right > brickBounds.left &&
        ballBounds.left < brickBounds.right &&
        ballBounds.bottom > brickBounds.top &&
        ballBounds.top < brickBounds.bottom) {
      
      // Determine collision side
      const overlapLeft = ballBounds.right - brickBounds.left;
      const overlapRight = brickBounds.right - ballBounds.left;
      const overlapTop = ballBounds.bottom - brickBounds.top;
      const overlapBottom = brickBounds.bottom - ballBounds.top;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop || minOverlap === overlapBottom) {
        this.vy = -this.vy;
      } else {
        this.vx = -this.vx;
      }

      return true;
    }

    return false;
  }

  isOutOfBounds() {
    return this.y - this.radius > this.canvasHeight;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  reset(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 40;
    this.vx = this.speed * 0.7;
    this.vy = -this.speed * 0.7;
  }
}

// ============================================================================
// BRICKS GRID AND MANAGEMENT
// ============================================================================
class Bricks {
  constructor() {
    this.bricks = [];
    this.createGrid();
  }

  createGrid() {
    this.bricks = [];
    const { brickRows, brickCols, brickWidth, brickHeight, brickOffsetLeft, brickOffsetTop, brickPadding } = GAME_CONFIG;

    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        const brick = {
          x: col * (brickWidth + brickPadding) + brickOffsetLeft,
          y: row * (brickHeight + brickPadding) + brickOffsetTop,
          width: brickWidth,
          height: brickHeight,
          active: true
        };
        this.bricks.push(brick);
      }
    }
  }

  getBricks() {
    return this.bricks.filter(brick => brick.active);
  }

  getAllBricks() {
    return this.bricks;
  }

  removeBrick(brick) {
    brick.active = false;
  }

  isAllBricksDestroyed() {
    return this.bricks.every(brick => !brick.active);
  }

  reset() {
    this.createGrid();
  }
}

// ============================================================================
// GAME ENGINE - MAIN LOOP
// ============================================================================
class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = GAME_CONFIG.canvasWidth;
    this.canvas.height = GAME_CONFIG.canvasHeight;

    // Initialize components
    this.gameState = new GameState();
    this.score = new Score();
    this.paddle = new Paddle(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    this.ball = new Ball(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    this.bricks = new Bricks();
    this.renderer = new Renderer(this.ctx);

    this.setupEventListeners();
    this.start();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        this.gameState.setPaused(!this.gameState.isPausedState());
      }
      if (e.key === 'r' || e.key === 'R') {
        this.reset();
      }
    });
  }

  update() {
    if (this.gameState.isPausedState()) {
      return;
    }

    // Update game objects
    this.paddle.update();
    this.ball.update();

    // Check paddle collision
    this.ball.checkPaddleCollision(this.paddle);

    // Check brick collisions
    const activeBricks = this.bricks.getBricks();
    for (let brick of activeBricks) {
      if (this.ball.checkBrickCollision(brick)) {
        this.bricks.removeBrick(brick);
        this.score.addPoints(GAME_CONFIG.pointsPerBrick);
        break; // Only one collision per frame
      }
    }

    // Check victory
    if (this.bricks.isAllBricksDestroyed()) {
      this.gameState.setState('victory');
    }

    // Check game over
    if (this.ball.isOutOfBounds()) {
      this.gameState.setState('game-over');
    }
  }

  render() {
    this.renderer.clearCanvas(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

    // Render game objects
    const paddlePos = this.paddle.getPosition();
    this.renderer.drawPaddle(paddlePos.x, paddlePos.y, paddlePos.width, paddlePos.height);

    const ballPos = this.ball.getPosition();
    this.renderer.drawBall(ballPos.x, ballPos.y, this.ball.radius);

    const bricks = this.bricks.getAllBricks();
    for (let brick of bricks) {
      if (brick.active) {
        this.renderer.drawBrick(brick.x, brick.y, brick.width, brick.height);
      }
    }

    // Render UI
    this.renderer.drawScore(this.score.getCurrentScore(), this.score.getHighScore());
    this.renderer.drawGameState(this.gameState.getState(), this.gameState.isPausedState());
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.gameLoop();
  }

  reset() {
    this.gameState.setState('playing');
    this.score.reset();
    this.ball.reset(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    this.bricks.reset();
    this.paddle.x = GAME_CONFIG.canvasWidth / 2 - GAME_CONFIG.paddleWidth / 2;
  }
}

// ============================================================================
// RENDERER - CANVAS GRAPHICS
// ============================================================================
class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clearCanvas(width, height) {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, width, height);
  }

  drawPaddle(x, y, width, height) {
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#00cc00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
  }

  drawBall(x, y, radius) {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffcc00';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawBrick(x, y, width, height) {
    this.ctx.fillStyle = '#ff6600';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#ff4400';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  drawScore(currentScore, highScore) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Score: ${currentScore}`, 10, 20);
    this.ctx.fillText(`High: ${highScore}`, 200, 20);
  }

  drawGameState(state, isPaused) {
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';

    if (isPaused && state === 'playing') {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fillText('PAUSED', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2);
    }

    if (state === 'game-over') {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      this.ctx.fillText('GAME OVER', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2);
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Press R to restart', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 50);
    }

    if (state === 'victory') {
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      this.ctx.fillText('VICTORY!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2);
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Press R to play again', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 50);
    }

    this.ctx.textAlign = 'left';
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game engine
  const gameEngine = new GameEngine('gameCanvas');
});
