/**
 * PhysicsSystem — main orchestrator for collision detection and response
 * Integrates CollisionManager and applies responses each frame
 */

import type {
  Formation,
  Player,
  PlayerBullet,
  EnemyBullet,
  Shield,
  MysteryShip,
  CollisionEvent,
  CollisionResponse
} from '../types'
import { CollisionManager } from './CollisionManager'

export interface PhysicsSystemCallbacks {
  onScoreChange?: (newScore: number) => void
  onLivesChange?: (newLives: number) => void
  onGameStateChange?: (newState: string) => void
}

export class PhysicsSystem {
  private collisionManager: CollisionManager
  private callbacks: PhysicsSystemCallbacks

  // Scoring table
  private readonly SCORING_TABLE = {
    enemySmall: 40, // Top 2 rows
    enemyMedium: 20, // Rows 2-3
    enemyLarge: 10, // Bottom row
    shieldSegment: 5, // Per segment destroyed
    mysteryShip: 100 // Fixed bonus (can vary by timing)
  }

  constructor(callbacks: PhysicsSystemCallbacks = {}) {
    this.collisionManager = new CollisionManager()
    this.callbacks = callbacks
  }

  /**
   * Main update method called each frame
   * Runs collision detection and applies responses
   */
  update(
    formation: Formation | null,
    player: Player | null,
    playerBullets: PlayerBullet[],
    enemyBullets: EnemyBullet[],
    shields: Shield[],
    mysteryShip: MysteryShip | null,
    gameState: { score: number; lives: number }
  ): {
    score: number
    lives: number
    gameOverTriggered: boolean
    collisionEvents: CollisionEvent[]
  } {
    // Detect all collisions
    const collisionEvents = this.collisionManager.checkAllCollisions(
      formation,
      player,
      playerBullets,
      enemyBullets,
      shields,
      mysteryShip
    )

    // Apply responses
    let score = gameState.score
    let lives = gameState.lives
    let gameOverTriggered = false

    for (const event of collisionEvents) {
      const response = event.response

      // Award points
      if (response.pointsAwarded > 0) {
        score += response.pointsAwarded
      }

      // Apply player damage
      if (response.playerDamage && player) {
        lives -= 1
        player.takeDamage()
      }

      // Check game over
      if (response.gameOverTriggered) {
        gameOverTriggered = true
      }

      // Check if lives are 0
      if (lives <= 0) {
        gameOverTriggered = true
        lives = 0
      }
    }

    // Broadcast state changes to React
    if (score !== gameState.score && this.callbacks.onScoreChange) {
      this.callbacks.onScoreChange(score)
    }

    if (lives !== gameState.lives && this.callbacks.onLivesChange) {
      this.callbacks.onLivesChange(lives)
    }

    if (gameOverTriggered && this.callbacks.onGameStateChange) {
      this.callbacks.onGameStateChange('GameOver')
    }

    // Return updated state
    return {
      score,
      lives,
      gameOverTriggered,
      collisionEvents
    }
  }

  /**
   * Calculate score for a collision event (used separately if needed)
   */
  calculateScore(event: CollisionEvent): number {
    return event.response.pointsAwarded
  }

  /**
   * Get the collision manager (for testing or advanced access)
   */
  getCollisionManager(): CollisionManager {
    return this.collisionManager
  }

  /**
   * Get scoring table
   */
  getScoringTable() {
    return { ...this.SCORING_TABLE }
  }
}
