/**
 * FireController — orchestrates enemy firing logic
 * Random enemy from each column fires on a per-column timer
 */

import type { Formation } from './entities/Formation'
import type { Enemy } from './entities/Enemy'
import { BulletPool } from './BulletPool'

export class FireController {
  private fireTimers: Map<number, number> = new Map() // Per-column timers
  private baseFireInterval: number = 2000 // ms, base fire rate
  private fireInterval: number = 2000 // ms, adjusted per wave
  private columnCount: number = 11 // 11 columns in formation

  constructor(baseFireInterval: number = 2000) {
    this.baseFireInterval = baseFireInterval
    this.fireInterval = baseFireInterval

    // Initialize fire timers for all columns with random offset
    for (let col = 0; col < this.columnCount; col++) {
      // Random offset ±20% of base interval
      const offset = (Math.random() - 0.5) * 0.4 * this.fireInterval
      this.fireTimers.set(col, this.fireInterval + offset)
    }

    console.log(`FireController initialized with ${this.columnCount} columns`)
  }

  /**
   * Update fire controller each frame
   * Decrements timers and fires when timers reach 0
   */
  update(deltaTime: number, formation: Formation, bulletPool: BulletPool, waveNumber: number): void {
    // Calculate fire interval based on wave progression
    this.fireInterval = this.calculateFireInterval(waveNumber, formation.countAliveEnemies())

    // Decrement all column timers
    for (let col = 0; col < this.columnCount; col++) {
      const currentTimer = this.fireTimers.get(col) ?? 0
      const newTimer = currentTimer - deltaTime

      if (newTimer <= 0) {
        // Time to fire!
        const enemy = this.selectRandomEnemy(col, formation)
        if (enemy) {
          bulletPool.fire(enemy.x + enemy.width / 2, enemy.y + enemy.height)
        }

        // Reset timer with random offset ±20%
        const offset = (Math.random() - 0.5) * 0.4 * this.fireInterval
        this.fireTimers.set(col, this.fireInterval + offset)
      } else {
        this.fireTimers.set(col, newTimer)
      }
    }
  }

  /**
   * Calculate fire interval based on wave progression
   * Wave 1: 2000ms
   * Wave 2: 2000 * 0.9 = 1800ms
   * Wave 3: 2000 * 0.81 = 1620ms
   * Formula: baseInterval * (0.9)^(waveNumber - 1)
   */
  calculateFireInterval(waveNumber: number, enemyCount: number): number {
    const waveMultiplier = Math.pow(0.9, waveNumber - 1)
    const interval = this.baseFireInterval * waveMultiplier

    // Alternative: scale by enemy count (optional)
    // const enemyScaling = Math.max(0.5, enemyCount / 55)
    // return interval * enemyScaling

    return Math.max(500, interval) // Minimum 500ms between fire events
  }

  /**
   * Select a random alive enemy from the given column
   * Returns null if no alive enemies in column
   */
  selectRandomEnemy(columnIndex: number, formation: Formation): Enemy | null {
    const aliveEnemies = formation.getAliveEnemies()

    // Filter enemies in this column
    const columnEnemies = aliveEnemies.filter((enemy) => {
      const enemyIndex = formation.enemies.indexOf(enemy)
      return enemyIndex % 11 === columnIndex
    })

    if (columnEnemies.length === 0) {
      return null
    }

    // Select random enemy from column
    const randomIndex = Math.floor(Math.random() * columnEnemies.length)
    return columnEnemies[randomIndex]
  }

  /**
   * Reset fire controller for new wave
   */
  reset(): void {
    this.fireTimers.clear()
    for (let col = 0; col < this.columnCount; col++) {
      const offset = (Math.random() - 0.5) * 0.4 * this.fireInterval
      this.fireTimers.set(col, this.fireInterval + offset)
    }
    console.log('FireController reset for new wave')
  }
}
