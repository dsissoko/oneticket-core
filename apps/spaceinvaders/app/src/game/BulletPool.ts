/**
 * BulletPool class — manages a reusable pool of enemy bullets
 * Pre-allocates bullets to minimize garbage collection
 */

import { EnemyBullet } from './entities/EnemyBullet'

export class BulletPool {
  private bullets: EnemyBullet[] = []
  private maxBullets: number
  private bulletSpeed: number
  activeCount: number = 0

  constructor(maxBullets: number = 3, bulletSpeed: number = 150) {
    this.maxBullets = maxBullets
    this.bulletSpeed = bulletSpeed

    // Pre-allocate all bullets
    for (let i = 0; i < maxBullets; i++) {
      this.bullets.push(new EnemyBullet(0, 0, bulletSpeed))
    }

    console.log(`BulletPool initialized with ${maxBullets} bullets at ${bulletSpeed} px/s`)
  }

  /**
   * Fire a bullet from enemy position
   * Returns the bullet if available, null if pool is full
   */
  fire(x: number, y: number): EnemyBullet | null {
    if (this.activeCount < this.maxBullets) {
      // Find an inactive bullet and reuse it
      const bullet = this.bullets.find((b) => !b.active)
      if (bullet) {
        // Center bullet on enemy x position
        bullet.reset(x - bullet.width / 2, y)
        this.activeCount++
        console.log(
          `Bullet fired at (${x}, ${y}), pool: ${this.activeCount}/${this.maxBullets} active`
        )
        return bullet
      }
    } else {
      // Pool is full, deactivate oldest (FIFO) and reuse
      const oldestInactive = this.bullets.find((b) => b.active === false)
      if (oldestInactive) {
        oldestInactive.reset(x - oldestInactive.width / 2, y)
        console.log(
          `Bullet pool full, reusing oldest. Pool: ${this.activeCount}/${this.maxBullets} active`
        )
        return oldestInactive
      }

      // Fallback: just reuse the first bullet
      const bullet = this.bullets[0]
      bullet.reset(x - bullet.width / 2, y)
      return bullet
    }

    return null
  }

  /**
   * Return bullet to pool (deactivate)
   */
  returnToPool(bullet: EnemyBullet): void {
    if (bullet.active) {
      bullet.deactivate()
      this.activeCount = Math.max(0, this.activeCount - 1)
      console.log(`Bullet returned to pool, active: ${this.activeCount}/${this.maxBullets}`)
    }
  }

  /**
   * Update all active bullets and remove those out of bounds
   */
  update(deltaTime: number, canvasHeight: number): void {
    for (const bullet of this.bullets) {
      if (bullet.active) {
        bullet.update(deltaTime)

        // Check if bullet exited bottom of screen
        if (bullet.isOutOfBounds(canvasHeight)) {
          this.returnToPool(bullet)
        }
      }
    }
  }

  /**
   * Get all active bullets for rendering and collision detection
   */
  getActiveBullets(): EnemyBullet[] {
    return this.bullets.filter((b) => b.active)
  }

  /**
   * Get current active count
   */
  getActiveCount(): number {
    return this.activeCount
  }

  /**
   * Reset pool for new wave
   */
  reset(): void {
    for (const bullet of this.bullets) {
      bullet.deactivate()
    }
    this.activeCount = 0
    console.log('BulletPool reset for new wave')
  }
}
