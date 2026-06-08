import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, GamePhase } from '../types';

interface GameCanvasProps {}

function createInitialState(): GameState {
  const alienRows = 5;
  const alienCols = 11;
  const aliens: GameState['aliens'] = [];
  for (let row = 0; row < alienRows; row++) {
    for (let col = 0; col < alienCols; col++) {
      aliens.push({ x: col * 40, y: row * 30, alive: true });
    }
  }

  const shields: GameState['shields'] = [];
  for (let i = 0; i < 4; i++) {
    shields.push({ x: 100 + i * 180, y: 400, health: 10, maxHealth: 10 });
  }

  return {
    phase: 'menu' as GamePhase,
    score: 0,
    bestScore: 0,
    cannon: { x: 400, width: 60, height: 20 },
    aliens,
    playerProjectiles: [],
    alienProjectiles: [],
    shields,
    alienDirection: 1,
    alienSpeed: 1,
    lastFireTime: 0,
    reloadDelay: 0,
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const _gameStateRef = useRef<GameState>(createInitialState());
  const lastTimeRef = useRef<number>(0);

  // Cannon input tracking refs
  const touchStartXRef = useRef<number | null>(null);
  const lastFireTimeRef = useRef<number>(0);
  const wantsToFireRef = useRef<boolean>(false);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent ? parent.clientWidth : window.innerWidth;
    canvas.height = parent ? parent.clientHeight : window.innerHeight;
  }, []);

  const renderCannon = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameState: GameState) => {
    const { cannon } = gameState;
    const cannonWidth = canvas.width * 0.03;
    const cannonHeight = canvas.width * 0.02;
    const barrelHeight = cannonHeight * 0.8;
    const barrelWidth = cannonWidth * 0.3;
    const bottomMargin = canvas.height * 0.05;
    const y = canvas.height - bottomMargin - cannonHeight - barrelHeight;

    // Update cannon dimensions based on canvas size
    cannon.width = cannonWidth;
    cannon.height = cannonHeight + barrelHeight;

    // Clamp cannon position to canvas bounds
    cannon.x = Math.max(0, Math.min(canvas.width - cannonWidth, cannon.x));

    ctx.fillStyle = '#22c55e';

    // Draw cannon body (rectangle)
    ctx.fillRect(cannon.x, y + barrelHeight, cannonWidth, cannonHeight);

    // Draw cannon barrel (triangle on top)
    const barrelCenterX = cannon.x + cannonWidth / 2;
    const barrelTopY = y;
    const barrelBottomY = y + barrelHeight;
    const barrelHalfWidth = barrelWidth / 2;

    ctx.beginPath();
    ctx.moveTo(barrelCenterX - barrelHalfWidth, barrelBottomY);
    ctx.lineTo(barrelCenterX, barrelTopY);
    ctx.lineTo(barrelCenterX + barrelHalfWidth, barrelBottomY);
    ctx.closePath();
    ctx.fill();
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gameState = _gameStateRef.current;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render cannon during 'playing' and 'menu' phases
    if (gameState.phase === 'playing' || gameState.phase === 'menu') {
      renderCannon(ctx, canvas, gameState);
    }
  }, [renderCannon]);

  const updateCannon = useCallback((deltaTime: number, canvas: HTMLCanvasElement, gameState: GameState) => {
    const keys = keysRef.current;
    const cannonSpeed = 400; // px/sec
    const moveDelta = cannonSpeed * deltaTime;

    if (keys.has('ArrowLeft')) {
      gameState.cannon.x -= moveDelta;
    }
    if (keys.has('ArrowRight')) {
      gameState.cannon.x += moveDelta;
    }

    // Handle fire input (Space key)
    if (keys.has(' ') || keys.has('Space')) {
      const now = Date.now();
      if (now - lastFireTimeRef.current >= gameState.reloadDelay) {
        wantsToFireRef.current = true;
        lastFireTimeRef.current = now;
      }
    }

    // Clamp cannon to canvas bounds
    const cannonWidth = canvas.width * 0.03;
    gameState.cannon.x = Math.max(0, Math.min(canvas.width - cannonWidth, gameState.cannon.x));
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    if (canvas) {
      const gameState = _gameStateRef.current;
      updateCannon(deltaTime, canvas, gameState);
    }

    render();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [render, updateCannon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('SpaceInvaders game loop started');

    // Resize before starting
    resize();

    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(canvas.parentElement!);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      keysRef.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchY = touch.clientY - rect.top;
      const touchX = touch.clientX - rect.left;
      const movementZoneHeight = canvas.height * 0.2;

      if (touchY >= canvas.height - movementZoneHeight) {
        // Bottom 20%: movement zone — track start X
        touchStartXRef.current = touchX;
      } else {
        // Top 80%: fire zone
        const now = Date.now();
        const gameState = _gameStateRef.current;
        if (now - lastFireTimeRef.current >= gameState.reloadDelay) {
          wantsToFireRef.current = true;
          lastFireTimeRef.current = now;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (touchStartXRef.current === null) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const deltaX = touchX - touchStartXRef.current;

      const gameState = _gameStateRef.current;
      gameState.cannon.x += deltaX;

      // Reset startX each frame for smooth tracking
      touchStartXRef.current = touchX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchStartXRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Start game loop
    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [resize, gameLoop, updateCannon]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
};

export default GameCanvas;
