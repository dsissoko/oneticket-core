/**
 * ScoreManager Module
 * Manages game scoring system
 */

class ScoreManager {
  /**
   * Initialize ScoreManager with gameState reference
   * @param {Object} gameState - The game state object
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.gameState.score = 0;
  }

  /**
   * Add points to the current score
   * @param {number} points - Number of points to add
   */
  addScore(points) {
    if (typeof points !== 'number' || points < 0) {
      console.warn('Invalid points value:', points);
      return;
    }
    this.gameState.score += points;
  }

  /**
   * Reset the score to 0
   */
  resetScore() {
    this.gameState.score = 0;
  }

  /**
   * Get the current score
   * @returns {number} Current score
   */
  getScore() {
    return this.gameState.score;
  }
}

export default ScoreManager;
