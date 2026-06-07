/**
 * RenderingSystem — handles all canvas rendering
 */

import type { Formation, Player, Bullet, Shield, MysteryShip } from './types'

export class RenderingSystem {
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement

  get canvasWidth(): number { return this.canvas.width }
  get canvasHeight(): number { return this.canvas.height }

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context from canvas')
    this.ctx = ctx
    this.canvas = canvas
  }

  setCanvasSize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
  }

  clear(): void {
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  drawFormation(formation: Formation | null): void {
    if (!formation) return
    formation.render(this.ctx)
  }

  drawPlayer(player: Player | null): void {
    if (!player) return
    let opacity = 1.0
    if (player.invincible && player.invincibilityTimer > 0) {
      const cycleProgress = (player.invincibilityTimer % 200) / 200
      opacity = cycleProgress < 0.5 ? 0.5 : 1.0
    }
    this.ctx.globalAlpha = opacity
    this.ctx.fillStyle = '#00FF00'
    this.ctx.beginPath()
    this.ctx.moveTo(player.x + player.width / 2, player.y)
    this.ctx.lineTo(player.x, player.y + player.height)
    this.ctx.lineTo(player.x + player.width, player.y + player.height)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.globalAlpha = 1.0
  }

  drawBullets(bullets: Bullet[]): void {
    this.ctx.fillStyle = '#FFFFFF'
    bullets.forEach((bullet) => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
    })
  }

  drawShields(shields: Shield[]): void {
    shields.forEach((shield) => {
      this.ctx.fillStyle = '#00FF00'
      shield.segments.forEach((row) => {
        row.forEach((segment) => {
          if (segment.alive) {
            this.ctx.fillRect(segment.x, segment.y, segment.width, segment.height)
          }
        })
      })
    })
  }

  drawMysteryShip(ship: MysteryShip | null): void {
    if (!ship || !ship.active) return
    this.ctx.fillStyle = '#FF00FF'
    this.ctx.fillRect(ship.x, ship.y, ship.width, ship.height)
  }

  drawHUD(score: number, lives: number, waveNumber: number): void {
    this.ctx.fillStyle = '#00FF00'
    this.ctx.font = `bold ${Math.max(12, this.canvasWidth / 50)}px monospace`
    this.ctx.textAlign = 'left'
    this.ctx.fillText(`Score: ${score}`, 10, 25)
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`Lives: ${lives}`, this.canvasWidth / 2, 25)
    this.ctx.textAlign = 'right'
    this.ctx.fillText(`Wave: ${waveNumber}`, this.canvasWidth - 10, 25)
    this.ctx.textAlign = 'left'
  }

  drawStartScreen(): void {
    const cx = this.canvasWidth / 2
    const cy = this.canvasHeight / 2
    const titleSize = Math.max(24, this.canvasWidth / 15)
    const subSize = Math.max(14, this.canvasWidth / 40)

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

    // Title
    this.ctx.fillStyle = '#00FF00'
    this.ctx.font = `bold ${titleSize}px monospace`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('SPACE INVADERS', cx, cy - titleSize * 2)

    // Subtitle
    this.ctx.fillStyle = '#00CC00'
    this.ctx.font = `${subSize}px monospace`
    this.ctx.fillText('Protect Earth from the Invaders', cx, cy - titleSize)

    // Start button
    const btnW = Math.max(160, this.canvasWidth / 5)
    const btnH = Math.max(40, this.canvasHeight / 12)
    const btnX = cx - btnW / 2
    const btnY = cy - btnH / 2
    this.ctx.fillStyle = '#00AA00'
    this.ctx.fillRect(btnX, btnY, btnW, btnH)
    this.ctx.fillStyle = '#000000'
    this.ctx.font = `bold ${subSize}px monospace`
    this.ctx.fillText('START GAME', cx, cy)

    // Controls
    this.ctx.fillStyle = '#00CC00'
    this.ctx.font = `${subSize * 0.85}px monospace`
    this.ctx.fillText('Arrow Keys to Move  •  Spacebar to Fire', cx, cy + btnH * 1.5)
    this.ctx.fillText('On mobile: swipe bottom to move  •  tap top to fire', cx, cy + btnH * 2.5)

    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'
  }

  drawGameOver(score: number, lives: number, waveNumber: number): void {
    const cx = this.canvasWidth / 2
    const cy = this.canvasHeight / 2
    const titleSize = Math.max(24, this.canvasWidth / 12)
    const subSize = Math.max(14, this.canvasWidth / 40)

    this.drawHUD(score, lives, waveNumber)

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    this.ctx.fillStyle = '#FF0000'
    this.ctx.font = `bold ${titleSize}px monospace`
    this.ctx.fillText('GAME OVER', cx, cy - titleSize * 1.5)

    this.ctx.fillStyle = '#FF4444'
    this.ctx.font = `${subSize}px monospace`
    this.ctx.fillText(`Wave Reached: ${waveNumber}`, cx, cy - subSize)
    this.ctx.fillText(`Final Score: ${score}`, cx, cy + subSize)

    // Restart button
    const btnW = Math.max(140, this.canvasWidth / 5)
    const btnH = Math.max(36, this.canvasHeight / 14)
    const btnX = cx - btnW / 2
    const btnY = cy + titleSize
    this.ctx.fillStyle = '#AA0000'
    this.ctx.fillRect(btnX, btnY, btnW, btnH)
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.font = `bold ${subSize}px monospace`
    this.ctx.fillText('RESTART', cx, btnY + btnH / 2)

    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'
  }

  drawVictory(score: number, waveNumber: number, countdown: number): void {
    const cx = this.canvasWidth / 2
    const cy = this.canvasHeight / 2
    const titleSize = Math.max(24, this.canvasWidth / 12)
    const subSize = Math.max(14, this.canvasWidth / 40)
    const countdownSeconds = Math.max(0, Math.ceil(countdown / 1000))

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    this.ctx.fillStyle = '#00FF00'
    this.ctx.font = `bold ${titleSize}px monospace`
    this.ctx.fillText('VICTORY!', cx, cy - titleSize * 2)

    this.ctx.fillStyle = '#00CC00'
    this.ctx.font = `${subSize}px monospace`
    this.ctx.fillText(`Wave ${waveNumber} Complete`, cx, cy - titleSize)
    this.ctx.fillText(`Score: ${score}`, cx, cy)
    this.ctx.fillText(`Wave ${waveNumber + 1} starts in ${countdownSeconds}s`, cx, cy + titleSize)

    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'
  }

  /**
   * Returns true if the click/tap hit the Start button area
   */
  isStartButtonHit(x: number, y: number): boolean {
    const cx = this.canvasWidth / 2
    const cy = this.canvasHeight / 2
    const btnW = Math.max(160, this.canvasWidth / 5)
    const btnH = Math.max(40, this.canvasHeight / 12)
    return x >= cx - btnW / 2 && x <= cx + btnW / 2 && y >= cy - btnH / 2 && y <= cy + btnH / 2
  }

  /**
   * Returns true if the click/tap hit the Restart button area
   */
  isRestartButtonHit(x: number, y: number): boolean {
    const cx = this.canvasWidth / 2
    const cy = this.canvasHeight / 2
    const titleSize = Math.max(24, this.canvasWidth / 12)
    const btnW = Math.max(140, this.canvasWidth / 5)
    const btnH = Math.max(36, this.canvasHeight / 14)
    const btnY = cy + titleSize
    return x >= cx - btnW / 2 && x <= cx + btnW / 2 && y >= btnY && y <= btnY + btnH
  }
}
