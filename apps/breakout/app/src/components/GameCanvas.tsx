import React, { useRef, useEffect } from 'react';
import { GameState } from '../types';
import { resolveCollision } from '../utils/collision';

// Canvas configuration constants
const CANVAS_BG_COLOR = '#f5f5f5';
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const PADDLE_MARGIN = 20;
const BALL_RADIUS = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 15;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 40;
const BRICK_SIDE_MARGIN = 40;
const TEXT_COLOR = '#333333';
const TEXT_FONT = '14px Arial';
const OVERLAY_BG = 'rgba(0, 0, 0, 0.6)';
const BUTTON_COLOR = '#2563eb';
const BUTTON_TEXT_COLOR = '#ffffff';

interface GameCanvasProps {}

export const GameCanvas: React.FC<GameCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const touchRef = useRef<{ startX: number; currentX: number; active: boolean }>({ startX: 0, currentX: 0, active: false });
  const speedMultiplierRef = useRef<number>(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas element not available');
      return;
    }

    // Set canvas size to parent container dimensions
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize 2D context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Unable to get 2D context from canvas');
      return;
    }

    // Initialize game state
    const createInitialBricks = (): GameState['bricks'] => {
      const bricks: GameState['bricks'] = [];
      const availableWidth = canvas.width - BRICK_SIDE_MARGIN * 2;
      const brickWidth = (availableWidth - (BRICK_COLS - 1) * BRICK_PADDING) / BRICK_COLS;
      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          bricks.push({
            x: BRICK_SIDE_MARGIN + col * (brickWidth + BRICK_PADDING),
            y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
            width: brickWidth,
            height: BRICK_HEIGHT,
            alive: true,
          });
        }
      }
      return bricks;
    };

    const createInitialState = (): GameState => {
      const paddleX = canvas.width / 2 - PADDLE_WIDTH / 2;
      const paddleY = canvas.height - PADDLE_HEIGHT - PADDLE_MARGIN;
      const ballX = paddleX + PADDLE_WIDTH / 2;
      const ballY = paddleY - BALL_RADIUS;

      return {
        phase: 'menu',
        ball: {
          x: ballX,
          y: ballY,
          radius: BALL_RADIUS,
          vx: 0,
          vy: 0,
        },
        paddle: {
          x: paddleX,
          y: paddleY,
          width: PADDLE_WIDTH,
          height: PADDLE_HEIGHT,
        },
        bricks: createInitialBricks(),
        lives: 3,
        speedMultiplier: 1.0,
      };
    };

    gameStateRef.current = createInitialState();

    // Rendering functions
    const renderPaddle = (state: GameState) => {
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(
        state.paddle.x,
        state.paddle.y,
        state.paddle.width,
        state.paddle.height,
      );
    };

    const renderBall = (state: GameState) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const renderBricks = (state: GameState) => {
      ctx.fillStyle = '#10b981';
      state.bricks.forEach((brick) => {
        if (brick.alive) {
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
      });
    };

    const renderUI = (state: GameState) => {
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = TEXT_FONT;
      ctx.textAlign = 'left';
      ctx.fillText(`Lives: ${state.lives}`, 20, 25);

      ctx.textAlign = 'right';
      ctx.fillText(`Speed: ${state.speedMultiplier.toFixed(1)}x`, canvas.width - 20, 25);
    };

    const renderMenuOverlay = () => {
      // Semi-transparent overlay
      ctx.fillStyle = OVERLAY_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Menu title
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BREAKOUT', canvas.width / 2, canvas.height / 2 - 100);

      // Speed slider label
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Game Speed', canvas.width / 2, canvas.height / 2 - 20);

       // Speed slider visualization
       const sliderY = canvas.height / 2 + 20;
       const sliderWidth = 200;
       const sliderX = canvas.width / 2 - sliderWidth / 2;

       ctx.strokeStyle = BUTTON_TEXT_COLOR;
       ctx.lineWidth = 2;
       ctx.strokeRect(sliderX, sliderY, sliderWidth, 20);

       const sliderProgress = (speedMultiplierRef.current - 0.5) / 1.5;
       ctx.fillStyle = BUTTON_COLOR;
       ctx.fillRect(sliderX, sliderY, sliderWidth * sliderProgress, 20);

       // Speed text
       ctx.fillStyle = BUTTON_TEXT_COLOR;
       ctx.font = '16px Arial';
       ctx.fillText(`${speedMultiplierRef.current.toFixed(1)}x`, canvas.width / 2, sliderY + 50);

      // Start button
      const buttonY = canvas.height / 2 + 120;
      const buttonWidth = 150;
      const buttonHeight = 50;
      const buttonX = canvas.width / 2 - buttonWidth / 2;

      ctx.fillStyle = BUTTON_COLOR;
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('START', canvas.width / 2, buttonY + 32);
    };

    const renderGameOverOverlay = () => {
      // Semi-transparent overlay
      ctx.fillStyle = OVERLAY_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Game Over title
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

      // Restart button
      const buttonY = canvas.height / 2 + 50;
      const buttonWidth = 150;
      const buttonHeight = 50;
      const buttonX = canvas.width / 2 - buttonWidth / 2;

      ctx.fillStyle = BUTTON_COLOR;
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('RESTART', canvas.width / 2, buttonY + 32);
    };

    const renderVictoryOverlay = () => {
      // Semi-transparent overlay
      ctx.fillStyle = OVERLAY_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Victory title
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VICTORY!', canvas.width / 2, canvas.height / 2 - 50);

      // Congratulations message
      ctx.font = '20px Arial';
      ctx.fillText('You destroyed all bricks!', canvas.width / 2, canvas.height / 2 + 20);

      // Restart button
      const buttonY = canvas.height / 2 + 100;
      const buttonWidth = 150;
      const buttonHeight = 50;
      const buttonX = canvas.width / 2 - buttonWidth / 2;

      ctx.fillStyle = BUTTON_COLOR;
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('RESTART', canvas.width / 2, buttonY + 32);
    };

    const renderFrame = (state: GameState) => {
      // Clear canvas
      ctx.fillStyle = CANVAS_BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render game objects only during playing phase
      if (state.phase === 'playing') {
        renderBricks(state);
        renderPaddle(state);
        renderBall(state);
        renderUI(state);
      } else if (state.phase === 'menu') {
        renderMenuOverlay();
      } else if (state.phase === 'gameOver') {
        renderGameOverOverlay();
      } else if (state.phase === 'victory') {
        renderVictoryOverlay();
      }
    };

    // Restart game function
    const restartGame = () => {
      const state = gameStateRef.current;
      if (state) {
        const newState = createInitialState();
        gameStateRef.current = newState;
        console.log('Phase: gameOver/victory → menu');
        console.log('Lives: reset to 3');
      }
    };

    // Start game function
    const startGame = () => {
      const state = gameStateRef.current;
      if (state) {
        const oldPhase = state.phase;
        state.phase = 'playing';
        state.ball.vx = 300;
        state.ball.vy = -300;
        console.log(`Phase: ${oldPhase} → playing`);
      }
    };

    // Mouse click handler for buttons and slider
    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const state = gameStateRef.current;
      if (!state) return;

      if (state.phase === 'menu') {
        // Check slider click (horizontal drag handling simplified for click)
        const sliderY = canvas.height / 2 + 20;
        const sliderWidth = 200;
        const sliderX = canvas.width / 2 - sliderWidth / 2;

          if (y >= sliderY && y <= sliderY + 20 && x >= sliderX && x <= sliderX + sliderWidth) {
            const sliderProgress = (x - sliderX) / sliderWidth;
            const newMultiplier = Math.max(0.5, Math.min(2.0, 0.5 + sliderProgress * 1.5));
            speedMultiplierRef.current = newMultiplier;
            state.speedMultiplier = newMultiplier;
            console.log(`Speed Multiplier: ${(newMultiplier - 0.1).toFixed(1)}x → ${newMultiplier.toFixed(1)}x`);
            return;
          }

        // Check start button
        const buttonY = canvas.height / 2 + 120;
        const buttonWidth = 150;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;

        if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
          startGame();
        }
      } else if (state.phase === 'gameOver' || state.phase === 'victory') {
        // Check restart button
        const buttonY = canvas.height / 2 + (state.phase === 'gameOver' ? 50 : 100);
        const buttonWidth = 150;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;

        if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
          restartGame();
        }
      }
    };

    // Mouse move handler — slider during menu only
    const handleCanvasMouseMove = (event: MouseEvent) => {
      const state = gameStateRef.current;
      if (!state || state.phase !== 'menu') return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const sliderY = canvas.height / 2 + 20;
      const sliderWidth = 200;
      const sliderX = canvas.width / 2 - sliderWidth / 2;

        if (y >= sliderY && y <= sliderY + 20 && x >= sliderX && x <= sliderX + sliderWidth) {
           const sliderProgress = (x - sliderX) / sliderWidth;
           const newMultiplier = Math.max(0.5, Math.min(2.0, 0.5 + sliderProgress * 1.5));
           speedMultiplierRef.current = newMultiplier;
           state.speedMultiplier = newMultiplier;
         }
    };

    // Keyboard handlers — paddle moves with arrow keys
    const PADDLE_SPEED = 400; // pixels per second
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft')  keysRef.current.left  = true;
      if (event.key === 'ArrowRight') keysRef.current.right = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft')  keysRef.current.left  = false;
      if (event.key === 'ArrowRight') keysRef.current.right = false;
    };

    // Touch handlers — paddle moves with touch swipe on mobile
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        touchRef.current.startX = touch.clientX;
        touchRef.current.currentX = touch.clientX;
        touchRef.current.active = true;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchRef.current.active || event.touches.length === 0) return;
      const touch = event.touches[0];
      touchRef.current.currentX = touch.clientX;
    };

    const handleTouchEnd = () => {
      touchRef.current.active = false;
    };

    // Game loop
    let animationFrameId: number;
    let collisionCount = 0;

    const gameLoop = (currentTime: number) => {
      frameCountRef.current++;

      // Calculate deltaTime in seconds
      let deltaTime = 0;
      if (lastTimeRef.current > 0) {
        deltaTime = (currentTime - lastTimeRef.current) / 1000;
      }
      lastTimeRef.current = currentTime;

      // Log frame info in development
      if (frameCountRef.current % 60 === 0) {
        console.log(`Frame: ${frameCountRef.current}, DeltaTime: ${deltaTime.toFixed(3)}s, Collisions: ${collisionCount}`);
        collisionCount = 0;
      }

       const state = gameStateRef.current;
       if (state && state.phase === 'playing') {
         // Move paddle with arrow keys
         if (keysRef.current.left) {
           state.paddle.x = Math.max(0, state.paddle.x - PADDLE_SPEED * deltaTime);
         }
         if (keysRef.current.right) {
           state.paddle.x = Math.min(canvas.width - state.paddle.width, state.paddle.x + PADDLE_SPEED * deltaTime);
         }

         // Move paddle with touch swipe (mobile)
         if (touchRef.current.active) {
           const deltaX = touchRef.current.currentX - touchRef.current.startX;
           // Update paddle position based on touch delta
           const newPaddleX = state.paddle.x + deltaX;
           state.paddle.x = Math.max(0, Math.min(canvas.width - state.paddle.width, newPaddleX));
           // Update start position for smooth continuous tracking
           touchRef.current.startX = touchRef.current.currentX;
         }

         // Update ball position with speed multiplier applied
         state.ball.x += state.ball.vx * deltaTime * state.speedMultiplier;
         state.ball.y += state.ball.vy * deltaTime * state.speedMultiplier;

        // Clamp ball horizontally only
        const ballDiameter = state.ball.radius * 2;
        state.ball.x = Math.max(0, Math.min(state.ball.x, canvas.width - ballDiameter));

        // Ball passed below the paddle — lose a life
        if (state.ball.y - state.ball.radius > state.paddle.y + state.paddle.height) {
          const oldLives = state.lives;
          state.lives--;
          console.log(`Lives: ${oldLives} → ${state.lives}`);

          if (state.lives === 0) {
            state.phase = 'gameOver';
            console.log('Phase: playing → gameOver');
          } else {
            // Reset ball on paddle
            state.ball.x = state.paddle.x + state.paddle.width / 2;
            state.ball.y = state.paddle.y - state.ball.radius;
            state.ball.vx = 300;
            state.ball.vy = -300;
          }
        }

        // Collision Detection — walls, paddle, bricks
         const leftWallRect   = { x: -10,         y: 0, width: 10,          height: canvas.height };
         const rightWallRect  = { x: canvas.width, y: 0, width: 10,          height: canvas.height };
         const topWallRect    = { x: 0,            y: -10, width: canvas.width, height: 10 };

         for (const obstacle of [leftWallRect, rightWallRect, topWallRect, state.paddle]) {
           const r = resolveCollision(state.ball, obstacle);
           if (r.hit) {
             state.ball.vx = r.vx;
             state.ball.vy = r.vy;
             state.ball.x  = r.nx;
             state.ball.y  = r.ny;
             collisionCount++;
           }
         }

         // Brick collisions — only first hit per frame to avoid tunneling
         for (const brick of state.bricks) {
           if (!brick.alive) continue;
           const r = resolveCollision(state.ball, brick);
           if (r.hit) {
             state.ball.vx = r.vx;
             state.ball.vy = r.vy;
             state.ball.x  = r.nx;
             state.ball.y  = r.ny;
             brick.alive = false;
             collisionCount++;
             break; // one brick per frame
           }
         }

        // Remove destroyed bricks
        state.bricks = state.bricks.filter((brick) => brick.alive);

        // Check victory condition (all bricks destroyed)
        if (state.bricks.length === 0) {
          state.phase = 'victory';
          console.log('Phase: playing → victory');
        }
      }

      // Render current frame
      if (state) {
        renderFrame(state);
      }

      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Add event listeners
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        cursor: 'default',
      }}
    />
  );
};

export default GameCanvas;
