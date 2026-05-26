class Paddle {
  constructor(x, y, width = 100, height = 10, speed = 8) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  moveLeft() {
    if (this.x > 0) {
      this.x -= this.speed;
    }
  }

  moveRight(canvasWidth) {
    if (this.x < canvasWidth - this.width) {
      this.x += this.speed;
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  reset(canvasWidth) {
    this.x = (canvasWidth - this.width) / 2;
  }
}

export default Paddle;