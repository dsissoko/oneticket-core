/**
 * RestartHandler — resets all game state to initial values
 * Called when player clicks restart after game over
 */

import type { GameLoopState } from '../types'

export interface RestartContext {
  gameState: GameLoopState
  onReset: () => void
}

export class RestartHandler {
  /**
   * Reset all game state to initial values
   * Called when player clicks restart on game over screen
   */
  reset(gameState: GameLoopState): void {
    console.log('Game reset: wave=1, lives=3, score=0, gameState=Start')

    // Reset core game state
    gameState.gameState = 'Start'
    gameState.waveNumber = 1
    gameState.lives = 3
    gameState.score = 0

    // Clear all entities
    gameState.formation = null
    gameState.player = null
    gameState.bullets = []
    gameState.shields = []
    gameState.mysteryShip = null
    gameState.mysteryShipSpawner = null

    // Reset input
    gameState.inputState = {
      left: false,
      right: false,
      fire: false
    }

    // Reset timers
    gameState.deltaTime = 0
    gameState.lastFrameTime = 0
  }

  /**
   * Validate that state was properly reset
   */
  validateReset(gameState: GameLoopState): boolean {
    return (
      gameState.gameState === 'Start' &&
      gameState.waveNumber === 1 &&
      gameState.lives === 3 &&
      gameState.score === 0 &&
      gameState.formation === null &&
      gameState.player === null &&
      gameState.bullets.length === 0 &&
      gameState.shields.length === 0
    )
  }
}
