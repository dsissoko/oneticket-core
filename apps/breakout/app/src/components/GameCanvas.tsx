import React, { useRef, useEffect } from 'react';
import { GameState } from '../types';
import { checkCircleAABB, resolveBallCollision } from '../utils/collision';

// Canvas configuration constants
const CANVAS_BG_COLOR = '#f5f5f5';
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const PADDLE_MARGIN = 20;
const BALL_RADIUS = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 15;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 20;
const TEXT_COLOR = '#333333';
const TEXT_FONT = '14px Arial';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas element not available');
      return;
    }

    // Set canvas size to window dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          bricks.push({
            x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
            y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            alive: true,
          });
        }
      }
      return bricks;
    };

    const paddleX = canvas.width / 2 - PADDLE_WIDTH / 2;
    const paddleY = canvas.height - PADDLE_HEIGHT - PADDLE_MARGIN;
    const ballX = paddleX + PADDLE_WIDTH / 2;
    const ballY = paddleY - BALL_RADIUS;

    gameStateRef.current = {
      phase: 'playing',
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

    const renderFrame = (state: GameState) => {
      // Clear canvas
      ctx.fillStyle = CANVAS_BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render game objects
      renderBricks(state);
      renderPaddle(state);
      renderBall(state);

      // Render UI text
      renderUI(state);
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
      if (state) {
        // 2a. Update ball position: x += vx * dt, y += vy * dt
        state.ball.x += state.ball.vx * deltaTime;
        state.ball.y += state.ball.vy * deltaTime;

        // 2b. Clamp ball position to canvas bounds (no pass-through)
        const ballDiameter = state.ball.radius * 2;
        state.ball.x = Math.max(0, Math.min(state.ball.x, canvas.width - ballDiameter));
        state.ball.y = Math.max(0, Math.min(state.ball.y, canvas.height - ballDiameter));

        // 3. Collision Detection Phase
        // 3a. Check walls (left, right, top) → resolve vx or vy
        const leftWallRect = { x: -10, y: 0, width: 10, height: canvas.height };
        const rightWallRect = { x: canvas.width, y: 0, width: 10, height: canvas.height };
        const topWallRect = { x: 0, y: -10, width: canvas.width, height: 10 };

        if (checkCircleAABB(state.ball, leftWallRect)) {
          const resolution = resolveBallCollision(state.ball, leftWallRect);
          state.ball.vx = resolution.vx;
          state.ball.vy = resolution.vy;
          collisionCount++;
        }

        if (checkCircleAABB(state.ball, rightWallRect)) {
          const resolution = resolveBallCollision(state.ball, rightWallRect);
          state.ball.vx = resolution.vx;
          state.ball.vy = resolution.vy;
          collisionCount++;
        }

        if (checkCircleAABB(state.ball, topWallRect)) {
          const resolution = resolveBallCollision(state.ball, topWallRect);
          state.ball.vx = resolution.vx;
          state.ball.vy = resolution.vy;
          collisionCount++;
        }

        // 3b. Check paddle (bottom area) → resolve vy
        if (checkCircleAABB(state.ball, state.paddle)) {
          const resolution = resolveBallCollision(state.ball, state.paddle);
          state.ball.vx = resolution.vx;
          state.ball.vy = resolution.vy;
          collisionCount++;
        }

        // 3c. Check all bricks → resolve velocity and mark brick for removal
        state.bricks.forEach((brick) => {
          if (brick.alive && checkCircleAABB(state.ball, brick)) {
            const resolution = resolveBallCollision(state.ball, brick);
            state.ball.vx = resolution.vx * state.speedMultiplier;
            state.ball.vy = resolution.vy * state.speedMultiplier;
            brick.alive = false;
            collisionCount++;
          }
        });

        // 4a & 4b. Remove destroyed bricks
        state.bricks = state.bricks.filter((brick) => brick.alive);

        // Render current frame
        renderFrame(state);
      }

      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
      }}
    />
  );
};

export default GameCanvas;
