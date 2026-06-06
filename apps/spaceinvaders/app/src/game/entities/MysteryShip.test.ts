import { describe, it, expect } from 'vitest'
import { MysteryShipSpawner } from './MysteryShip'

describe('MysteryShipSpawner', () => {
  it('initializes with next spawn time in valid range', () => {
    const initialTime = 1000
    const spawner = new MysteryShipSpawner(initialTime)
    const nextSpawnTime = spawner.getNextSpawnTime()
    
    expect(nextSpawnTime).toBeGreaterThan(initialTime)
    expect(nextSpawnTime - initialTime).toBeLessThanOrEqual(20000)
    expect(nextSpawnTime - initialTime).toBeGreaterThanOrEqual(10000)
  })

  it('returns true when spawn time is reached', () => {
    const initialTime = 1000
    const spawner = new MysteryShipSpawner(initialTime)
    const nextSpawnTime = spawner.getNextSpawnTime()
    
    expect(spawner.isSpawnTime(nextSpawnTime - 1)).toBe(false)
    expect(spawner.isSpawnTime(nextSpawnTime)).toBe(true)
  })

  it('creates ship with valid parameters', () => {
    const initialTime = 1000
    const spawner = new MysteryShipSpawner(initialTime)
    const shipParams = spawner.createShip(initialTime, 800)
    
    expect(shipParams.y).toBe(20)
    expect([50, 100, 150, 300]).toContain(shipParams.pointValue)
    expect(Math.abs(shipParams.vx)).toBe(100)
    expect([800, -40]).toContain(shipParams.x)
  })

  it('schedules next spawn with correct timing', () => {
    const initialTime = 1000
    const spawner = new MysteryShipSpawner(initialTime)
    
    const nextSpawnTime1 = spawner.getNextSpawnTime()
    spawner.scheduleNextSpawn(initialTime)
    const nextSpawnTime2 = spawner.getNextSpawnTime()
    
    // Both should be valid spawn times (10-20 seconds from current time)
    expect(nextSpawnTime1 - initialTime).toBeGreaterThanOrEqual(10000)
    expect(nextSpawnTime2 - initialTime).toBeGreaterThanOrEqual(10000)
    expect(nextSpawnTime2 - initialTime).toBeLessThanOrEqual(20000)
  })

  it('generates random point values across multiple spawns', () => {
    const initialTime = 1000
    const spawner = new MysteryShipSpawner(initialTime)
    const pointValues = new Set<number>()
    
    // Generate multiple ships to likely get different point values
    for (let i = 0; i < 20; i++) {
      const shipParams = spawner.createShip(initialTime, 800)
      pointValues.add(shipParams.pointValue)
    }
    
    // Should have at least 2 different point values (statistically very likely)
    expect(pointValues.size).toBeGreaterThan(1)
    
    // All values should be in the pool
    pointValues.forEach((val) => {
      expect([50, 100, 150, 300]).toContain(val)
    })
  })

  it('alternates spawn directions', () => {
    const initialTime = 1000
    const spawner = new MysteryShipSpawner(initialTime)
    const directions = []
    
    for (let i = 0; i < 30; i++) {
      const shipParams = spawner.createShip(initialTime, 800)
      directions.push(shipParams.x)
    }
    
    // Should have both left (-40) and right (800) starting positions
    const hasLeft = directions.some((x) => x === -40)
    const hasRight = directions.some((x) => x === 800)
    
    expect(hasLeft).toBe(true)
    expect(hasRight).toBe(true)
  })
})
