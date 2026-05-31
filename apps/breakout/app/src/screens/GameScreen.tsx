import React from 'react';
import { GameCanvas } from '../components';

/**
 * GameScreen Component
 *
 * Wraps the GameCanvas component and provides the game screen layout.
 * Designed for lazy loading in main.tsx via dynamic import.
 * Depends on GameState (task A) and GameCanvas component.
 */
export function GameScreen(): React.ReactElement {
  return (
    <div className="w-full h-screen bg-gray-100">
      <GameCanvas />
    </div>
  );
}

export default GameScreen;
