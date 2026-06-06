/**
 * WaveConfig — wave progression and difficulty configuration
 */

export const WAVE_CONFIG = {
  // Base values at Wave 1
  BASE_FORMATION_SPEED: 100, // pixels/sec at wave 1
  BASE_ENEMY_FIRE_INTERVAL: 1000, // milliseconds at wave 1

  // Difficulty scaling
  WAVE_SPEED_MULTIPLIER: 1.1, // 10% increase per wave
  // Fire rate increases by same factor (but expressed as interval multiplier 1/1.1)

  // Lives and scoring
  LIVES_PER_WAVE: 3,
  TOTAL_ENEMIES: 55,

  // Transitions
  VICTORY_TRANSITION_DELAY: 2000, // milliseconds (2 seconds)
  RESTART_WAIT_TIME: 0 // immediate

} as const
