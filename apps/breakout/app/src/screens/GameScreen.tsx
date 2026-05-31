import React, { useState } from 'react';
import { GameCanvas } from '../components';

/**
 * GameScreen Component
 *
 * Renders the Breakout game canvas within the AppLayout.
 * Takes all available vertical space between header and footer.
 * Provides a speed multiplier control above the canvas.
 */
export function GameScreen(): React.ReactElement {
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeedMultiplier(newSpeed);
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      {/* Speed Control Panel */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center gap-4">
        <label className="text-sm font-semibold text-gray-700">Game Speed:</label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={speedMultiplier}
          onChange={handleSpeedChange}
          className="w-32"
          aria-label="Game speed multiplier"
        />
        <span className="text-sm font-medium text-gray-700 min-w-12">
          {speedMultiplier.toFixed(1)}x
        </span>
      </div>

      {/* Game Canvas */}
      <GameCanvas speedMultiplier={speedMultiplier} onSpeedMultiplierChange={setSpeedMultiplier} />
    </div>
  );
}

export default GameScreen;
