import type { ReactElement } from 'react';
import { GameCanvas } from '@/components/GameCanvas';

export function GameScreen(): ReactElement {
  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      <GameCanvas />
    </div>
  );
}
