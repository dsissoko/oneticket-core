/**
 * GameService
 * Orchestrates Player, Ball, and Paddle to manage game state
 * Depends on tasks A (Player), B (Ball), C (Paddle)
 */

import { Player } from '../models/Player';
import { Ball } from '../models/Ball';
import { Paddle } from '../models/Paddle';

export interface GameStateProperties {
  player: Player;
  ball: Ball;
  paddle: Paddle;
  isRunning: boolean;
}

export class GameService {
  private player: Player;
  private ball: Ball;
  private paddle: Paddle;
  private isRunning: boolean = false;

  constructor(
    playerId: string,
    playerName: string,
    ballX: number,
    ballY: number,
    ballVx: number,
    ballVy: number,
    ballRadius: number,
    paddleX: number,
    paddleY: number,
    paddleWidth: number,
    paddleHeight: number
  ) {
    this.player = new Player(playerId, playerName);
    this.ball = new Ball(ballX, ballY, ballVx, ballVy, ballRadius);
    this.paddle = new Paddle(paddleX, paddleY, paddleWidth, paddleHeight);
  }

  /**
   * Initialize the game state
   */
  initialize(): void {
    this.isRunning = true;
    this.player.resetScore();
  }

  /**
   * Get current game state
   */
  getGameState(): GameStateProperties {
    return {
      player: this.player,
      ball: this.ball,
      paddle: this.paddle,
      isRunning: this.isRunning,
    };
  }

  /**
   * Update game state (typically called each frame)
   */
  update(): void {
    if (!this.isRunning) return;

    // Update ball position
    this.ball.update();
  }

  /**
   * Move paddle left
   */
  movePaddleLeft(distance: number): void {
    this.paddle.x -= distance;
  }

  /**
   * Move paddle right
   */
  movePaddleRight(distance: number): void {
    this.paddle.x += distance;
  }

  /**
   * Add score to player
   */
  addPlayerScore(points: number): void {
    this.player.addScore(points);
  }

  /**
   * Get player instance
   */
  getPlayer(): Player {
    return this.player;
  }

  /**
   * Get ball instance
   */
  getBall(): Ball {
    return this.ball;
  }

  /**
   * Get paddle instance
   */
  getPaddle(): Paddle {
    return this.paddle;
  }

  /**
   * Check if game is running
   */
  isGameRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Stop the game
   */
  stopGame(): void {
    this.isRunning = false;
  }

  /**
   * Reset the game
   */
  resetGame(): void {
    this.player.resetScore();
    this.isRunning = false;
  }
}

export default GameService;
