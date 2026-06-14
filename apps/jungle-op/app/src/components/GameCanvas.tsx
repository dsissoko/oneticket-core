import React, { useRef, useEffect } from 'react';
import {
  JungleState,
  Animal,
  FireJet,
  SprinklerBall,
  ANIMAL_DEFS,
} from '../types';
import { circlesOverlap } from '../utils/collision';

// Canvas configuration constants
const CANVAS_BG_COLOR = '#1a1a2e';
const JUNGLE_BG_COLOR = '#2d4a2d';
const JUNGLE_ZONE_RATIO = 0.2; // bottom 20%
const SPRINKLER_RADIUS = 25;
const FIRE_JET_RADIUS = 6;
const FIRE_JET_SPEED = 350; // pixels per second
const FIRE_JET_TRAIL_LENGTH = 8;
const ANIMAL_EMOJI_SIZE = 80;
const ANIMAL_HP_BAR_HEIGHT = 8;
const ANIMAL_HP_BAR_WIDTH = 80;
const ANIMAL_MOVE_SPEED = 250; // pixels per second
const TEXT_COLOR = '#ffffff';
const OVERLAY_BG = 'rgba(0, 0, 0, 0.7)';
const BUTTON_COLOR = '#e67e22';
const BUTTON_TEXT_COLOR = '#ffffff';
const HP_BAR_BG = '#333333';
const HP_BAR_FILL = '#27ae60';
const HP_BAR_LOW = '#e74c3c';

interface GameCanvasProps {}

export const GameCanvas: React.FC<GameCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<JungleState | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const touchRef = useRef<{ startX: number; currentX: number; active: boolean; zoneCheck: boolean }>({ startX: 0, currentX: 0, active: false, zoneCheck: false });
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

    const getJungleZoneY = () => canvas.height * (1 - JUNGLE_ZONE_RATIO);

    // Initialize sprinkler ball
    const createSprinkler = (): SprinklerBall => ({
      x: canvas.width / 2,
      y: canvas.height * 0.15,
      radius: SPRINKLER_RADIUS,
      angle: 0,
      rotationSpeed: Math.PI * 0.8, // ~0.8 rotations per second
      shootInterval: 0.35, // seconds between shots
      shootTimer: 0,
    });

    // Initialize animal
    const createAnimal = (defIndex: number): Animal => {
      const def = ANIMAL_DEFS[defIndex];
      const jungleY = getJungleZoneY();
      const animalY = jungleY + (canvas.height * JUNGLE_ZONE_RATIO - ANIMAL_EMOJI_SIZE) / 2;
      return {
        def,
        x: 10,
        y: animalY,
        hp: def.maxHp,
        width: ANIMAL_EMOJI_SIZE,
        height: ANIMAL_EMOJI_SIZE,
      };
    };

    // Create initial game state
    const createInitialState = (): JungleState => ({
      phase: 'menu',
      sprinkler: createSprinkler(),
      fireJets: [],
      currentAnimal: null,
      animalIndex: 0,
      score: 0,
      speedMultiplier: 1.0,
      jungleZoneY: getJungleZoneY(),
    });

    gameStateRef.current = createInitialState();

    // Spawn a fire jet from the sprinkler
    const spawnFireJet = (state: JungleState) => {
      const s = state.sprinkler;
      // The sprinkler rotates and shoots in the direction it's facing
      // We want it to shoot downward in a sweeping pattern
      const angle = s.angle;
      // Spread: the jet goes downward with a horizontal spread based on angle
      const spreadAngle = Math.sin(angle) * (Math.PI * 0.45); // -45 to +45 degrees spread
      const speed = FIRE_JET_SPEED * state.speedMultiplier;
      const jet: FireJet = {
        x: s.x,
        y: s.y + s.radius,
        radius: FIRE_JET_RADIUS,
        vx: Math.sin(spreadAngle) * speed,
        vy: Math.cos(spreadAngle) * speed * 0.6 + speed * 0.4, // biased downward
        trail: [],
      };
      state.fireJets.push(jet);
    };

    // Rendering functions
    const drawSprinklerBall = (state: JungleState) => {
      const s = state.sprinkler;

      // Glow effect
      const glowGrad = ctx.createRadialGradient(s.x, s.y, s.radius * 0.5, s.x, s.y, s.radius * 2);
      glowGrad.addColorStop(0, 'rgba(255, 80, 0, 0.3)');
      glowGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main ball
      const ballGrad = ctx.createRadialGradient(s.x - 5, s.y - 5, 2, s.x, s.y, s.radius);
      ballGrad.addColorStop(0, '#ff4444');
      ballGrad.addColorStop(0.7, '#cc0000');
      ballGrad.addColorStop(1, '#880000');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();

      // Rotation indicator (shows direction)
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(
        s.x + Math.sin(s.angle) * s.radius,
        s.y + Math.cos(s.angle) * s.radius
      );
      ctx.stroke();
    };

    const drawFireJet = (jet: FireJet) => {
      // Draw trail
      for (let i = 0; i < jet.trail.length; i++) {
        const t = jet.trail[i];
        ctx.fillStyle = `rgba(255, 100, 0, ${t.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, jet.radius * (0.5 + t.alpha * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      // Main jet with radial gradient (yellow center, red/orange edge)
      const grad = ctx.createRadialGradient(jet.x, jet.y, 0, jet.x, jet.y, jet.radius);
      grad.addColorStop(0, '#ffff00');
      grad.addColorStop(0.4, '#ff8800');
      grad.addColorStop(1, '#ff2200');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(jet.x, jet.y, jet.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawAnimal = (animal: Animal) => {
      // Draw HP bar background
      const hpBarX = animal.x + (animal.width - ANIMAL_HP_BAR_WIDTH) / 2;
      const hpBarY = animal.y - ANIMAL_HP_BAR_HEIGHT - 4;
      ctx.fillStyle = HP_BAR_BG;
      ctx.fillRect(hpBarX, hpBarY, ANIMAL_HP_BAR_WIDTH, ANIMAL_HP_BAR_HEIGHT);

      // Draw HP bar fill
      const hpRatio = animal.hp / animal.def.maxHp;
      ctx.fillStyle = hpRatio > 0.3 ? HP_BAR_FILL : HP_BAR_LOW;
      ctx.fillRect(hpBarX, hpBarY, ANIMAL_HP_BAR_WIDTH * hpRatio, ANIMAL_HP_BAR_HEIGHT);

      // Draw HP text
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${animal.hp}/${animal.def.maxHp}`, animal.x + animal.width / 2, hpBarY - 3);

      // Draw emoji
      ctx.font = `${ANIMAL_EMOJI_SIZE}px serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(animal.def.emoji, animal.x, animal.y);
    };

    const drawJungleZone = (state: JungleState) => {
      const jungleY = state.jungleZoneY;

      // Jungle background
      ctx.fillStyle = JUNGLE_BG_COLOR;
      ctx.fillRect(0, jungleY, canvas.width, canvas.height - jungleY);

      // Jungle border line
      ctx.strokeStyle = '#4a7a4a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, jungleY);
      ctx.lineTo(canvas.width, jungleY);
      ctx.stroke();

      // Decorative trees/bushes
      ctx.font = '30px serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const treeSpacing = 120;
      for (let x = 20; x < canvas.width; x += treeSpacing) {
        ctx.fillText('\u{1F334}', x, jungleY + 5);
      }
    };

    const drawUI = (state: JungleState) => {
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Score: ${state.score}`, 15, 15);

      ctx.textAlign = 'right';
      ctx.fillText(`Speed: ${state.speedMultiplier.toFixed(1)}x`, canvas.width - 15, 15);

      // Show current animal indicator
      if (state.currentAnimal) {
        ctx.textAlign = 'center';
        ctx.fillText(`Animal: ${state.currentAnimal.def.emoji}`, canvas.width / 2, 15);
      }
    };

    const drawMenuOverlay = () => {
      ctx.fillStyle = OVERLAY_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#e67e22';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u{1F334} OP\u00C9RATION JUNGLE \u{1F334}', canvas.width / 2, canvas.height / 2 - 120);

      // Subtitle
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = '18px Arial';
      ctx.fillText('Sauvez les animaux des jets de feu!', canvas.width / 2, canvas.height / 2 - 70);

      // Speed slider label
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Vitesse de la boule', canvas.width / 2, canvas.height / 2 - 20);

      // Speed slider visualization
      const sliderY = canvas.height / 2 + 10;
      const sliderWidth = 240;
      const sliderX = canvas.width / 2 - sliderWidth / 2;
      const sliderHeight = 24;

      // Slider track
      ctx.fillStyle = '#333';
      ctx.fillRect(sliderX, sliderY, sliderWidth, sliderHeight);

      // Slider fill
      const sliderProgress = (speedMultiplierRef.current - 0.5) / 1.5;
      ctx.fillStyle = BUTTON_COLOR;
      ctx.fillRect(sliderX, sliderY, sliderWidth * sliderProgress, sliderHeight);

      // Slider border
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(sliderX, sliderY, sliderWidth, sliderHeight);

      // Slider thumb
      const thumbX = sliderX + sliderWidth * sliderProgress;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(thumbX, sliderY + sliderHeight / 2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Speed text
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = '18px Arial';
      ctx.fillText(`${speedMultiplierRef.current.toFixed(1)}x`, canvas.width / 2, sliderY + 50);

      // Labels
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('0.5x', sliderX - 5, sliderY + sliderHeight + 15);
      ctx.textAlign = 'right';
      ctx.fillText('2.0x', sliderX + sliderWidth + 5, sliderY + sliderHeight + 15);

      // Animal preview
      ctx.textAlign = 'center';
      ctx.font = '16px Arial';
      ctx.fillText('Animaux \u00E0 sauver:', canvas.width / 2, canvas.height / 2 + 110);
      ctx.font = '36px serif';
      const animalText = ANIMAL_DEFS.map(a => `${a.emoji}${a.maxHp}PV`).join('  ');
      ctx.fillText(animalText, canvas.width / 2, canvas.height / 2 + 150);

      // Start button
      const buttonY = canvas.height / 2 + 190;
      const buttonWidth = 180;
      const buttonHeight = 50;
      const buttonX = canvas.width / 2 - buttonWidth / 2;

      ctx.fillStyle = BUTTON_COLOR;
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
      ctx.fill();
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('COMMENCER', canvas.width / 2, buttonY + buttonHeight / 2);

      // Controls info
      ctx.fillStyle = '#aaa';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'top';
      ctx.fillText('\u2190 \u2192 ou swipe pour d\u00E9placer l\'animal', canvas.width / 2, buttonY + buttonHeight + 20);
    };

    const drawGameOverOverlay = (state: JungleState) => {
      ctx.fillStyle = OVERLAY_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = '24px Arial';
      ctx.fillText(`Score final: ${state.score}`, canvas.width / 2, canvas.height / 2);

      // Restart button
      const buttonY = canvas.height / 2 + 50;
      const buttonWidth = 180;
      const buttonHeight = 50;
      const buttonX = canvas.width / 2 - buttonWidth / 2;

      ctx.fillStyle = BUTTON_COLOR;
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
      ctx.fill();
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RECOMMENCER', canvas.width / 2, buttonY + buttonHeight / 2);
    };

    const drawVictoryOverlay = (state: JungleState) => {
      ctx.fillStyle = OVERLAY_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#27ae60';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VICTOIRE!', canvas.width / 2, canvas.height / 2 - 60);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = '24px Arial';
      ctx.fillText(`Score final: ${state.score}`, canvas.width / 2, canvas.height / 2);

      ctx.font = '18px Arial';
      ctx.fillText('Tous les animaux ont \u00E9t\u00E9 sauv\u00E9s!', canvas.width / 2, canvas.height / 2 + 35);

      // Restart button
      const buttonY = canvas.height / 2 + 80;
      const buttonWidth = 180;
      const buttonHeight = 50;
      const buttonX = canvas.width / 2 - buttonWidth / 2;

      ctx.fillStyle = BUTTON_COLOR;
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
      ctx.fill();
      ctx.fillStyle = BUTTON_TEXT_COLOR;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RECOMMENCER', canvas.width / 2, buttonY + buttonHeight / 2);
    };

    const drawFrame = (state: JungleState) => {
      // Clear canvas
      ctx.fillStyle = CANVAS_BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state.phase === 'playing') {
        drawJungleZone(state);
        drawSprinklerBall(state);
        state.fireJets.forEach(drawFireJet);
        if (state.currentAnimal) {
          drawAnimal(state.currentAnimal);
        }
        drawUI(state);
      } else if (state.phase === 'menu') {
        drawMenuOverlay();
      } else if (state.phase === 'gameOver') {
        drawJungleZone(state);
        drawSprinklerBall(state);
        state.fireJets.forEach(drawFireJet);
        drawGameOverOverlay(state);
      } else if (state.phase === 'victory') {
        drawJungleZone(state);
        drawVictoryOverlay(state);
      }
    };

    // Restart game function
    const restartGame = () => {
      gameStateRef.current = createInitialState();
    };

    // Start game function
    const startGame = () => {
      const state = gameStateRef.current;
      if (!state) return;
      state.phase = 'playing';
      state.speedMultiplier = speedMultiplierRef.current;
      state.sprinkler = createSprinkler();
      state.fireJets = [];
      state.animalIndex = 0;
      state.score = 0;
      state.currentAnimal = createAnimal(0);
      state.jungleZoneY = getJungleZoneY();
    };

    // Check if point is inside the start/restart button
    const isOnButton = (x: number, y: number, phase: string): boolean => {
      let buttonY: number;
      if (phase === 'menu') {
        buttonY = canvas.height / 2 + 190;
      } else {
        buttonY = canvas.height / 2 + (phase === 'gameOver' ? 50 : 80);
      }
      const buttonWidth = 180;
      const buttonHeight = 50;
      const buttonX = canvas.width / 2 - buttonWidth / 2;
      return x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight;
    };

    // Check if point is inside the slider
    const isOnSlider = (x: number, y: number): boolean => {
      const sliderY = canvas.height / 2 + 10;
      const sliderWidth = 240;
      const sliderX = canvas.width / 2 - sliderWidth / 2;
      const sliderHeight = 24;
      return x >= sliderX && x <= sliderX + sliderWidth && y >= sliderY && y <= sliderY + sliderHeight;
    };

    // Mouse click handler
    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const state = gameStateRef.current;
      if (!state) return;

      if (state.phase === 'menu') {
        if (isOnSlider(x, y)) {
          const sliderWidth = 240;
          const sliderX = canvas.width / 2 - sliderWidth / 2;
          const sliderProgress = Math.max(0, Math.min(1, (x - sliderX) / sliderWidth));
          const newMultiplier = 0.5 + sliderProgress * 1.5;
          speedMultiplierRef.current = newMultiplier;
          state.speedMultiplier = newMultiplier;
          return;
        }
        if (isOnButton(x, y, 'menu')) {
          startGame();
        }
      } else if (state.phase === 'gameOver' || state.phase === 'victory') {
        if (isOnButton(x, y, state.phase)) {
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

      if (isOnSlider(x, y)) {
        const sliderWidth = 240;
        const sliderX = canvas.width / 2 - sliderWidth / 2;
        const sliderProgress = Math.max(0, Math.min(1, (x - sliderX) / sliderWidth));
        const newMultiplier = 0.5 + sliderProgress * 1.5;
        speedMultiplierRef.current = newMultiplier;
        state.speedMultiplier = newMultiplier;
      }
    };

    // Keyboard handlers
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') keysRef.current.left = true;
      if (event.key === 'ArrowRight') keysRef.current.right = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') keysRef.current.left = false;
      if (event.key === 'ArrowRight') keysRef.current.right = false;
    };

    // Touch handlers — only in jungle zone
    const handleTouchStart = (event: TouchEvent) => {
      const state = gameStateRef.current;
      if (!state) return;

      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      const y = touch.clientY - rect.top;

      // Only accept touch in jungle zone
      if (y >= state.jungleZoneY) {
        touchRef.current.startX = touch.clientX;
        touchRef.current.currentX = touch.clientX;
        touchRef.current.active = true;
        touchRef.current.zoneCheck = true;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchRef.current.active || !touchRef.current.zoneCheck || event.touches.length === 0) return;
      const touch = event.touches[0];
      touchRef.current.currentX = touch.clientX;
    };

    const handleTouchEnd = () => {
      touchRef.current.active = false;
      touchRef.current.zoneCheck = false;
    };

    // Game loop
    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      frameCountRef.current++;

      // Calculate deltaTime in seconds
      let deltaTime = 0;
      if (lastTimeRef.current > 0) {
        deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05); // cap at 50ms
      }
      lastTimeRef.current = currentTime;

      const state = gameStateRef.current;
      if (state && state.phase === 'playing') {
        // Update sprinkler rotation
        state.sprinkler.angle += state.sprinkler.rotationSpeed * deltaTime * state.speedMultiplier;

        // Shoot fire jets
        state.sprinkler.shootTimer += deltaTime * state.speedMultiplier;
        if (state.sprinkler.shootTimer >= state.sprinkler.shootInterval) {
          state.sprinkler.shootTimer = 0;
          spawnFireJet(state);
        }

        // Update fire jets
        for (let i = state.fireJets.length - 1; i >= 0; i--) {
          const jet = state.fireJets[i];
          jet.x += jet.vx * deltaTime;
          jet.y += jet.vy * deltaTime;

          // Update trail
          jet.trail.unshift({ x: jet.x, y: jet.y, alpha: 1.0 });
          if (jet.trail.length > FIRE_JET_TRAIL_LENGTH) {
            jet.trail.pop();
          }
          // Fade trail
          for (let t = 0; t < jet.trail.length; t++) {
            jet.trail[t].alpha = 1.0 - (t / jet.trail.length);
          }

          // Remove jets that are off screen
          if (jet.y > canvas.height + jet.radius || jet.x < -jet.radius || jet.x > canvas.width + jet.radius) {
            state.fireJets.splice(i, 1);
          }
        }

        // Move current animal with keyboard
        if (state.currentAnimal) {
          const animal = state.currentAnimal;
          if (keysRef.current.left) {
            animal.x = Math.max(0, animal.x - ANIMAL_MOVE_SPEED * deltaTime);
          }
          if (keysRef.current.right) {
            animal.x = Math.min(canvas.width - animal.width, animal.x + ANIMAL_MOVE_SPEED * deltaTime);
          }

          // Move current animal with touch
          if (touchRef.current.active) {
            const deltaX = touchRef.current.currentX - touchRef.current.startX;
            const newX = animal.x + deltaX;
            animal.x = Math.max(0, Math.min(canvas.width - animal.width, newX));
            touchRef.current.startX = touchRef.current.currentX;
          }

          // Check if animal reached right edge (saved)
          if (animal.x + animal.width >= canvas.width - 5) {
            state.score += animal.hp;
            state.animalIndex++;
            if (state.animalIndex >= ANIMAL_DEFS.length) {
              // All animals passed — victory!
              state.phase = 'victory';
              state.currentAnimal = null;
            } else {
              state.currentAnimal = createAnimal(state.animalIndex);
            }
          }
        }

        // Collision detection: fire jets vs current animal
        if (state.currentAnimal && state.fireJets.length > 0) {
          const animal = state.currentAnimal;
          // Animal collision circle (center of emoji)
          const animalCircle = {
            x: animal.x + animal.width / 2,
            y: animal.y + animal.height / 2,
            radius: animal.width / 2 * 0.7, // slightly smaller than full width for better feel
          };

          for (let i = state.fireJets.length - 1; i >= 0; i--) {
            const jet = state.fireJets[i];
            const jetCircle = { x: jet.x, y: jet.y, radius: jet.radius };

            if (circlesOverlap(jetCircle, animalCircle)) {
              animal.hp--;
              state.fireJets.splice(i, 1);

              if (animal.hp <= 0) {
                // Animal died
                state.currentAnimal = null;
                state.animalIndex++;
                if (state.animalIndex >= ANIMAL_DEFS.length) {
                  // All animals dead — game over
                  state.phase = 'gameOver';
                } else {
                  state.currentAnimal = createAnimal(state.animalIndex);
                }
              }
            }
          }
        }

        // Update jungle zone Y (in case of resize)
        state.jungleZoneY = getJungleZoneY();
      }

      // Render current frame
      if (state) {
        drawFrame(state);
      }

      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Add event listeners
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
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
        touchAction: 'none',
      }}
    />
  );
};

export default GameCanvas;
