/**
 * VictoryDetector — monitors victory conditions
 * Victory is triggered when all enemies are destroyed (alive count === 0)
 */

import type { Formation } from '../entities/Formation'

export interface VictoryData {
  waveNumber: number
  currentScore: number
  enemiesDestroyed: number
  totalEnemies: number
}

export class VictoryDetector {
  private lastCheckTime: number = 0

  /**
   * Check if victory condition is met
   * Returns true when all enemies are destroyed (formation has 0 alive enemies)
   */
  checkVictory(formation: Formation | null): boolean {
    if (!formation) {
      return false
    }

    const aliveCount = formation.countAliveEnemies()
    const victoryCondition = aliveCount === 0

    if (victoryCondition) {
      console.log(`Victory! All enemies destroyed (alive: 0)`)
    }

    return victoryCondition
  }

  /**
   * Get victory data for display
   */
  getVictoryData(
    formation: Formation | null,
    waveNumber: number,
    currentScore: number
  ): VictoryData {
    const totalEnemies = 55
    const aliveCount = formation?.countAliveEnemies() ?? 0
    const enemiesDestroyed = totalEnemies - aliveCount

    return {
      waveNumber,
      currentScore,
      enemiesDestroyed,
      totalEnemies
    }
  }

  /**
   * Reset detector state
   */
  reset(): void {
    this.lastCheckTime = 0
  }
}
