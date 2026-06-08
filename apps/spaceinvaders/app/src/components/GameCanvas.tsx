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

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent ? parent.clientWidth : window.innerWidth;
    canvas.height = parent ? parent.clientHeight : window.innerHeight;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    const _deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    // TODO: update game state using deltaTime and keysRef.current
    void _deltaTime;
    void _gameStateRef;

    render();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [render]);

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
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
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
  }, [resize, gameLoop]);

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
