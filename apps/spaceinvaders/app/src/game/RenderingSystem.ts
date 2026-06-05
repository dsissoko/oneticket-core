/**
 * RenderingSystem — handles all canvas rendering
 */

import type { Formation, Player, Bullet, Shield, MysteryShip } from './types'

export class RenderingSystem {
  private ctx: CanvasRenderingContext2D
  private canvasWidth: number
  private canvasHeight: number

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas')
    }
    this.ctx = ctx
    this.canvasWidth = canvas.width
    this.canvasHeight = canvas.height
  }

  /**
   * Clear the canvas with black background
   */
  clear(): void {
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  /**
   * Draw enemy formation (stub for now)
   */
  drawFormation(formation: Formation | null): void {
    if (!formation) return

    this.ctx.fillStyle = '#00FF00'
    this.ctx.font = '12px monospace'

    // Draw stub text showing formation position
    this.ctx.fillText(`Formation: (${formation.x.toFixed(0)}, ${formation.y.toFixed(0)})`, 10, 30)

    // Draw bounding box around formation
    const formationBounds = {
      minX: formation.x,
      maxX: formation.x + 50, // stub dimensions
      minY: formation.y,
      maxY: formation.y + 50
    }

    this.ctx.strokeStyle = '#00FF00'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(
      formationBounds.minX,
      formationBounds.minY,
      formationBounds.maxX - formationBounds.minX,
      formationBounds.maxY - formationBounds.minY
    )
  }

  /**
   * Draw player ship
   */
  drawPlayer(player: Player | null): void {
    if (!player) return

    this.ctx.fillStyle = player.invincible ? '#FFFF00' : '#00FF00'

    // Draw simple triangle for player ship
    this.ctx.beginPath()
    this.ctx.moveTo(player.x + player.width / 2, player.y)
    this.ctx.lineTo(player.x, player.y + player.height)
    this.ctx.lineTo(player.x + player.width, player.y + player.height)
    this.ctx.closePath()
    this.ctx.fill()

    // Draw invincibility indicator if active
    if (player.invincible) {
      this.ctx.strokeStyle = '#FFFF00'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10)
    }
  }

  /**
   * Draw all bullets on screen
   */
  drawBullets(bullets: Bullet[]): void {
    bullets.forEach((bullet) => {
      this.ctx.fillStyle = bullet.type === 'player' ? '#00FF00' : '#FF0000'
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
    })
  }

  /**
   * Draw shields
   */
  drawShields(shields: Shield[]): void {
    shields.forEach((shield) => {
      this.ctx.fillStyle = '#00FF00'

      shield.segments.forEach((segment) => {
        if (segment.alive) {
          this.ctx.fillRect(segment.x, segment.y, segment.width, segment.height)
        }
      })
    })
  }

  /**
   * Draw mystery ship
   */
  drawMysteryShip(ship: MysteryShip | null): void {
    if (!ship || !ship.active) return

    this.ctx.fillStyle = '#FF00FF'
    this.ctx.fillRect(ship.x, ship.y, ship.width, ship.height)
  }

  /**
   * Draw HUD text overlay
   */
  drawHUD(score: number, lives: number, waveNumber: number): void {
    this.ctx.fillStyle = '#00FF00'
    this.ctx.font = 'bold 16px monospace'
    this.ctx.textAlign = 'left'

    // Score (top-left)
    this.ctx.fillText(`Score: ${score}`, 10, 25)

    // Lives (top-center)
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`Lives: ${lives}`, this.canvasWidth / 2, 25)

    // Wave (top-right)
    this.ctx.textAlign = 'right'
    this.ctx.fillText(`Wave: ${waveNumber}`, this.canvasWidth - 10, 25)

    // Reset text alignment
    this.ctx.textAlign = 'left'
  }

  /**
   * Draw game state message (e.g., "Victory", "Game Over")
   */
  drawMessage(message: string, color: string = '#FFFFFF'): void {
    this.ctx.fillStyle = color
    this.ctx.font = 'bold 48px monospace'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    // Draw semi-transparent background
    const textMetrics = this.ctx.measureText(message)
    const boxWidth = textMetrics.width + 40
    const boxHeight = 60
    const boxX = this.canvasWidth / 2 - boxWidth / 2
    const boxY = this.canvasHeight / 2 - boxHeight / 2

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

    // Draw text
    this.ctx.fillStyle = color
    this.ctx.fillText(message, this.canvasWidth / 2, this.canvasHeight / 2)

    // Reset text alignment
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'
  }
}
