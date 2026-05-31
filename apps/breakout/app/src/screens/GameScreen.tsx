import React from 'react';
import { GameCanvas } from '../components';

/**
 * GameScreen Component
 *
 * Renders the Breakout game canvas within the AppLayout.
 * Takes all available vertical space between header and footer.
 */
export function GameScreen(): React.ReactElement {
  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      <GameCanvas />
    </div>
  );
}

export default GameScreen;
