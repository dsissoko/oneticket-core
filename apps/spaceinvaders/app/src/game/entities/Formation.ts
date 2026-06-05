/**
 * Formation class — manages the 11×5 grid of enemies with movement, edge detection, and speed scaling
 */

import { Enemy, type EnemyType } from './Enemy'
import { GRID_LAYOUT, ENEMY_SPACING, calculateFormationSpeed, ENEMY_TYPES } from '../config/EnemyConfig'

export class Formation {
  x: number
  y: number
  directionX: -1 | 1 = 1
  speed: number = 100
  enemies: Enemy[] = []
  spawnTime: number = 0
  canvasWidth: number
  canvasHeight: number
  private lastUpdateTime: number = 0
  private gridX: number[] = []
  private gridY: number[] = []

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    
    // Initialize at top-center
    this.x = canvasWidth / 2 - (11 * ENEMY_SPACING.x) / 2
    this.y = 50
    this.spawnTime = Date.now()
  }

  /**
   * Initialize the formation with 55 enemies in 11×5 grid
   */
  initialize(waveNumber: number): void {
    this.enemies = []
    this.gridX = []
    this.gridY = []

    // Create 55 enemies in 11×5 grid layout
    for (let i = 0; i < GRID_LAYOUT.length; i++) {
      const type = GRID_LAYOUT[i]
      const col = i % 11
      const row = Math.floor(i / 11)

      const gridX = col * ENEMY_SPACING.x
      const gridY = row * ENEMY_SPACING.y

      this.gridX.push(gridX)
      this.gridY.push(gridY)

      const enemy = new Enemy(this.x + gridX, this.y + gridY, type)
      this.enemies.push(enemy)
    }

    // Calculate initial speed
    this.speed = calculateFormationSpeed(waveNumber, 55)
    this.directionX = 1
    this.lastUpdateTime = 0

    console.log(`Wave ${waveNumber}: 55 enemies spawned`)
  }

  /**
   * Update formation position each frame
   */
  update(deltaTime: number, waveNumber: number): void {
    const aliveCount = this.getAliveEnemies().length

    // Recalculate speed based on current wave and alive enemy count
    this.speed = calculateFormationSpeed(waveNumber, aliveCount)
    console.log(
      `Formation speed: ${this.speed.toFixed(0)} px/sec (${aliveCount}/55 alive)`
    )

    // Move formation laterally
    const movement = this.speed * this.directionX * (deltaTime / 1000)
    this.x += movement

    // Get formation width (11 enemies × spacing)
    const formationWidth = 11 * ENEMY_SPACING.x

    // Check left edge
    if (this.x < 0) {
      this.x = 0
      this.drop()
      this.directionX = 1
      console.log('Formation bounced at left edge, direction = right')
    }

    // Check right edge
    if (this.x + formationWidth > this.canvasWidth) {
      this.x = this.canvasWidth - formationWidth
      this.drop()
      this.directionX = -1
      console.log('Formation bounced at right edge, direction = left')
    }

    // Update each enemy position
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].x = this.x + this.gridX[i]
      this.enemies[i].y = this.y + this.gridY[i]
    }

    this.lastUpdateTime = deltaTime
  }

  /**
   * Drop the formation down by one enemy height
   */
  drop(): void {
    this.y += ENEMY_SPACING.y
  }

  /**
   * Get all alive enemies
   */
  getAliveEnemies(): Enemy[] {
    return this.enemies.filter((enemy) => enemy.alive)
  }

  /**
   * Count alive enemies
   */
  countAliveEnemies(): number {
    return this.getAliveEnemies().length
  }

  /**
   * Check if formation has reached the bottom of the screen
   */
  hasReachedBottom(): boolean {
    const formationHeight = 5 * ENEMY_SPACING.y
    return this.y + formationHeight >= this.canvasHeight
  }

  /**
   * Get the bounding box of the formation
   */
  getBoundingBox(): { x: number; y: number; width: number; height: number } {
    const width = 11 * ENEMY_SPACING.x
    const height = 5 * ENEMY_SPACING.y
    return { x: this.x, y: this.y, width, height }
  }

  /**
   * Reset formation for next wave
   */
  resetForWave(waveNumber: number): void {
    this.x = this.canvasWidth / 2 - (11 * ENEMY_SPACING.x) / 2
    this.y = 50
    this.directionX = 1
    this.spawnTime = Date.now()
    this.initialize(waveNumber)
  }

  /**
   * Render all alive enemies (called by RenderingSystem)
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const enemy of this.enemies) {
      if (enemy.alive) {
        const config = ENEMY_TYPES[enemy.type]
        config.sprite(ctx, enemy.x, enemy.y)
      }
    }
  }
}
