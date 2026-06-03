/**
 * Ball model for the Breakout game
 */

export interface BallProperties {
  position: {
    x: number;
    y: number;
  };
  velocity: {
    vx: number;
    vy: number;
  };
  radius: number;
}

export class Ball implements BallProperties {
  position: { x: number; y: number };
  velocity: { vx: number; vy: number };
  radius: number;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    radius: number
  ) {
    this.position = { x, y };
    this.velocity = { vx, vy };
    this.radius = radius;
  }

  /**
   * Update ball position based on velocity
   */
  update(): void {
    this.position.x += this.velocity.vx;
    this.position.y += this.velocity.vy;
  }

  /**
   * Get ball center coordinates
   */
  getCenter(): { x: number; y: number } {
    return { x: this.position.x, y: this.position.y };
  }
}
