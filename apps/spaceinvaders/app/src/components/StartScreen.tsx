/**
 * StartScreen Component - Title and start button for the game
 */

import React from 'react'
import { Button } from '@/components/ui/button'

interface StartScreenProps {
  onStartGame: () => void
}

export function StartScreen({ onStartGame }: StartScreenProps): React.ReactElement {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-400 mb-4 font-mono">
          SPACE INVADERS
        </h1>
        <p className="text-xl text-green-300 mb-8 font-mono">
          Protect Earth from the Invaders
        </p>
        <Button
          onClick={onStartGame}
          className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 text-lg font-mono"
        >
          START GAME
        </Button>
        <div className="mt-8 text-green-300 text-sm font-mono">
          <p>Arrow Keys to Move</p>
          <p>Spacebar to Fire</p>
        </div>
      </div>
    </div>
  )
}

export default StartScreen
