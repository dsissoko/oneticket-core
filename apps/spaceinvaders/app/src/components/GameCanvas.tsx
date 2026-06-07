import React, { useEffect, useRef, useState } from 'react';
import { createGameEngine } from '@/game/game-engine';
import { createInputController } from '@/game/input-controller';
import type { GameEngine } from '@/game/game-engine';
import type { GameEndReason, GameFrameState, GamePhase, ShieldState } from '@/game/types';
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

interface GameCanvasProps {
  onPhaseChange?: (phase: GamePhase) => void;
  onScoreChange?: (currentScore: number) => void;
  onBestScoreChange?: (bestScore: number) => void;
  onFinalScoreChange?: (finalScore: number | null) => void;
  onEndReasonChange?: (endReason: GameEndReason | null) => void;
  onRestartReady?: (restart: () => void) => void;
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

export function GameCanvas({
  onPhaseChange,
  onScoreChange,
  onBestScoreChange,
  onFinalScoreChange,
  onEndReasonChange,
  onRestartReady,
}: GameCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [phase, setPhase] = useState<GamePhase>('running');
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [endReason, setEndReason] = useState<GameEndReason | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      logger.error('[game-canvas] canvas is not mounted');
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
      setCurrentScore(frame.currentScore);
      setBestScore(frame.bestScore);
      setFinalScore(frame.finalScore);
      setEndReason(frame.endReason);

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
      context.font = '600 18px sans-serif';
      context.textBaseline = 'top';
      context.textAlign = 'left';
      context.fillText(`Score: ${frame.currentScore}`, 16, 12);
      context.textAlign = 'right';
      context.fillText(`Best: ${frame.bestScore}`, Math.max(16, frame.width - 16), 12);
    };

    const engine = createGameEngine(renderFrame);
    engineRef.current = engine;
    onRestartReady?.(() => {
      engineRef.current?.restart();
    });
    const inputController = createInputController(canvas, engine.getIntentSink());

    let resizeObserver: ResizeObserver | null = null;

    const updateSize = (): void => {
      const nextSize = getParentSize(canvas);
      const width = Math.max(1, Math.floor(nextSize.width));
      const height = Math.max(1, Math.floor(nextSize.height));

      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));

      let nextContext: CanvasRenderingContext2D | null = null;
      try {
        nextContext = canvas.getContext('2d');
      } catch (error) {
        logger.error('[game-canvas] canvas 2D context is not available', error);
      }
      nextContext?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      engineRef.current?.resize(width, height);
    };

    updateSize();

    try {
      engine.setPhase('running');
      engine.start();
    } catch (error) {
      logger.error('[game-canvas] failed to start game runtime', error);
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateSize);
      if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
      }
    } else {
      window.addEventListener('resize', updateSize);
    }

    return () => {
      inputController.cleanup();
      engine.stop();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
      engineRef.current = null;
      onRestartReady?.(() => {
        // no-op when runtime is unmounted
      });
    };
  }, [onRestartReady]);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [onPhaseChange, phase]);

  useEffect(() => {
    onScoreChange?.(currentScore);
  }, [onScoreChange, currentScore]);

  useEffect(() => {
    onBestScoreChange?.(bestScore);
  }, [bestScore, onBestScoreChange]);

  useEffect(() => {
    onFinalScoreChange?.(finalScore);
  }, [finalScore, onFinalScoreChange]);

  useEffect(() => {
    onEndReasonChange?.(endReason);
  }, [endReason, onEndReasonChange]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Space Invaders game canvas"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
}

export default GameCanvas;
