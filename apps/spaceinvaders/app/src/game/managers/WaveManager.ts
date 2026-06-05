/**
 * WaveManager — manages wave progression and difficulty scaling
 */

export interface WaveConfig {
  speedMultiplier: number
  fireRateMultiplier: number
}

export class WaveManager {
  private currentWave: number = 1
  private baseFormationSpeed: number = 100 // pixels/sec at wave 1
  private baseEnemyFireInterval: number = 1000 // milliseconds at wave 1
  private readonly waveSpeedMultiplier: number = 1.1 // 10% increase per wave

  constructor(initialWave: number = 1) {
    this.currentWave = initialWave
  }

  /**
   * Get the current wave number
   */
  getWave(): number {
    return this.currentWave
  }

  /**
   * Increment to next wave
   */
  incrementWave(): void {
    this.currentWave += 1
    console.log(`Wave progression: → ${this.currentWave}`)
  }

  /**
   * Reset to a specific wave number
   */
  resetToWave(waveNumber: number): void {
    this.currentWave = waveNumber
  }

  /**
   * Get formation speed multiplier for current wave
   * Formula: 1.1 ^ (waveNumber - 1)
   * Wave 1 → 1.0, Wave 2 → 1.1, Wave 3 → 1.21, etc.
   */
  getFormationSpeedMultiplier(): number {
    return Math.pow(this.waveSpeedMultiplier, this.currentWave - 1)
  }

  /**
   * Get enemy fire rate multiplier for current wave
   * Returns inverse: 1 / (1.1 ^ (waveNumber - 1))
   * Shorter interval = faster fire rate
   * Wave 1 → 1.0, Wave 2 → 0.909, Wave 3 → 0.826, etc.
   */
  getEnemyFireIntervalMultiplier(): number {
    return 1 / Math.pow(this.waveSpeedMultiplier, this.currentWave - 1)
  }

  /**
   * Get complete wave configuration
   */
  getWaveConfig(): WaveConfig {
    return {
      speedMultiplier: this.getFormationSpeedMultiplier(),
      fireRateMultiplier: this.getEnemyFireIntervalMultiplier()
    }
  }

  /**
   * Get formation speed for current wave
   */
  getFormationSpeed(): number {
    return this.baseFormationSpeed * this.getFormationSpeedMultiplier()
  }

  /**
   * Get enemy fire interval for current wave
   */
  getEnemyFireInterval(): number {
    return this.baseEnemyFireInterval * this.getEnemyFireIntervalMultiplier()
  }
}
