/**
 * Paddle model for the Breakout game
 * Represents the player-controlled paddle with position and dimensions
 */

export interface PaddleProperties {
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
}

export class Paddle {
  private properties: PaddleProperties;

  constructor(x: number, y: number, width: number, height: number) {
    this.properties = {
      position: { x, y },
      width,
      height,
    };
  }

  // Position getters and setters
  get position() {
    return this.properties.position;
  }

  set position(pos: { x: number; y: number }) {
    this.properties.position = pos;
  }

  get x(): number {
    return this.properties.position.x;
  }

  set x(value: number) {
    this.properties.position.x = value;
  }

  get y(): number {
    return this.properties.position.y;
  }

  set y(value: number) {
    this.properties.position.y = value;
  }

  // Dimension getters and setters
  get width(): number {
    return this.properties.width;
  }

  set width(value: number) {
    this.properties.width = value;
  }

  get height(): number {
    return this.properties.height;
  }

  set height(value: number) {
    this.properties.height = value;
  }

  // Get all properties
  get props(): PaddleProperties {
    return this.properties;
  }
}

export default Paddle;
