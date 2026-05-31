// Shared TypeScript types for AppShell

export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}

export interface GameState {
  phase: 'menu' | 'playing' | 'gameOver' | 'victory';
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[];
  lives: number;
  speedMultiplier: number;
}
