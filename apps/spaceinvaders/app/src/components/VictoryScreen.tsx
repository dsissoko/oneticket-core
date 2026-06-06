/**
 * VictoryScreen — displays wave completion with score and countdown
 */

import React from 'react'

interface VictoryScreenProps {
  waveNumber: number
  score: number
  countdown: number // milliseconds remaining
}

export function VictoryScreen({
  waveNumber,
  score,
  countdown
}: VictoryScreenProps): React.ReactElement {
  // Convert milliseconds to seconds (rounded to 1 decimal)
  const countdownSeconds = Math.max(0, Math.ceil(countdown / 1000))

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-400 mb-6 font-mono">
          VICTORY!
        </h1>

        <p className="text-2xl text-green-300 mb-8 font-mono">
          Wave {waveNumber} Complete
        </p>

        <p className="text-3xl text-green-400 font-bold mb-12 font-mono">
          Score: {score}
        </p>

        <div className="mt-8 pt-6 border-t-2 border-green-400">
          <p className="text-xl text-green-300 font-mono">
            Wave {waveNumber + 1} starts in
          </p>
          <p className="text-4xl text-green-400 font-bold font-mono">
            {countdownSeconds}s
          </p>
        </div>
      </div>
    </div>
  )
}

export default VictoryScreen
