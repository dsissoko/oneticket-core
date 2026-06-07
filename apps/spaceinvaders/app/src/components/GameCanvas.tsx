import { useEffect, useRef } from 'react';
import { GameEngine } from '@/game/engine/GameEngine';
import { InputController } from '@/game/input/InputController';

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
      const { width, height } = logicalDimensionsRef.current;
      const inputIntents = inputControllerRef.current.consumeIntents();
      const frame = gameEngineRef.current.tick(timestamp, width, height, inputIntents);

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

      context.fillStyle = '#7fffd4';
      context.font = '16px monospace';
      context.fillText(`logical: ${frame.playfield.width}x${frame.playfield.height}`, 16, 28);
      context.fillText(`aliens: ${frame.debug.activeAliens}`, 16, 52);
      context.fillText(`enemy missiles: ${frame.debug.enemyMissiles}`, 16, 76);
      context.fillText(`player missiles: ${frame.debug.playerMissiles}`, 16, 100);

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
      detachInput();
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  return <canvas aria-label="SpaceInvaders game canvas" className="game-canvas" ref={canvasRef} />;
}
