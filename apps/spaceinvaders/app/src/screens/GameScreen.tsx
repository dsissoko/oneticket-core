import React, { useState } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import type { GameEndReason, GamePhase } from '@/game/types';

function getEndReasonLabel(endReason: GameEndReason | null): string | null {
  if (!endReason) {
    return null;
  }

  const endReasonLabel: Record<GameEndReason, string> = {
    allAliensDestroyed: 'All aliens destroyed',
    alienLineReached: 'Aliens reached the cannon line',
    cannonHit: 'The cannon was hit',
  };

  return endReasonLabel[endReason];
}

/**
 * GameScreen Component
 *
 * Hosts the SpaceInvaders runtime canvas inside AppShell content area.
 */
export function GameScreen(): React.ReactElement {
  const [phase, setPhase] = useState<GamePhase>('running');
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [endReason, setEndReason] = useState<GameEndReason | null>(null);
  const [restartGame, setRestartGame] = useState<() => void>(() => () => {
    // no-op until runtime is initialized
  });

  const endTitle = phase === 'victory' ? 'Victory!' : 'Game Over';
  const endReasonLabel = getEndReasonLabel(endReason);

  return (
    <div className="flex-grow flex flex-col overflow-hidden relative" data-testid="game-screen-root">
      <GameCanvas
        onPhaseChange={setPhase}
        onScoreChange={setCurrentScore}
        onBestScoreChange={setBestScore}
        onFinalScoreChange={setFinalScore}
        onEndReasonChange={setEndReason}
        onRestartReady={(restart) => {
          setRestartGame(() => restart);
        }}
      />
      <div className="sr-only" data-testid="game-phase">
        {phase}
      </div>
      <div className="sr-only" data-testid="game-score">
        {currentScore}
      </div>
      <div className="sr-only" data-testid="best-score">
        {bestScore}
      </div>
      {phase !== 'running' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="flex min-w-64 flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/95 p-6 text-slate-100">
            <h2 className="text-2xl font-semibold">{endTitle}</h2>
            {endReasonLabel ? <p>{endReasonLabel}</p> : null}
            <p className="text-lg">Final score: {finalScore ?? currentScore}</p>
            <button
              type="button"
              onClick={restartGame}
              className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Restart
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GameScreen;
