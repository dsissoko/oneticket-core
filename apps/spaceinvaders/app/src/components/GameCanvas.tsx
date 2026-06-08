import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, GamePhase, Alien, Projectile } from '../types';

interface GameCanvasProps {}

const ALIEN_ROWS = 5;
const ALIEN_COLS = 11;
const ALIEN_SIZE = 20; // base pixel size for each alien
const ALIEN_BASE_SPEED = 30; // px/sec
const ALIEN_DROP_DISTANCE = 24; // px to drop when hitting edge
const ALIEN_MARGIN = 10; // px from canvas edge before reversing
const ALIEN_SPEED_INCREMENT = 2; // px/sec increase per alien killed

// Projectile constants
const PLAYER_PROJECTILE_SPEED = -500; // px/sec (upward)
const ALIEN_PROJECTILE_SPEED = 250; // px/sec (downward)
const RELOAD_DELAY = 300; // ms between player shots
const PROJECTILE_WIDTH = 3;
const PROJECTILE_HEIGHT = 12;
const PLAYER_PROJECTILE_COLOR = '#fbbf24';
const ALIEN_PROJECTILE_COLOR = '#ef4444';

function createInitialState(): GameState {
  const aliens: GameState['aliens'] = [];
  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIEN_COLS; col++) {
      aliens.push({ x: 0, y: 0, alive: false });
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
    alienSpeed: ALIEN_BASE_SPEED,
    lastFireTime: 0,
    reloadDelay: RELOAD_DELAY,
  };
}

function initAlienFormation(aliens: Alien[], canvasWidth: number, canvasHeight: number) {
  const waveWidth = canvasWidth * 0.7;
  const waveHeight = canvasHeight * 0.4;
  const spacingX = waveWidth / ALIEN_COLS;
  const spacingY = waveHeight / ALIEN_ROWS;
  const offsetX = (canvasWidth - waveWidth) / 2;
  const offsetY = canvasHeight * 0.05; // small top margin

  let index = 0;
  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIEN_COLS; col++) {
      aliens[index] = {
        x: offsetX + col * spacingX + spacingX / 2,
        y: offsetY + row * spacingY + spacingY / 2,
        alive: true,
      };
      index++;
    }
  }
}

export const GameCanvas: React.FC<GameCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const _gameStateRef = useRef<GameState>(createInitialState());
  const lastTimeRef = useRef<number>(0);
  const prevPhaseRef = useRef<GamePhase>('menu');

  // Cannon input tracking refs
  const touchStartXRef = useRef<number | null>(null);
  const lastFireTimeRef = useRef<number>(0);

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

  const updateAliens = useCallback((deltaTime: number, canvas: HTMLCanvasElement, gameState: GameState) => {
    if (gameState.phase !== 'playing') return;

    const { aliens } = gameState;
    const aliveAliens = aliens.filter(a => a.alive);
    if (aliveAliens.length === 0) return;

    // Calculate speed based on remaining aliens (faster as fewer remain)
    const totalAliens = ALIEN_ROWS * ALIEN_COLS;
    const killed = totalAliens - aliveAliens.length;
    const currentSpeed = gameState.alienSpeed + killed * ALIEN_SPEED_INCREMENT;

    // Update all alien x positions
    let hitEdge = false;
    for (const alien of aliens) {
      if (!alien.alive) continue;
      alien.x += gameState.alienDirection * currentSpeed * deltaTime;

      // Check edge collision
      if (alien.x - ALIEN_SIZE / 2 < ALIEN_MARGIN || alien.x + ALIEN_SIZE / 2 > canvas.width - ALIEN_MARGIN) {
        hitEdge = true;
      }
    }

    // If any alien hit the edge, reverse direction and drop all down
    if (hitEdge) {
      gameState.alienDirection *= -1;
      for (const alien of aliens) {
        if (alien.alive) {
          alien.y += ALIEN_DROP_DISTANCE;
        }
      }
    }
  }, []);

  const renderAliens = useCallback((ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement, gameState: GameState) => {
    if (gameState.phase !== 'playing') return;

    const { aliens } = gameState;
    ctx.fillStyle = '#4ade80';

    for (const alien of aliens) {
      if (!alien.alive) continue;

      const x = alien.x - ALIEN_SIZE / 2;
      const y = alien.y - ALIEN_SIZE / 2;

      // Main body - pixel-art style square
      ctx.fillRect(x, y, ALIEN_SIZE, ALIEN_SIZE);

      // Small details - "eyes" (darker pixels)
      ctx.fillStyle = '#0a0a0a';
      const eyeSize = 3;
      const eyeOffsetY = 4;
      const eyeSpacing = 6;
      ctx.fillRect(alien.x - eyeSpacing - eyeSize / 2, y + eyeOffsetY, eyeSize, eyeSize);
      ctx.fillRect(alien.x + eyeSpacing - eyeSize / 2, y + eyeOffsetY, eyeSize, eyeSize);

      // Restore alien color for next iteration
      ctx.fillStyle = '#4ade80';
    }
  }, []);

  const createPlayerProjectile = useCallback((gameState: GameState, canvas: HTMLCanvasElement) => {
    const { cannon } = gameState;
    const bottomMargin = canvas.height * 0.05;
    const cannonHeight = canvas.width * 0.02;
    const barrelHeight = cannonHeight * 0.8;
    const cannonY = canvas.height - bottomMargin - cannonHeight - barrelHeight;

    const projectile: Projectile = {
      x: cannon.x + cannon.width / 2,
      y: cannonY,
      vy: PLAYER_PROJECTILE_SPEED,
      direction: -1, // upward
    };
    gameState.playerProjectiles.push(projectile);
  }, []);

  const updateProjectiles = useCallback((deltaTime: number, gameState: GameState) => {
    if (gameState.phase !== 'playing') return;

    // Update player projectiles
    for (const proj of gameState.playerProjectiles) {
      proj.y += proj.vy * deltaTime;
    }

    // Update alien projectiles
    for (const proj of gameState.alienProjectiles) {
      proj.y += proj.vy * deltaTime;
    }

    // Remove off-screen projectiles
    gameState.playerProjectiles = gameState.playerProjectiles.filter(p => p.y > -PROJECTILE_HEIGHT);
    gameState.alienProjectiles = gameState.alienProjectiles.filter(p => p.y < 2000); // generous upper bound
  }, []);

  const alienFire = useCallback((gameState: GameState) => {
    if (gameState.phase !== 'playing') return;

    const aliveAliens = gameState.aliens.filter(a => a.alive);
    if (aliveAliens.length === 0) return;

    // Probability proportional to alive aliens / 55, capped at ~0.02 per frame
    const fireChance = Math.min(aliveAliens.length / 55, 0.02);

    if (Math.random() < fireChance) {
      // Pick a random alive alien to fire from
      const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
      const projectile: Projectile = {
        x: shooter.x,
        y: shooter.y + ALIEN_SIZE / 2,
        vy: ALIEN_PROJECTILE_SPEED,
        direction: 1, // downward
      };
      gameState.alienProjectiles.push(projectile);
    }
  }, []);

  const checkCollisions = useCallback((gameState: GameState, canvas: HTMLCanvasElement) => {
    if (gameState.phase !== 'playing') return;

    const { cannon } = gameState;
    const bottomMargin = canvas.height * 0.05;
    const cannonHeight = canvas.width * 0.02;
    const barrelHeight = cannonHeight * 0.8;
    const cannonY = canvas.height - bottomMargin - cannonHeight - barrelHeight;

    // Player missiles vs alive aliens
    const survivingPlayerProjectiles: Projectile[] = [];
    for (const proj of gameState.playerProjectiles) {
      let hit = false;
      for (const alien of gameState.aliens) {
        if (!alien.alive) continue;
        // Simple AABB collision
        const alienLeft = alien.x - ALIEN_SIZE / 2;
        const alienRight = alien.x + ALIEN_SIZE / 2;
        const alienTop = alien.y - ALIEN_SIZE / 2;
        const alienBottom = alien.y + ALIEN_SIZE / 2;

        if (
          proj.x >= alienLeft &&
          proj.x <= alienRight &&
          proj.y >= alienTop &&
          proj.y <= alienBottom
        ) {
          alien.alive = false;
          gameState.score += 10;
          hit = true;
          break;
        }
      }
      if (!hit) {
        survivingPlayerProjectiles.push(proj);
      }
    }
    gameState.playerProjectiles = survivingPlayerProjectiles;

    // Alien missiles vs cannon
    const survivingAlienProjectiles: Projectile[] = [];
    let cannonHit = false;
    for (const proj of gameState.alienProjectiles) {
      let hit = false;
      // Cannon bounds
      const cannonLeft = cannon.x;
      const cannonRight = cannon.x + cannon.width;
      const cannonTop = cannonY;
      const cannonBottom = cannonY + cannon.height;

      if (
        proj.x >= cannonLeft &&
        proj.x <= cannonRight &&
        proj.y >= cannonTop &&
        proj.y <= cannonBottom
      ) {
        hit = true;
        cannonHit = true;
      }
      if (!hit) {
        survivingAlienProjectiles.push(proj);
      }
    }
    gameState.alienProjectiles = survivingAlienProjectiles;

    if (cannonHit) {
      gameState.phase = 'gameover';
      if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
      }
    }
  }, []);

  const renderProjectiles = useCallback((ctx: CanvasRenderingContext2D, gameState: GameState) => {
    if (gameState.phase !== 'playing') return;

    // Render player projectiles (yellow/white thin lines)
    ctx.fillStyle = PLAYER_PROJECTILE_COLOR;
    for (const proj of gameState.playerProjectiles) {
      ctx.fillRect(
        proj.x - PROJECTILE_WIDTH / 2,
        proj.y - PROJECTILE_HEIGHT / 2,
        PROJECTILE_WIDTH,
        PROJECTILE_HEIGHT
      );
    }

    // Render alien projectiles (red thin lines)
    ctx.fillStyle = ALIEN_PROJECTILE_COLOR;
    for (const proj of gameState.alienProjectiles) {
      ctx.fillRect(
        proj.x - PROJECTILE_WIDTH / 2,
        proj.y - PROJECTILE_HEIGHT / 2,
        PROJECTILE_WIDTH,
        PROJECTILE_HEIGHT
      );
    }
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

    // Render aliens during 'playing' phase
    if (gameState.phase === 'playing') {
      renderAliens(ctx, canvas, gameState);
      renderProjectiles(ctx, gameState);
    }
  }, [renderCannon, renderAliens, renderProjectiles]);

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

    // Handle fire input (Space key) - create projectile directly
    if (keys.has(' ') || keys.has('Space')) {
      const now = Date.now();
      if (now - lastFireTimeRef.current >= gameState.reloadDelay) {
        createPlayerProjectile(gameState, canvas);
        lastFireTimeRef.current = now;
      }
    }

    // Clamp cannon to canvas bounds
    const cannonWidth = canvas.width * 0.03;
    gameState.cannon.x = Math.max(0, Math.min(canvas.width - cannonWidth, gameState.cannon.x));
  }, [createPlayerProjectile]);

  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    if (canvas) {
      const gameState = _gameStateRef.current;

      // Detect menu → playing transition to initialize alien formation
      if (gameState.phase === 'playing' && prevPhaseRef.current === 'menu') {
        initAlienFormation(gameState.aliens, canvas.width, canvas.height);
        gameState.alienDirection = 1;
        gameState.alienSpeed = ALIEN_BASE_SPEED;
      }
      prevPhaseRef.current = gameState.phase;

      updateCannon(deltaTime, canvas, gameState);
      updateAliens(deltaTime, canvas, gameState);
      updateProjectiles(deltaTime, gameState);
      alienFire(gameState);
      checkCollisions(gameState, canvas);
    }

    render();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [render, updateCannon, updateAliens, updateProjectiles, alienFire, checkCollisions]);

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
          createPlayerProjectile(gameState, canvas);
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
  }, [resize, gameLoop, updateCannon, createPlayerProjectile]);

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
