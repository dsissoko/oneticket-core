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
   * Draw enemy formation and all alive enemies
   */
  drawFormation(formation: Formation | null): void {
    if (!formation) return

    // Render all alive enemies using their sprites
    formation.render(this.ctx)

    // Optional: Draw debug overlay (formation bounds)
    if (import.meta.env.DEV) {
      const bounds = formation.getBoundingBox()
      this.ctx.strokeStyle = '#00FF00'
      this.ctx.lineWidth = 1
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)

      // Draw direction arrow
      const centerX = bounds.x + bounds.width / 2
      const centerY = bounds.y - 10
      const arrowSize = 10
      
      this.ctx.fillStyle = '#00FF00'
      this.ctx.beginPath()
      if (formation.directionX === 1) {
        // Right arrow
        this.ctx.moveTo(centerX - arrowSize, centerY - 5)
        this.ctx.lineTo(centerX + arrowSize, centerY)
        this.ctx.lineTo(centerX - arrowSize, centerY + 5)
      } else {
        // Left arrow
        this.ctx.moveTo(centerX + arrowSize, centerY - 5)
        this.ctx.lineTo(centerX - arrowSize, centerY)
        this.ctx.lineTo(centerX + arrowSize, centerY + 5)
      }
      this.ctx.closePath()
      this.ctx.fill()
    }
  }

  /**
   * Draw player ship with invincibility flash effect
   */
  drawPlayer(player: Player | null): void {
    if (!player) return

    // Calculate invincibility flash state
    let opacity = 1.0
    if (player.invincible && player.invincibilityTimer > 0) {
      // Flash at 5 Hz (200 ms cycle)
      const flashCycle = 200 // milliseconds
      const cycleProgress = (player.invincibilityTimer % flashCycle) / flashCycle
      // Alternate between 0.5 and 1.0 opacity every 100ms
      opacity = cycleProgress < 0.5 ? 0.5 : 1.0
    }

    // Set color based on invincibility state
    const baseColor = '#00FF00'
    this.ctx.globalAlpha = opacity
    this.ctx.fillStyle = baseColor

    // Draw simple triangle for player ship (pointing up)
    this.ctx.beginPath()
    this.ctx.moveTo(player.x + player.width / 2, player.y)
    this.ctx.lineTo(player.x, player.y + player.height)
    this.ctx.lineTo(player.x + player.width, player.y + player.height)
    this.ctx.closePath()
    this.ctx.fill()

    // Reset opacity
    this.ctx.globalAlpha = 1.0
  }

  /**
   * Draw player bullets as 4×12 white rectangles
   */
  drawBullets(bullets: Bullet[]): void {
    this.ctx.fillStyle = '#FFFFFF'
    bullets.forEach((bullet) => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
    })
  }



  /**
    * Draw shields
    */
  drawShields(shields: Shield[]): void {
    shields.forEach((shield) => {
      this.ctx.fillStyle = '#00FF00'

      // Handle 2D array of segments
      shield.segments.forEach((row) => {
        row.forEach((segment) => {
          if (segment.alive) {
            this.ctx.fillRect(segment.x, segment.y, segment.width, segment.height)
          }
        })
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
