/**
 * CollisionManager — orchestrates collision detection between all entity pairs
 * Returns an array of CollisionEvent objects for the physics system to process
 */

import type {
  Formation,
  Player,
  PlayerBullet,
  EnemyBullet,
  Shield,
  MysteryShip,
  BoundingBox,
  CollisionEvent,
  CollisionResponse,
  Enemy
} from '../types'
import { AABBDetector } from './AABBDetector'

export class CollisionManager {
  private eventId: number = 0

  /**
   * Check all collision pairs and return collision events
   * Executed once per frame after entity updates
   */
  checkAllCollisions(
    formation: Formation | null,
    player: Player | null,
    playerBullets: PlayerBullet[],
    enemyBullets: EnemyBullet[],
    shields: Shield[],
    mysteryShip: MysteryShip | null
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []

    if (!player) return events

    // 1. Player bullets vs Enemies
    if (formation) {
      const bulletEnemyEvents = this.checkPlayerBulletEnemyCollisions(
        playerBullets,
        formation
      )
      events.push(...bulletEnemyEvents)
    }

    // 2. Player bullets vs Mystery Ship
    if (mysteryShip && mysteryShip.active) {
      const bulletMysteryEvents = this.checkPlayerBulletMysteryShipCollisions(
        playerBullets,
        mysteryShip
      )
      events.push(...bulletMysteryEvents)
    }

    // 3. Player bullets vs Shields
    const bulletShieldEvents = this.checkPlayerBulletShieldCollisions(
      playerBullets,
      shields
    )
    events.push(...bulletShieldEvents)

    // 4. Enemy bullets vs Player
    const enemyBulletPlayerEvents = this.checkEnemyBulletPlayerCollisions(
      enemyBullets,
      player
    )
    events.push(...enemyBulletPlayerEvents)

    // 5. Enemy bullets vs Shields
    const enemyBulletShieldEvents = this.checkEnemyBulletShieldCollisions(
      enemyBullets,
      shields
    )
    events.push(...enemyBulletShieldEvents)

    // 6. Formation vs Shields
    if (formation) {
      const formationShieldEvents = this.checkFormationShieldCollisions(
        formation,
        shields
      )
      events.push(...formationShieldEvents)
    }

    // 7. Formation vs Player
    if (formation) {
      const formationPlayerEvents = this.checkFormationPlayerCollisions(
        formation,
        player
      )
      events.push(...formationPlayerEvents)
    }

    return events
  }

  /**
   * Check player bullets against all alive enemies in formation
   */
  private checkPlayerBulletEnemyCollisions(
    playerBullets: PlayerBullet[],
    formation: Formation
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []
    const aliveEnemies = formation.getAliveEnemies()

    for (const bullet of playerBullets) {
      if (!bullet) continue

      for (const enemy of aliveEnemies) {
        const enemyBox: BoundingBox = {
          x: enemy.x,
          y: enemy.y,
          width: enemy.width,
          height: enemy.height
        }

        if (AABBDetector.checkCollision(bullet.getBoundingBox(), enemyBox)) {
          // Collision detected
          const points = enemy.points || 10
          const response: CollisionResponse = {
            pointsAwarded: points,
            entitiesToDestroy: [{ type: 'enemy', enemy }],
            playerDamage: false,
            playerInvincibility: false,
            gameOverTriggered: false
          }

          const event: CollisionEvent = {
            type: 'bullet-enemy',
            entities: [bullet, enemy],
            response
          }

          events.push(event)

          // Mark enemy as dead and bullet as inactive for response phase
          enemy.alive = false
          ;(bullet as any).active = false

          console.log(`Collision: bullet-enemy, enemy type=${enemy.type}, points=${points}`)
          break // Bullet only collides with one enemy per frame
        }
      }
    }

    return events
  }

  /**
   * Check player bullets against mystery ship
   */
  private checkPlayerBulletMysteryShipCollisions(
    playerBullets: PlayerBullet[],
    mysteryShip: MysteryShip
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []

    for (const bullet of playerBullets) {
      if (!bullet || !(mysteryShip as any).alive) continue

      if (
        AABBDetector.checkCollision(
          bullet.getBoundingBox(),
          mysteryShip as BoundingBox
        )
      ) {
        // Mystery ship bonus: fixed 100 points (can be extended with timing-based bonuses)
        const bonus = 100

        const response: CollisionResponse = {
          pointsAwarded: bonus,
          entitiesToDestroy: [{ type: 'mysteryShip', ship: mysteryShip }],
          playerDamage: false,
          playerInvincibility: false,
          gameOverTriggered: false
        }

        const event: CollisionEvent = {
          type: 'bullet-mystery',
          entities: [bullet, mysteryShip],
          response
        }

        events.push(event)

        ;(mysteryShip as any).alive = false
        ;(bullet as any).active = false

        console.log(`Collision: bullet-mystery, bonus=${bonus}`)
        break
      }
    }

    return events
  }

  /**
   * Check player bullets against shield segments
   */
  private checkPlayerBulletShieldCollisions(
    playerBullets: PlayerBullet[],
    shields: Shield[]
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []

    for (const bullet of playerBullets) {
      if (!bullet) continue

      for (let shieldIndex = 0; shieldIndex < shields.length; shieldIndex++) {
        const shield = shields[shieldIndex]

        // Check against all segments in this shield
        for (let gridY = 0; gridY < shield.segments.length; gridY++) {
          const row = shield.segments[gridY]
          for (let gridX = 0; gridX < row.length; gridX++) {
            const segment = row[gridX]

            if (!segment.alive) continue

            const segmentBox: BoundingBox = {
              x: segment.x,
              y: segment.y,
              width: segment.width,
              height: segment.height
            }

            if (
              AABBDetector.checkCollision(
                bullet.getBoundingBox(),
                segmentBox
              )
            ) {
              // Segment takes damage
              segment.takeDamage()

              // Award points only for destroying segment (hitCount becomes 3)
              const points = segment.hitCount >= 3 ? 5 : 0

              const response: CollisionResponse = {
                pointsAwarded: points,
                entitiesToDestroy: [],
                playerDamage: false,
                playerInvincibility: false,
                gameOverTriggered: false,
                shieldDamageData: {
                  shieldIndex,
                  segmentGridX: gridX,
                  segmentGridY: gridY
                }
              }

              const event: CollisionEvent = {
                type: 'bullet-shield',
                entities: [bullet, segment],
                response
              }

              events.push(event)
              ;(bullet as any).active = false

              console.log(
                `Collision: bullet-shield, shield=${shieldIndex}, grid=(${gridX},${gridY}), points=${points}`
              )
              break
            }
          }

          // If bullet was deactivated, stop checking this shield
          if (!(bullet as any).active) break
        }
      }
    }

    return events
  }

  /**
   * Check enemy bullets against player (respects invincibility)
   */
  private checkEnemyBulletPlayerCollisions(
    enemyBullets: EnemyBullet[],
    player: Player
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []

    for (const bullet of enemyBullets) {
      if (!bullet) continue

      if (
        AABBDetector.checkCollision(
          bullet.getBoundingBox(),
          player as BoundingBox
        )
      ) {
        // Check if player is invincible
        const playerDamaged = !player.invincible

        const response: CollisionResponse = {
          pointsAwarded: 0,
          entitiesToDestroy: [{ type: 'bullet', bullet }],
          playerDamage: playerDamaged,
          playerInvincibility: playerDamaged, // Set invincibility if damage taken
          gameOverTriggered: false // Will be set by PhysicsSystem if lives reach 0
        }

        const event: CollisionEvent = {
          type: 'enemy-bullet-player',
          entities: [bullet, player],
          response
        }

        events.push(event)
        ;(bullet as any).active = false

        console.log(`Collision: enemy-bullet-player, damage=${playerDamaged}`)
      }
    }

    return events
  }

  /**
   * Check enemy bullets against shield segments
   */
  private checkEnemyBulletShieldCollisions(
    enemyBullets: EnemyBullet[],
    shields: Shield[]
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []

    for (const bullet of enemyBullets) {
      if (!bullet) continue

      for (let shieldIndex = 0; shieldIndex < shields.length; shieldIndex++) {
        const shield = shields[shieldIndex]

        for (let gridY = 0; gridY < shield.segments.length; gridY++) {
          const row = shield.segments[gridY]
          for (let gridX = 0; gridX < row.length; gridX++) {
            const segment = row[gridX]

            if (!segment.alive) continue

            const segmentBox: BoundingBox = {
              x: segment.x,
              y: segment.y,
              width: segment.width,
              height: segment.height
            }

            if (
              AABBDetector.checkCollision(
                bullet.getBoundingBox(),
                segmentBox
              )
            ) {
              // Segment takes damage (no points awarded)
              segment.takeDamage()

              const response: CollisionResponse = {
                pointsAwarded: 0,
                entitiesToDestroy: [{ type: 'bullet', bullet }],
                playerDamage: false,
                playerInvincibility: false,
                gameOverTriggered: false,
                shieldDamageData: {
                  shieldIndex,
                  segmentGridX: gridX,
                  segmentGridY: gridY
                }
              }

              const event: CollisionEvent = {
                type: 'bullet-shield',
                entities: [bullet, segment],
                response
              }

              events.push(event)
              ;(bullet as any).active = false

              console.log(
                `Collision: enemy-bullet-shield, shield=${shieldIndex}, grid=(${gridX},${gridY})`
              )
              break
            }
          }

          if (!(bullet as any).active) break
        }
      }
    }

    return events
  }

  /**
   * Check formation bounding box against shields
   * Destroys all segments of affected shields
   */
  private checkFormationShieldCollisions(
    formation: Formation,
    shields: Shield[]
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []
    const formationBox = formation.getBoundingBox()

    for (let shieldIndex = 0; shieldIndex < shields.length; shieldIndex++) {
      const shield = shields[shieldIndex]
      const shieldBox = shield.getBoundingBox()

      if (AABBDetector.checkCollision(formationBox as BoundingBox, shieldBox)) {
        // Destroy all segments
        for (let gridY = 0; gridY < shield.segments.length; gridY++) {
          for (let gridX = 0; gridX < shield.segments[gridY].length; gridX++) {
            shield.segments[gridY][gridX].alive = false
          }
        }

        const response: CollisionResponse = {
          pointsAwarded: 0,
          entitiesToDestroy: [],
          playerDamage: false,
          playerInvincibility: false,
          gameOverTriggered: false
        }

        const event: CollisionEvent = {
          type: 'formation-shield',
          entities: [formation, shield],
          response
        }

        events.push(event)

        console.log(`Collision: formation-shield, shield=${shieldIndex}`)
      }
    }

    return events
  }

  /**
   * Check formation bottom edge against player top edge
   * Triggers immediate game over
   */
  private checkFormationPlayerCollisions(
    formation: Formation,
    player: Player
  ): CollisionEvent[] {
    const events: CollisionEvent[] = []

    // Check if formation bottom has reached player top
    const formationBox = formation.getBoundingBox()
    const formationBottom = formationBox.y + formationBox.height

    if (formationBottom >= player.y) {
      const response: CollisionResponse = {
        pointsAwarded: 0,
        entitiesToDestroy: [],
        playerDamage: false,
        playerInvincibility: false,
        gameOverTriggered: true
      }

      const event: CollisionEvent = {
        type: 'formation-player',
        entities: [formation, player],
        response
      }

      events.push(event)

      console.log('Collision: formation-player → GameOver')
    }

    return events
  }
}
