import React from 'react';
import { GameCanvas } from '../components';

/**
 * GameScreen Component
 *
 * Renders the Jungle-op game canvas within the AppLayout.
 * Takes all available vertical space between header and footer.
 * Speed selection is only available in the menu screen via canvas slider.
 */
export function GameScreen(): React.ReactElement {
  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      {/* Game Canvas */}
      <GameCanvas />
    </div>
  );
}

export default GameScreen;
