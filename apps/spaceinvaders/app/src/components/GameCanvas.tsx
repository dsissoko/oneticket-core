import { useEffect, useRef, useState } from 'react';
import {
  type EndStatePayload,
  GameEngine,
  type GamePhase,
} from '@/game/engine/GameEngine';
import { InputController } from '@/game/input/InputController';
import { EndStateOverlay } from '@/game/ui/EndStateOverlay';

type LogicalDimensions = {
  width: number;
  height: number;
};

export function GameCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logicalDimensionsRef = useRef<LogicalDimensions>({ width: 1, height: 1 });
  const animationFrameRef = useRef<number | null>(null);
  const gameEngineRef = useRef<GameEngine>(new GameEngine());
  const inputControllerRef = useRef<InputController>(new InputController());
  const [phase, setPhase] = useState<GamePhase>('running');
  const [endState, setEndState] = useState<EndStatePayload | null>(null);
  const phaseRef = useRef<GamePhase>('running');
  const endStateRef = useRef<EndStatePayload | null>(null);
  const restartRequestedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.warn('[SpaceInvaders] Canvas element unavailable at mount');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.warn('[SpaceInvaders] Unable to acquire 2D context');
      return;
    }

    let isUnmounted = false;
    const detachInput = inputControllerRef.current.attach(canvas);

    const updateLogicalDimensions = (): void => {
      if (isUnmounted) return;

      const parent = canvas.parentElement;
      if (!parent) {
        console.warn('[SpaceInvaders] Canvas parent not found while sizing');
        return;
      }

      const width = Math.max(1, Math.floor(parent.clientWidth));
      const height = Math.max(1, Math.floor(parent.clientHeight));

      logicalDimensionsRef.current = { width, height };
      canvas.width = width;
      canvas.height = height;
    };

    const drawFrame = (timestamp: number): void => {
      if (restartRequestedRef.current) {
        gameEngineRef.current.restart();
        restartRequestedRef.current = false;
      }

      const { width, height } = logicalDimensionsRef.current;
      const inputIntents = inputControllerRef.current.consumeIntents();
      const frame = gameEngineRef.current.tick(timestamp, width, height, inputIntents);

      if (frame.phase !== phaseRef.current || frame.endState !== endStateRef.current) {
        phaseRef.current = frame.phase;
        endStateRef.current = frame.endState;
        setPhase(frame.phase);
        setEndState(frame.endState);
      }

      context.clearRect(0, 0, frame.playfield.width, frame.playfield.height);
      context.fillStyle = '#05070e';
      context.fillRect(0, 0, frame.playfield.width, frame.playfield.height);

      context.fillStyle = '#95ff85';
      for (const alien of frame.aliens) {
        if (!alien.isAlive) {
          continue;
        }

        context.fillRect(alien.x, alien.y, alien.width, alien.height);
      }

      for (const shield of frame.shields) {
        if (shield.durability <= 0) {
          continue;
        }

        const alpha = Math.max(0.18, shield.durability / shield.maxDurability);
        context.fillStyle = `rgba(138, 255, 162, ${alpha.toFixed(3)})`;
        context.fillRect(shield.x, shield.y, shield.width, shield.height);

        const totalDamage = shield.maxDurability - shield.durability;
        context.fillStyle = '#05070e';
        for (let index = 0; index < totalDamage; index += 1) {
          const holeXRatio = ((index * 7 + 3) % 10) / 10;
          const holeYRatio = ((index * 5 + 4) % 8) / 8;
          const holeWidth = Math.max(2, shield.width * 0.08);
          const holeHeight = Math.max(2, shield.height * 0.16);
          const holeX = shield.x + holeXRatio * (shield.width - holeWidth);
          const holeY = shield.y + holeYRatio * (shield.height - holeHeight);

          context.fillRect(holeX, holeY, holeWidth, holeHeight);
        }
      }

      context.fillStyle = '#ff6f91';
      for (const missile of frame.enemyMissiles) {
        context.fillRect(missile.x, missile.y, missile.width, missile.height);
      }

      context.fillStyle = '#8fe3ff';
      for (const missile of frame.playerMissiles) {
        context.fillRect(missile.x, missile.y, missile.width, missile.height);
      }

      context.fillStyle = '#ffd166';
      context.fillRect(frame.cannon.x, frame.cannon.y, frame.cannon.width, frame.cannon.height);

      context.fillStyle = '#f8fafc';
      context.font = 'bold 18px monospace';
      context.textBaseline = 'top';
      context.textAlign = 'left';
      context.fillText(`SCORE ${frame.score.current}`, 16, 12);

      context.textAlign = 'right';
      context.fillText(`BEST ${frame.score.best}`, frame.playfield.width - 16, 12);

      context.fillStyle = '#7fffd4';
      context.font = '14px monospace';
      context.textAlign = 'left';
      context.fillText(`logical: ${frame.playfield.width}x${frame.playfield.height}`, 16, 42);
      context.fillText(`aliens: ${frame.debug.activeAliens}`, 16, 62);
      context.fillText(`enemy missiles: ${frame.debug.enemyMissiles}`, 16, 82);
      context.fillText(`player missiles: ${frame.debug.playerMissiles}`, 16, 102);

      if (!isUnmounted) {
        animationFrameRef.current = window.requestAnimationFrame(drawFrame);
      }
    };

    const handleResize = (): void => {
      try {
        updateLogicalDimensions();
      } catch (error) {
        console.error('[SpaceInvaders] Failed to handle canvas resize', error);
      }
    };

    try {
      updateLogicalDimensions();
      window.addEventListener('resize', handleResize);
      animationFrameRef.current = window.requestAnimationFrame(drawFrame);
    } catch (error) {
      console.error('[SpaceInvaders] Failed to initialize canvas runtime', error);
    }

    return () => {
      isUnmounted = true;
      gameEngineRef.current.endRun();
      detachInput();
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  const handleRestart = (): void => {
    restartRequestedRef.current = true;
  };

  return (
    <div className="game-canvas-frame">
      <canvas aria-label="SpaceInvaders game canvas" className="game-canvas" ref={canvasRef} />
      {phase !== 'running' && endState && (
        <EndStateOverlay endState={endState} phase={phase} onRestart={handleRestart} />
      )}
    </div>
  );
}
