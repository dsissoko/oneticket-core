/**
 * MysteryShipSpawner — manages mystery ship spawning logic
 * Spawns ships at random intervals (10-20 seconds)
 * Assigns random point values on each spawn
 * 
 * Creates MysteryShipImpl instances (defined in Entity.ts)
 */

/**
 * MysteryShipSpawner — manages mystery ship spawning logic
 * Spawns ships at random intervals (10-20 seconds)
 * Assigns random point values on each spawn
 */
export class MysteryShipSpawner {
  private nextSpawnTime: number
  private spawnInterval: number
  private pointValues: number[] = [50, 100, 150, 300]
  private readonly SPAWN_INTERVAL_MIN = 10000 // 10 seconds
  private readonly SPAWN_INTERVAL_MAX = 20000 // 20 seconds
  private readonly SHIP_SPEED = 100 // pixels per millisecond

  constructor(initialTime: number) {
    // Schedule first spawn
    this.spawnInterval = this.randomInterval()
    this.nextSpawnTime = initialTime + this.spawnInterval
  }

  /**
   * Generate random spawn interval between min and max
   */
  private randomInterval(): number {
    return (
      Math.random() * (this.SPAWN_INTERVAL_MAX - this.SPAWN_INTERVAL_MIN) +
      this.SPAWN_INTERVAL_MIN
    )
  }

  /**
   * Get random point value from pool
   */
  private randomPointValue(): number {
    return this.pointValues[Math.floor(Math.random() * this.pointValues.length)]
  }

  /**
   * Calculate next spawn time after a spawn event
   */
  scheduleNextSpawn(currentTime: number): number {
    this.spawnInterval = this.randomInterval()
    this.nextSpawnTime = currentTime + this.spawnInterval
    return this.nextSpawnTime
  }

  /**
   * Check if it's time to spawn
   */
  isSpawnTime(currentTime: number): boolean {
    return currentTime >= this.nextSpawnTime
  }

  /**
   * Get next spawn time (for testing/debugging)
   */
  getNextSpawnTime(): number {
    return this.nextSpawnTime
  }

  /**
   * Create a new mystery ship with random parameters
   * Note: The actual MysteryShipImpl class is in Entity.ts
   * Call this after checking isSpawnTime()
   */
  createShip(currentTime: number, canvasWidth: number): {
    x: number
    y: number
    vx: number
    pointValue: number
  } {
    // Randomly choose direction: -1 for left-to-right, 1 for right-to-left
    const direction = Math.random() < 0.5 ? 1 : -1
    
    // Calculate starting position
    const startX = direction < 0 ? canvasWidth : -40
    const pointValue = this.randomPointValue()

    console.log(
      `Mystery ship spawned at ${currentTime.toFixed(0)}ms with ${pointValue} pts (direction: ${direction > 0 ? 'right' : 'left'})`
    )

    return {
      x: startX,
      y: 20, // y position at top of screen
      vx: direction * this.SHIP_SPEED,
      pointValue
    }
  }
}
