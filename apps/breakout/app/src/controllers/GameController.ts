/**
 * GameController
 * Final orchestration layer that integrates GameService and PhysicsEngine
 * Depends on tasks D (GameService) and E (PhysicsEngine) being completed
 * Coordinates the main game loop and state management
 */

import GameService, { GameStateProperties } from '../services/GameService';
import { PhysicsEngine } from '../services/PhysicsEngine';
import { Ball } from '../models/Ball';
import { Paddle } from '../models/Paddle';
import { Player } from '../models/Player';

export interface GameControllerConfig {
  width: number;
  height: number;
  fps: number;
}

export class GameController {
  private gameService: GameService;
  private physicsEngine: PhysicsEngine;
  private config: GameControllerConfig;
  private gameLoopId: number | null = null;
  private lastFrameTime: number = 0;
  private isInitialized: boolean = false;

  constructor(
    gameService: GameService,
    physicsEngine: PhysicsEngine,
    config: GameControllerConfig
  ) {
    this.gameService = gameService;
    this.physicsEngine = physicsEngine;
    this.config = config;
  }

  /**
   * Initialize the game controller and all dependencies
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.gameService.initialize();
    this.physicsEngine.initialize(
      this.config.width,
      this.config.height
    );
    this.isInitialized = true;
    this.lastFrameTime = Date.now();
  }

  /**
   * Start the main game loop
   */
  startGameLoop(): void {
    if (this.gameLoopId !== null) return;

    const frameInterval = 1000 / this.config.fps;

    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastFrameTime;

      if (deltaTime >= frameInterval) {
        this.update(deltaTime);
        this.lastFrameTime = currentTime;
      }

      this.gameLoopId = requestAnimationFrame(gameLoop);
    };

    this.gameLoopId = requestAnimationFrame(gameLoop);
  }

  /**
   * Stop the main game loop
   */
  stopGameLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * Update game state (called each frame)
   * Orchestrates GameService and PhysicsEngine updates
   */
  private update(deltaTime: number): void {
    if (!this.gameService.isGameRunning()) {
      this.stopGameLoop();
      return;
    }

    // Update game service state
    this.gameService.update();

    // Get current game state
    const gameState = this.gameService.getGameState();

    // Apply physics simulation
    this.physicsEngine.update(
      gameState.ball,
      gameState.paddle,
      deltaTime
    );

    // Handle collisions through physics engine
    this.handleCollisions(gameState);
  }

  /**
   * Handle all collision detection and response
   */
  private handleCollisions(gameState: GameStateProperties): void {
    const ball = gameState.ball;
    const paddle = gameState.paddle;

    // Check ball-paddle collision
    if (this.physicsEngine.checkPaddleCollision(ball, paddle)) {
      this.physicsEngine.resolvePaddleCollision(ball, paddle);
    }

    // Check ball-wall collisions
    if (this.physicsEngine.checkWallCollision(ball)) {
      this.physicsEngine.resolveWallCollision(
        ball,
        this.config.width,
        this.config.height
      );
    }

    // Check if ball is out of bounds (game over)
    if (ball.position.y > this.config.height) {
      this.gameService.stopGame();
    }
  }

  /**
   * Handle paddle movement input (left)
   */
  movePaddleLeft(distance: number): void {
    this.gameService.movePaddleLeft(distance);
  }

  /**
   * Handle paddle movement input (right)
   */
  movePaddleRight(distance: number): void {
    this.gameService.movePaddleRight(distance);
  }

  /**
   * Add score when player hits blocks
   */
  addPlayerScore(points: number): void {
    this.gameService.addPlayerScore(points);
  }

  /**
   * Get current game state
   */
  getGameState(): GameStateProperties {
    return this.gameService.getGameState();
  }

  /**
   * Get current player
   */
  getPlayer(): Player {
    return this.gameService.getPlayer();
  }

  /**
   * Get current ball
   */
  getBall(): Ball {
    return this.gameService.getBall();
  }

  /**
   * Get current paddle
   */
  getPaddle(): Paddle {
    return this.gameService.getPaddle();
  }

  /**
   * Check if game is running
   */
  isGameRunning(): boolean {
    return this.gameService.isGameRunning();
  }

  /**
   * Reset the game
   */
  resetGame(): void {
    this.stopGameLoop();
    this.gameService.resetGame();
    this.physicsEngine.reset();
    this.isInitialized = false;
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    this.stopGameLoop();
  }

  /**
   * Resume the game
   */
  resumeGame(): void {
    if (this.gameService.isGameRunning()) {
      this.lastFrameTime = Date.now();
      this.startGameLoop();
    }
  }
}

export default GameController;
