/**
 * Breakout Game - Complete Vanilla JS Implementation
 * 
 * This file implements the complete Breakout/Brick-Breaker game with:
 * - Game Engine & State Machine (menu, playing, gameOver, victory)
 * - Game Objects: Paddle, Ball, Brick
 * - Physics & Collision Detection
 * - Scoring System
 * - Input Handling (keyboard & mouse)
 * - Game Over & Victory Logic
 * - Canvas Rendering
 */

// ============================================================================
// GAME ENGINE & STATE MACHINE
// ============================================================================

const Game = {
  // Canvas and context
  canvas: null,
  ctx: null,

  // Game state (menu, playing, gameOver, victory)
  state: 'menu',

  // Game objects
  paddle: null,
  ball: null,
  bricks: [],

  // Scoring
  score: 0,

  // Timing for delta time calculation
  lastTime: 0,
  deltaTime: 0,

  // Input state
  input: {
    leftPressed: false,
    rightPressed: false,
    mouseX: 0,
  },

  /**
   * Initialize the game
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Initialize game objects
    this.paddle = new Paddle(
      canvas.width / 2 - 50,
      canvas.height - 20,
      100,
      15
    );
    this.ball = new Ball(
      canvas.width / 2,
      canvas.height - 40,
      6,
      0,
      0
    );
    this.initializeBricks();

    // Setup input handlers
    this.setupInputHandlers();

    // Reset score
    this.score = 0;
    this.state = 'menu';

    // Start the game loop
    this.lastTime = Date.now();
    this.gameLoop();
  },

  /**
   * Initialize the brick grid
   * 5 rows x 8 columns = 40 bricks total
   */
  initializeBricks() {
    this.bricks = [];
    const brickWidth = 80;
    const brickHeight = 15;
    const padding = 5;
    const offsetTop = 30;
    const offsetLeft = 20;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        const x = offsetLeft + col * (brickWidth + padding);
        const y = offsetTop + row * (brickHeight + padding);
        const color = colors[row];
        this.bricks.push(new Brick(x, y, brickWidth, brickHeight, color));
      }
    }
  },

  /**
   * Setup keyboard and mouse input handlers
   */
  setupInputHandlers() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.input.leftPressed = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.input.rightPressed = true;
      }
      // Space to start/restart game
      if (e.code === 'Space') {
        if (this.state === 'menu') {
          this.startGame();
        } else if (this.state === 'gameOver' || this.state === 'victory') {
          this.restartGame();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.input.leftPressed = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.input.rightPressed = false;
      }
    });

    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseX = e.clientX - rect.left;
    });
  },

  /**
   * Main game loop using requestAnimationFrame
   */
  gameLoop() {
    // Calculate delta time
    const currentTime = Date.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Clamp delta time to prevent large jumps
    if (this.deltaTime > 0.016) {
      this.deltaTime = 0.016; // Cap at ~60fps
    }

    // Update game state
    this.update();

    // Render game
    this.render();

    // Schedule next frame
    requestAnimationFrame(() => this.gameLoop());
  },

  /**
   * Update game logic
   */
  update() {
    if (this.state === 'playing') {
      // Update paddle position based on input
      this.updatePaddlePosition();

      // Update ball
      this.ball.update(this.deltaTime, this.canvas);

      // Check collisions
      this.checkCollisions();

      // Check win condition
      if (this.bricks.length === 0) {
        this.state = 'victory';
      }

      // Check lose condition
      if (this.ball.y > this.canvas.height) {
        this.state = 'gameOver';
      }
    }
  },

  /**
   * Update paddle position based on input
   */
  updatePaddlePosition() {
    const paddleSpeed = 300; // pixels per second
    const distance = paddleSpeed * this.deltaTime;

    if (this.input.leftPressed) {
      this.paddle.x = Math.max(0, this.paddle.x - distance);
    }
    if (this.input.rightPressed) {
      this.paddle.x = Math.min(
        this.canvas.width - this.paddle.width,
        this.paddle.x + distance
      );
    }

    // Also allow mouse control (optional)
    // Uncomment to enable mouse control:
    // this.paddle.x = Math.max(0, Math.min(
    //   this.canvas.width - this.paddle.width,
    //   this.input.mouseX - this.paddle.width / 2
    // ));
  },

  /**
   * Check all collisions
   */
  checkCollisions() {
    // Ball-paddle collision
    this.checkBallPaddleCollision();

    // Ball-brick collisions
    this.checkBallBrickCollisions();
  },

  /**
   * Check collision between ball and paddle
   */
  checkBallPaddleCollision() {
    const ball = this.ball;
    const paddle = this.paddle;

    // Simple AABB collision detection
    if (
      ball.x + ball.radius > paddle.x &&
      ball.x - ball.radius < paddle.x + paddle.width &&
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height
    ) {
      // Collision detected - bounce ball upward
      ball.vy = -Math.abs(ball.vy);

      // Add spin based on where the ball hit the paddle
      const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.vx += hitPos * 100;

      // Ensure ball doesn't get stuck
      ball.y = paddle.y - ball.radius;
    }
  },

  /**
   * Check collisions between ball and bricks
   */
  checkBallBrickCollisions() {
    const ball = this.ball;

    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];

      // AABB collision detection
      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
      ) {
        // Determine collision side and bounce accordingly
        const overlapLeft = ball.x + ball.radius - brick.x;
        const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
        const overlapTop = ball.y + ball.radius - brick.y;
        const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          // Horizontal collision
          ball.vx = -ball.vx;
        } else {
          // Vertical collision
          ball.vy = -ball.vy;
        }

        // Remove brick
        this.bricks.splice(i, 1);

        // Add to score
        this.score += 10;

        // Only handle one collision per frame
        break;
      }
    }
  },

  /**
   * Render the game
   */
  render() {
    // Clear canvas (black background)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render game objects
    if (this.state === 'playing') {
      this.paddle.render(this.ctx);
      this.ball.render(this.ctx);
      this.bricks.forEach((brick) => brick.render(this.ctx));
    }

    // Render score
    this.renderScore();

    // Render state-specific UI
    if (this.state === 'menu') {
      this.renderMenu();
    } else if (this.state === 'gameOver') {
      this.renderGameOver();
    } else if (this.state === 'victory') {
      this.renderVictory();
    }
  },

  /**
   * Render the score
   */
  renderScore() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '18px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
  },

  /**
   * Render menu screen
   */
  renderMenu() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('BREAKOUT', this.canvas.width / 2, 100);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press SPACE to Start', this.canvas.width / 2, 200);
    this.ctx.fillText('or click the button below', this.canvas.width / 2, 240);

    this.ctx.font = '18px Arial';
    this.ctx.fillText('Use Arrow Keys or A/D to move', this.canvas.width / 2, 310);
    this.ctx.fillText('Destroy all bricks to win!', this.canvas.width / 2, 350);

    this.ctx.textAlign = 'left';
  },

  /**
   * Render game over screen
   */
  renderGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, 150);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '32px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 250);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press SPACE to Restart', this.canvas.width / 2, 350);

    this.ctx.textAlign = 'left';
  },

  /**
   * Render victory screen
   */
  renderVictory() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('YOU WIN!', this.canvas.width / 2, 150);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '32px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 250);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press SPACE to Play Again', this.canvas.width / 2, 350);

    this.ctx.textAlign = 'left';
  },

  /**
   * Start the game
   */
  startGame() {
    this.state = 'playing';
    this.score = 0;
    this.initializeBricks();
    
    // Reset ball position and velocity
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height - 40;
    this.ball.vx = 150; // Initial velocity
    this.ball.vy = -150;
    
    // Reset paddle position
    this.paddle.x = this.canvas.width / 2 - this.paddle.width / 2;
  },

  /**
   * Restart the game
   */
  restartGame() {
    this.startGame();
  },

  /**
   * Return to menu
   */
  returnToMenu() {
    this.state = 'menu';
    this.score = 0;
  },
};

// ============================================================================
// GAME OBJECTS
// ============================================================================

/**
 * Paddle class
 */
class Paddle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  render(ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add a subtle border
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

/**
 * Ball class
 */
class Ball {
  constructor(x, y, radius, vx, vy) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
  }

  /**
   * Update ball position with delta time
   * @param {number} deltaTime - Time since last frame (in seconds)
   * @param {HTMLCanvasElement} canvas - The game canvas
   */
  update(deltaTime, canvas) {
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Bounce off left wall
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx;
    }

    // Bounce off right wall
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx = -this.vx;
    }

    // Bounce off top wall
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = -this.vy;
    }

    // Note: Bottom collision (game over) is handled in Game.update()
  }

  render(ctx) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Add a subtle shine
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Brick class
 */
class Brick {
  constructor(x, y, width, height, color = '#4ECDC4') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add border for definition
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the game when the page loads
 */
function initializeGame() {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    Game.init(canvas);
  } else {
    console.error('Canvas element not found');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

/**
 * Export Game object for testing
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Game, Paddle, Ball, Brick };
}
