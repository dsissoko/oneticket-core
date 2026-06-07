import type { ReactElement } from 'react';
import type { EndStatePayload, GamePhase } from '@/game/engine/GameEngine';

type EndStateOverlayProps = {
  phase: Exclude<GamePhase, 'running'>;
  endState: EndStatePayload;
  onRestart: () => void;
};

const REASON_LABELS: Record<EndStatePayload['reason'], string> = {
  cannonHit: 'Your cannon was destroyed.',
  alienLineBreach: 'Aliens reached your defense line.',
  allAliensDestroyed: 'All aliens eliminated.',
};

export function EndStateOverlay({ phase, endState, onRestart }: EndStateOverlayProps): ReactElement {
  return (
    <div className="end-state-overlay" role="dialog" aria-live="polite" aria-modal="true">
      <div className="end-state-overlay__card">
        <h2 className="end-state-overlay__title">{phase === 'victory' ? 'Victory' : 'Game Over'}</h2>
        <p className="end-state-overlay__reason">{REASON_LABELS[endState.reason]}</p>
        <p className="end-state-overlay__score">Final Score: {endState.finalScore}</p>
        <button className="end-state-overlay__restart" type="button" onClick={onRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}
