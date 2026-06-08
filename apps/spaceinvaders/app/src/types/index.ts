// Shared TypeScript types for SpaceInvaders

export type GamePhase = 'menu' | 'playing' | 'gameover' | 'victory';

export interface Alien {
  x: number;
  y: number;
  alive: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  vy: number;
  direction: number;
}

export interface Shield {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
}

export interface Cannon {
  x: number;
  width: number;
  height: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  bestScore: number;
  lives: number;
  cannon: Cannon;
  aliens: Alien[];
  playerProjectiles: Projectile[];
  alienProjectiles: Projectile[];
  shields: Shield[];
  alienDirection: number;
  alienSpeed: number;
  lastFireTime: number;
  reloadDelay: number;
  invincible: boolean;
  invincibleTimer: number;
}
