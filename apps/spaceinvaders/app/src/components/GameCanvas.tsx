import React, { useEffect, useRef, useState } from 'react';
import { createGameEngine } from '@/game/game-engine';
import { createInputController } from '@/game/input-controller';
import type { GameEngine } from '@/game/game-engine';
import type { GameFrameState, GamePhase, ShieldState } from '@/game/types';
import { logger } from '@/lib/logger';

interface CanvasSize {
  width: number;
  height: number;
}

function getParentSize(element: HTMLElement | null): CanvasSize {
  const parent = element?.parentElement;
  return {
    width: parent?.clientWidth ?? 0,
    height: parent?.clientHeight ?? 0,
  };
}

function renderShield(
  context: CanvasRenderingContext2D,
  shield: ShieldState,
): void {
  if (shield.durability <= 0 || shield.width <= 0 || shield.height <= 0) {
    return;
  }

  const durabilityRatio = shield.durability / shield.maxDurability;
  const damageRatio = 1 - durabilityRatio;
  const shieldLeft = shield.x - shield.width / 2;
  const shieldTop = shield.y - shield.height / 2;

  context.save();
  context.fillStyle = `rgba(74, 222, 128, ${0.35 + durabilityRatio * 0.65})`;
  context.fillRect(shieldLeft, shieldTop, shield.width, shield.height);

  const holeCount = Math.floor(damageRatio * 6);
  for (let index = 0; index < holeCount; index += 1) {
    const holeWidth = Math.max(4, shield.width * 0.12);
    const holeHeight = Math.max(3, shield.height * 0.2);
    const progress = (index + 1) / (holeCount + 1);
    const holeX = shieldLeft + progress * (shield.width - holeWidth);
    const holeY = shieldTop + (index % 2 === 0 ? shield.height * 0.2 : shield.height * 0.55);
    context.clearRect(holeX, holeY, holeWidth, holeHeight);
  }

  context.restore();
}

export function GameCanvas(): React.ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [phase, setPhase] = useState<GamePhase>('running');

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) {
      logger.error('[game-canvas] host/canvas is not mounted');
      return;
    }

    let context: CanvasRenderingContext2D | null = null;
    try {
      context = canvas.getContext('2d');
    } catch (error) {
      logger.error('[game-canvas] canvas 2D context is not available', error);
    }
    if (!context) {
      logger.error('[game-canvas] failed to initialize 2D context');
      return;
    }

    const renderFrame = (frame: GameFrameState): void => {
      setPhase(frame.phase);
      context.clearRect(0, 0, frame.width, frame.height);
      context.fillStyle = '#0f172a';
      context.fillRect(0, 0, frame.width, frame.height);

      context.fillStyle = '#f8fafc';
      for (const alien of frame.alienWave.aliens) {
        context.fillRect(alien.x, alien.y, alien.width, alien.height);
      }

      context.fillStyle = '#fb7185';
      for (const missile of frame.alienWave.missiles) {
        context.fillRect(missile.x - 1, missile.y, 2, 12);
      }

      if (frame.cannon) {
        context.fillStyle = '#22d3ee';
        context.fillRect(
          frame.cannon.x - frame.cannon.width / 2,
          frame.cannon.y - frame.cannon.height / 2,
          frame.cannon.width,
          frame.cannon.height,
        );
      }

      context.fillStyle = '#22c55e';
      for (const missile of frame.playerMissiles) {
        context.fillRect(missile.x - 1, missile.y - 12, 2, 12);
      }

      for (const shield of frame.shields) {
        renderShield(context, shield);
      }

      context.fillStyle = '#e2e8f0';
      context.font = '16px sans-serif';
      context.textAlign = 'left';
      context.fillText(`Phase: ${frame.phase}`, 16, 28);
      context.fillText(`Movement Δ: ${frame.movementDelta.toFixed(2)}`, 16, 52);
      context.fillText(`Fire events: ${frame.fireCount}`, 16, 76);
      context.fillText(`Wave drops: ${frame.alienWave.dropCount}`, 16, 100);
      context.fillText(
        `Missiles A/P: ${frame.alienWave.missiles.length}/${frame.playerMissiles.length}`,
        16,
        124,
      );
      context.fillText(`Shields: ${frame.shields.length}`, 16, 148);
    };

    const engine = createGameEngine(renderFrame);
    engineRef.current = engine;
    const inputController = createInputController(host, engine.getIntentSink());

    try {
      engine.setPhase('running');
      engine.start();
    } catch (error) {
      logger.error('[game-canvas] failed to start game runtime', error);
    }

    return () => {
      inputController.cleanup();
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let resizeObserver: ResizeObserver | null = null;

    const updateSize = (): void => {
      const nextSize = getParentSize(host);

      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(nextSize.width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(nextSize.height * devicePixelRatio));
      let context: CanvasRenderingContext2D | null = null;
      try {
        context = canvas.getContext('2d');
      } catch (error) {
        logger.error('[game-canvas] canvas 2D context is not available', error);
      }
      context?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      engineRef.current?.resize(nextSize.width, nextSize.height);
    };

    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateSize);
      if (host.parentElement) {
        resizeObserver.observe(host.parentElement);
      }
    } else {
      window.addEventListener('resize', updateSize);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="flex-grow overflow-hidden"
      data-testid="game-canvas-host"
      aria-label="Game canvas host"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        aria-label="Space Invaders game canvas"
      />
      <div className="sr-only" data-testid="game-phase">
        {phase}
      </div>
    </div>
  );
}

export default GameCanvas;
