/**
 * EnemyConfig — configuration for enemy types and grid layout
 */

import type { EnemyType } from '../entities/Enemy'

export interface EnemyTypeConfig {
  width: number
  height: number
  points: number
  sprite: (ctx: CanvasRenderingContext2D, x: number, y: number) => void
}

/**
 * Draw a small enemy sprite
 */
function drawSmallEnemy(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Small enemy: 24×24 gray/blue rectangle with pattern
  ctx.fillStyle = '#00CCFF'
  ctx.fillRect(x, y, 24, 24)
  
  // Add pattern details
  ctx.fillStyle = '#0099CC'
  ctx.fillRect(x + 2, y + 2, 6, 6)
  ctx.fillRect(x + 10, y + 2, 6, 6)
  ctx.fillRect(x + 18, y + 2, 4, 6)
  ctx.fillRect(x + 4, y + 12, 4, 4)
  ctx.fillRect(x + 12, y + 12, 4, 4)
  ctx.fillRect(x + 8, y + 18, 8, 4)
}

/**
 * Draw a medium enemy sprite
 */
function drawMediumEnemy(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Medium enemy: 32×32 larger rectangle with pattern
  ctx.fillStyle = '#00FF00'
  ctx.fillRect(x, y, 32, 32)
  
  // Add pattern details
  ctx.fillStyle = '#00CC00'
  ctx.fillRect(x + 2, y + 2, 8, 8)
  ctx.fillRect(x + 12, y + 2, 8, 8)
  ctx.fillRect(x + 22, y + 2, 8, 8)
  ctx.fillRect(x + 4, y + 14, 6, 6)
  ctx.fillRect(x + 13, y + 14, 6, 6)
  ctx.fillRect(x + 22, y + 14, 6, 6)
  ctx.fillRect(x + 6, y + 24, 8, 6)
  ctx.fillRect(x + 18, y + 24, 8, 6)
}

/**
 * Draw a large enemy sprite
 */
function drawLargeEnemy(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Large enemy: 40×40 largest rectangle with pattern
  ctx.fillStyle = '#FF6600'
  ctx.fillRect(x, y, 40, 40)
  
  // Add pattern details
  ctx.fillStyle = '#FF3300'
  ctx.fillRect(x + 2, y + 2, 10, 10)
  ctx.fillRect(x + 14, y + 2, 10, 10)
  ctx.fillRect(x + 26, y + 2, 10, 10)
  ctx.fillRect(x + 4, y + 16, 8, 8)
  ctx.fillRect(x + 15, y + 16, 8, 8)
  ctx.fillRect(x + 26, y + 16, 8, 8)
  ctx.fillRect(x + 6, y + 28, 10, 10)
  ctx.fillRect(x + 22, y + 28, 10, 10)
}

/**
 * Enemy type configurations
 */
export const ENEMY_TYPES: Record<EnemyType, EnemyTypeConfig> = {
  small: {
    width: 24,
    height: 24,
    points: 40,
    sprite: drawSmallEnemy
  },
  medium: {
    width: 32,
    height: 32,
    points: 20,
    sprite: drawMediumEnemy
  },
  large: {
    width: 40,
    height: 40,
    points: 10,
    sprite: drawLargeEnemy
  }
}

/**
 * Grid layout: 11×5 grid
 * Rows 0-1: small enemies (type='small', points=40)
 * Rows 2-3: medium enemies (type='medium', points=20)
 * Row 4: large enemies (type='large', points=10)
 * Total: 55 enemies
 */
export const GRID_LAYOUT: EnemyType[] = [
  // Row 0: small (points: 40)
  ...Array(11).fill('small' as EnemyType),
  // Row 1: small (points: 40)
  ...Array(11).fill('small' as EnemyType),
  // Row 2: medium (points: 20)
  ...Array(11).fill('medium' as EnemyType),
  // Row 3: medium (points: 20)
  ...Array(11).fill('medium' as EnemyType),
  // Row 4: large (points: 10)
  ...Array(11).fill('large' as EnemyType)
]

/**
 * Spacing between enemies in the grid
 */
export const ENEMY_SPACING = {
  x: 28, // horizontal spacing
  y: 32  // vertical spacing
}

/**
 * Calculate formation speed based on wave and alive enemy count
 */
export function calculateFormationSpeed(waveNumber: number, aliveEnemyCount: number): number {
  const baseSpeed = 100 // pixels per second
  const waveMultiplier = Math.pow(1.1, waveNumber - 1)
  const countMultiplier = Math.pow(aliveEnemyCount / 55, 0.8)
  return baseSpeed * waveMultiplier * countMultiplier
}
