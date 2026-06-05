/**
 * HUD Component - Game status overlay
 */

import React from 'react'

interface HUDProps {
  score: number
  lives: number
  waveNumber: number
}

export function HUD({ score, lives, waveNumber }: HUDProps): React.ReactElement {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between text-green-400 font-mono font-bold text-lg pointer-events-none">
      <div>Score: {score}</div>
      <div>Lives: {lives}</div>
      <div>Wave: {waveNumber}</div>
    </div>
  )
}

export default HUD
