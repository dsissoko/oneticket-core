/**
 * ScoreManager — manages cumulative score across waves
 * Score persists across wave transitions but resets only on full game restart
 */

export class ScoreManager {
  private cumulativeScore: number = 0

  constructor(initialScore: number = 0) {
    this.cumulativeScore = initialScore
  }

  /**
   * Get current cumulative score
   */
  getScore(): number {
    return this.cumulativeScore
  }

  /**
   * Add points to score (called on enemy kill or bonus)
   */
  addScore(points: number): void {
    if (points < 0) {
      console.warn('Negative score points attempted:', points)
      return
    }
    this.cumulativeScore += points
    console.log(`Score +${points} → ${this.cumulativeScore}`)
  }

  /**
   * Set score to specific value
   */
  setScore(score: number): void {
    this.cumulativeScore = score
  }

  /**
   * Reset score to 0 (only on full game restart, NOT on wave transition)
   */
  resetScore(): void {
    this.cumulativeScore = 0
    console.log('Score reset: 0')
  }
}
