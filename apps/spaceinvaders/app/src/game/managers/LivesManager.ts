/**
 * LivesManager — manages player lives
 * Lives reset to 3 at each wave start but decrement during play
 */

export class LivesManager {
  private lives: number = 3
  private readonly livesPerWave: number = 3

  constructor(initialLives: number = 3) {
    this.lives = initialLives
  }

  /**
   * Get current lives count
   */
  getLives(): number {
    return this.lives
  }

  /**
   * Lose one life
   */
  loseLive(): number {
    if (this.lives > 0) {
      this.lives -= 1
      console.log(`Lives: ${this.lives + 1} → ${this.lives}`)
    }
    return this.lives
  }

  /**
   * Reset lives to starting count (called at wave start)
   */
  resetLives(): void {
    const prevLives = this.lives
    this.lives = this.livesPerWave
    console.log(`Lives reset: ${prevLives} → ${this.lives} (wave start)`)
  }

  /**
   * Check if game is over (no lives remaining)
   */
  isGameOver(): boolean {
    return this.lives === 0
  }

  /**
   * Set lives to specific value
   */
  setLives(lives: number): void {
    this.lives = lives
  }
}
