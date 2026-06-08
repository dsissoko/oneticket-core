import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, GamePhase, Alien, Projectile, Shield } from '../types';

interface GameCanvasProps {}

const ALIEN_ROWS = 5;
const ALIEN_COLS = 11;
const ALIEN_SIZE = 20; // base pixel size for each alien
const ALIEN_BASE_SPEED = 30; // px/sec
const ALIEN_DROP_DISTANCE = 24; // px to drop when hitting edge
const ALIEN_MARGIN = 10; // px from canvas edge before reversing
const ALIEN_SPEED_INCREMENT = 0.5; // px/sec increase per alien killed — kept low for playability

// Lives and invincibility
const INITIAL_LIVES = 3;
const INVINCIBILITY_DURATION = 2.0; // seconds of invincibility after hit

// Projectile constants
const PLAYER_PROJECTILE_SPEED = -500; // px/sec (upward)
const ALIEN_PROJECTILE_SPEED = 250; // px/sec (downward)
const RELOAD_DELAY = 300; // ms between player shots
const PROJECTILE_WIDTH = 3;
const PROJECTILE_HEIGHT = 12;
const PLAYER_PROJECTILE_COLOR = '#fbbf24';
const ALIEN_PROJECTILE_COLOR = '#ef4444';

// Shield constants
const SHIELD_COLOR = '#22c55e';
const SHIELD_COUNT = 4;
const SHIELD_HEALTH = 10;
const SHIELD_WIDTH_RATIO = 0.08; // 8% of canvas width
const SHIELD_HEIGHT_RATIO = 0.04; // 4% of canvas height
const SHIELD_Y_RATIO = 0.60; // 60% of canvas height from top
const SHIELD_NOTCH_WIDTH_RATIO = 0.3; // notch is 30% of shield width
const SHIELD_NOTCH_HEIGHT_RATIO = 0.4; // notch is 40% of shield height

// localStorage helpers
const STORAGE_KEY = 'spaceinvaders_bestScore';

function loadBestScore(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number): void {
  try {
    const current = loadBestScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEY, String(score));
    }
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function createInitialState(): GameState {
  const aliens: GameState['aliens'] = [];
  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIEN_COLS; col++) {
      aliens.push({ x: 0, y: 0, alive: false });
    }
  }

  const shields: GameState['shields'] = [];

  return {
    phase: 'menu' as GamePhase,
    score: 0,
    bestScore: loadBestScore(),
    lives: INITIAL_LIVES,
    cannon: { x: 400, width: 60, height: 20 },
    aliens,
    playerProjectiles: [],
    alienProjectiles: [],
    shields,
    alienDirection: 1,
    alienSpeed: ALIEN_BASE_SPEED,
    lastFireTime: 0,
    reloadDelay: RELOAD_DELAY,
    invincible: false,
    invincibleTimer: 0,
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

function initShields(canvasWidth: number, canvasHeight: number): Shield[] {
  const shieldWidth = canvasWidth * SHIELD_WIDTH_RATIO;
  const shieldY = canvasHeight * SHIELD_Y_RATIO;

  // Calculate total width needed for all shields
  const totalShieldWidth = SHIELD_COUNT * shieldWidth;
  // Available space for gaps (between shields and edges)
  const gapCount = SHIELD_COUNT + 1;
  const gapWidth = (canvasWidth - totalShieldWidth) / gapCount;

  const shields: Shield[] = [];
  for (let i = 0; i < SHIELD_COUNT; i++) {
    shields.push({
      x: gapWidth + i * (shieldWidth + gapWidth) + shieldWidth / 2, // center x
      y: shieldY,
      health: SHIELD_HEALTH,
      maxHealth: SHIELD_HEALTH,
    });
  }
  return shields;
}

function resetToMenu(gameState: GameState, canvasWidth: number, _canvasHeight: number): void {
  gameState.phase = 'menu';
  gameState.score = 0;
  gameState.bestScore = loadBestScore();
  gameState.lives = INITIAL_LIVES;
  gameState.cannon.x = canvasWidth / 2 - gameState.cannon.width / 2;
  gameState.playerProjectiles = [];
  gameState.alienProjectiles = [];
  gameState.alienDirection = 1;
  gameState.alienSpeed = ALIEN_BASE_SPEED;
  gameState.invincible = false;
  gameState.invincibleTimer = 0;
  // Reset aliens
  for (let i = 0; i < gameState.aliens.length; i++) {
    gameState.aliens[i] = { x: 0, y: 0, alive: false };
  }
  gameState.shields = [];
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

    // Flash during invincibility (blink on/off every 0.15s)
    if (gameState.invincible) {
      const blinkPhase = Math.floor(Date.now() / 150) % 2;
      if (blinkPhase === 0) return; // Skip drawing this frame for blinking effect
    }

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

  const updateInvincibility = useCallback((deltaTime: number, gameState: GameState) => {
    if (gameState.phase !== 'playing') return;
    if (gameState.invincible) {
      gameState.invincibleTimer -= deltaTime;
      if (gameState.invincibleTimer <= 0) {
        gameState.invincible = false;
        gameState.invincibleTimer = 0;
      }
    }
  }, []);

  const checkCollisions = useCallback((gameState: GameState, canvas: HTMLCanvasElement) => {
    if (gameState.phase !== 'playing') return;

    const { cannon } = gameState;
    const bottomMargin = canvas.height * 0.05;
    const cannonHeight = canvas.width * 0.02;
    const barrelHeight = cannonHeight * 0.8;
    const cannonY = canvas.height - bottomMargin - cannonHeight - barrelHeight;

    const shieldWidth = canvas.width * SHIELD_WIDTH_RATIO;
    const shieldHeight = canvas.height * SHIELD_HEIGHT_RATIO;

    // Helper: check if projectile hits any shield
    const checkShieldCollision = (proj: Projectile): boolean => {
      for (const shield of gameState.shields) {
        if (shield.health <= 0) continue;

        const shieldLeft = shield.x - shieldWidth / 2;
        const shieldRight = shield.x + shieldWidth / 2;
        const shieldTop = shield.y;
        const shieldBottom = shield.y + shieldHeight;

        if (
          proj.x >= shieldLeft &&
          proj.x <= shieldRight &&
          proj.y >= shieldTop &&
          proj.y <= shieldBottom
        ) {
          shield.health = Math.max(0, shield.health - 1);
          return true;
        }
      }
      return false;
    };

    // Player missiles vs alive aliens (with shield check first)
    const survivingPlayerProjectiles: Projectile[] = [];
    for (const proj of gameState.playerProjectiles) {
      // Check shield collision first
      if (checkShieldCollision(proj)) continue;

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

    // Alien missiles vs cannon (with shield check first)
    const survivingAlienProjectiles: Projectile[] = [];
    let cannonHit = false;
    for (const proj of gameState.alienProjectiles) {
      // Check shield collision first
      if (checkShieldCollision(proj)) continue;

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

    if (cannonHit && !gameState.invincible) {
      gameState.lives -= 1;
      if (gameState.lives <= 0) {
        // No lives left — game over
        gameState.phase = 'gameover';
        if (gameState.score > gameState.bestScore) {
          gameState.bestScore = gameState.score;
        }
        saveBestScore(gameState.bestScore);
      } else {
        // Lose a life, enter invincibility
        gameState.invincible = true;
        gameState.invincibleTimer = INVINCIBILITY_DURATION;
        // Clear all alien projectiles to give player a fair chance
        gameState.alienProjectiles = [];
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

  const renderShields = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameState: GameState) => {
    if (gameState.phase !== 'playing') return;

    const shieldWidth = canvas.width * SHIELD_WIDTH_RATIO;
    const shieldHeight = canvas.height * SHIELD_HEIGHT_RATIO;
    const notchWidth = shieldWidth * SHIELD_NOTCH_WIDTH_RATIO;
    const notchHeight = shieldHeight * SHIELD_NOTCH_HEIGHT_RATIO;

    for (const shield of gameState.shields) {
      if (shield.health <= 0) continue;

      const left = shield.x - shieldWidth / 2;
      const top = shield.y;

      // Progressive degradation: draw shield with gaps based on health
      ctx.fillStyle = SHIELD_COLOR;

      const healthRatio = shield.health / shield.maxHealth;

      if (healthRatio > 0.7) {
        // Health 8-10: Full shield with classic notch
        // Main body
        ctx.fillRect(left, top, shieldWidth, shieldHeight - notchHeight);
        // Left pillar
        ctx.fillRect(left, top + shieldHeight - notchHeight, (shieldWidth - notchWidth) / 2, notchHeight);
        // Right pillar
        ctx.fillRect(left + (shieldWidth + notchWidth) / 2, top + shieldHeight - notchHeight, (shieldWidth - notchWidth) / 2, notchHeight);
      } else if (healthRatio > 0.4) {
        // Health 5-7: Small gaps appearing
        const blockSize = shieldWidth / 6;
        // Draw as blocks with some missing
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 6; col++) {
            // Skip some blocks to create gaps
            if (row === 2 && col >= 2 && col <= 3) continue; // notch
            if (row === 1 && col === 3) continue; // small gap
            if (row === 0 && (col === 1 || col === 4)) continue; // small gaps
            ctx.fillRect(left + col * blockSize, top + row * (shieldHeight / 3), blockSize, shieldHeight / 3);
          }
        }
      } else if (healthRatio > 0.1) {
        // Health 2-4: Larger gaps, mostly destroyed
        const blockSize = shieldWidth / 6;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 6; col++) {
            // Skip more blocks
            if (row === 2) continue; // bottom row gone
            if (row === 1 && (col === 1 || col === 2 || col === 3 || col === 4)) continue; // middle gaps
            if (row === 0 && (col === 0 || col === 2 || col === 3 || col === 5)) continue; // top gaps
            ctx.fillRect(left + col * blockSize, top + row * (shieldHeight / 3), blockSize, shieldHeight / 3);
          }
        }
      } else {
        // Health 1: Almost destroyed, just a few remnants
        const blockSize = shieldWidth / 6;
        ctx.fillRect(left, top, blockSize, shieldHeight / 3);
        ctx.fillRect(left + 5 * blockSize, top + shieldHeight / 3, blockSize, shieldHeight / 3);
      }
    }
  }, []);

  const renderHUD = useCallback((ctx: CanvasRenderingContext2D, gameState: GameState) => {
    if (gameState.phase !== 'playing' && gameState.phase !== 'menu') return;

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.textBaseline = 'top';

    // Lives display (left side, before score)
    ctx.textAlign = 'left';
    const livesText = '♥'.repeat(gameState.lives) + '♡'.repeat(Math.max(0, INITIAL_LIVES - gameState.lives));
    ctx.fillText(livesText, 16, 16);

    // Current score (left side, below lives)
    ctx.fillText(`Score: ${gameState.score}`, 16, 36);

    // Best score top-right
    ctx.textAlign = 'right';
    ctx.fillText(`Best: ${gameState.bestScore}`, ctx.canvas.width - 16, 16);
  }, []);

  const renderMenuScreen = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title
    ctx.font = 'bold 48px monospace';
    ctx.fillText('SPACE INVADERS', canvas.width / 2, canvas.height * 0.3);

    // Start prompt
    ctx.font = '20px monospace';
    ctx.fillText('Click, Tap, or Press Space to Start', canvas.width / 2, canvas.height * 0.5);
  }, []);

  const renderEndScreen = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameState: GameState) => {
    const isVictory = gameState.phase === 'victory';

    // Semi-transparent dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title
    ctx.font = 'bold 48px monospace';
    ctx.fillText(isVictory ? 'VICTORY!' : 'GAME OVER', canvas.width / 2, canvas.height * 0.25);

    // Subtitle
    ctx.font = '20px monospace';
    if (isVictory) {
      ctx.fillText('All aliens destroyed!', canvas.width / 2, canvas.height * 0.35);
    }

    // Score
    ctx.font = '24px monospace';
    ctx.fillText(`Score: ${gameState.score}`, canvas.width / 2, canvas.height * (isVictory ? 0.45 : 0.38));

    // Lives
    ctx.font = '18px monospace';
    ctx.fillStyle = '#ffffff';
    const livesText = '♥'.repeat(gameState.lives) + '♡'.repeat(Math.max(0, INITIAL_LIVES - gameState.lives));
    ctx.fillText(`Lives: ${livesText}`, canvas.width / 2, canvas.height * (isVictory ? 0.53 : 0.46));

    // Best score
    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Best: ${gameState.bestScore}`, canvas.width / 2, canvas.height * (isVictory ? 0.61 : 0.54));

    // Restart button
    const buttonWidth = 160;
    const buttonHeight = 44;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = canvas.height * (isVictory ? 0.71 : 0.64);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('RESTART', canvas.width / 2, buttonY + buttonHeight / 2);
  }, []);

  const getRestartButtonBounds = useCallback((canvas: HTMLCanvasElement, phase: GamePhase) => {
    const buttonWidth = 160;
    const buttonHeight = 44;
    const isVictory = phase === 'victory';
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = canvas.height * (isVictory ? 0.71 : 0.64);
    return { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
  }, []);

  const handleCanvasClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gameState = _gameStateRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Menu → playing transition on any click
    if (gameState.phase === 'menu') {
      gameState.phase = 'playing';
      return;
    }

    // Restart button click on game over / victory
    if (gameState.phase === 'gameover' || gameState.phase === 'victory') {
      const btn = getRestartButtonBounds(canvas, gameState.phase);
      if (
        clickX >= btn.x &&
        clickX <= btn.x + btn.width &&
        clickY >= btn.y &&
        clickY <= btn.y + btn.height
      ) {
        saveBestScore(gameState.bestScore);
        resetToMenu(gameState, canvas.width, canvas.height);
      }
    }
  }, [getRestartButtonBounds]);

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
      renderShields(ctx, canvas, gameState);
      renderProjectiles(ctx, gameState);
    }

    // HUD during playing
    renderHUD(ctx, gameState);

    // Menu screen
    if (gameState.phase === 'menu') {
      renderMenuScreen(ctx, canvas);
    }

    // End screens (game over / victory)
    if (gameState.phase === 'gameover' || gameState.phase === 'victory') {
      renderEndScreen(ctx, canvas, gameState);
    }
  }, [renderCannon, renderAliens, renderShields, renderProjectiles, renderHUD, renderMenuScreen, renderEndScreen]);

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
        gameState.shields = initShields(canvas.width, canvas.height);
        gameState.alienDirection = 1;
        gameState.alienSpeed = ALIEN_BASE_SPEED;
      }
      prevPhaseRef.current = gameState.phase;

      updateCannon(deltaTime, canvas, gameState);
      updateAliens(deltaTime, canvas, gameState);
      updateProjectiles(deltaTime, gameState);
      alienFire(gameState);
      checkCollisions(gameState, canvas);

      // Victory detection: all aliens destroyed
      if (gameState.phase === 'playing') {
        const aliveAliens = gameState.aliens.filter(a => a.alive);
        if (aliveAliens.length === 0) {
          gameState.phase = 'victory';
          if (gameState.score > gameState.bestScore) {
            gameState.bestScore = gameState.score;
          }
          saveBestScore(gameState.bestScore);
        }

        // Game over if any alien reaches close to the bottom (near cannon zone)
        const cannonZoneY = canvas.height * 0.85; // 85% of canvas height
        for (const alien of aliveAliens) {
          if (alien.y + ALIEN_SIZE / 2 >= cannonZoneY) {
            gameState.phase = 'gameover';
            if (gameState.score > gameState.bestScore) {
              gameState.bestScore = gameState.score;
            }
            saveBestScore(gameState.bestScore);
            break;
          }
        }
      }

      // Update invincibility timer
      updateInvincibility(deltaTime, gameState);
    }

    render();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [render, updateCannon, updateAliens, updateProjectiles, alienFire, checkCollisions, updateInvincibility]);

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

      // Menu → playing transition on space
      const gameState = _gameStateRef.current;
      if ((e.key === ' ' || e.key === 'Space') && gameState.phase === 'menu') {
        gameState.phase = 'playing';
      }
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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gameState = _gameStateRef.current;

      // If no touch start X was tracked, this might be a tap for menu/restart
      if (touchStartXRef.current === null) {
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const tapX = touch.clientX - rect.left;
        const tapY = touch.clientY - rect.top;

        // Menu → playing on tap
        if (gameState.phase === 'menu') {
          gameState.phase = 'playing';
          touchStartXRef.current = null;
          return;
        }

        // Restart button tap
        if (gameState.phase === 'gameover' || gameState.phase === 'victory') {
          const btn = getRestartButtonBounds(canvas, gameState.phase);
          if (
            tapX >= btn.x &&
            tapX <= btn.x + btn.width &&
            tapY >= btn.y &&
            tapY <= btn.y + btn.height
          ) {
            saveBestScore(gameState.bestScore);
            resetToMenu(gameState, canvas.width, canvas.height);
          }
        }
      }

      touchStartXRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleCanvasClick);
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
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [resize, gameLoop, updateCannon, createPlayerProjectile, handleCanvasClick, getRestartButtonBounds]);

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
