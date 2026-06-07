import React from 'react';
import { GameCanvas } from '@/components/GameCanvas';

/**
 * GameScreen Component
 *
 * Hosts the SpaceInvaders runtime canvas inside AppShell content area.
 */
export function GameScreen(): React.ReactElement {
  return (
    <div className="flex-grow flex flex-col overflow-hidden" data-testid="game-screen-root">
      <GameCanvas />
    </div>
  );
}

export default GameScreen;
