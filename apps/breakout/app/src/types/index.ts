/**
 * Game state type definitions for the Breakout game
 */

/**
 * Ball object - represents the ball in the game
 */
export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

/**
 * Paddle object - represents the player's paddle
 */
export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Brick object - represents a destructible brick
 */
export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}

/**
 * Game phase - represents the current state of the game
 */
export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'victory';

/**
 * GameState - complete game state object
 */
export interface GameState {
  phase: GamePhase;
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[];
  lives: number;
  speedMultiplier: number;
}
