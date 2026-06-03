/**
 * Player Model
 * Foundational model representing a player in the Breakout game
 */

export interface PlayerProperties {
  id: string;
  name: string;
  score: number;
}

export class Player implements PlayerProperties {
  id: string;
  name: string;
  score: number;

  constructor(id: string, name: string, score: number = 0) {
    this.id = id;
    this.name = name;
    this.score = score;
  }

  /**
   * Increment player score
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * Reset player score
   */
  resetScore(): void {
    this.score = 0;
  }
}
