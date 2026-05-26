class Bricks {
  constructor(rows = 5, cols = 9, padding = 10, offsetTop = 60, offsetSide = 35, width = 75, height = 20) {
    this.rows = rows;
    this.cols = cols;
    this.padding = padding;
    this.offsetTop = offsetTop;
    this.offsetSide = offsetSide;
    this.width = width;
    this.height = height;
    this.grid = [];
  }

  init() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = { alive: true };
      }
    }
  }

  draw(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].alive) {
          const x = this.offsetSide + c * (this.width + this.padding);
          const y = this.offsetTop + r * (this.height + this.padding);
          ctx.fillStyle = 'green';
          ctx.fillRect(x, y, this.width, this.height);
        }
      }
    }
  }

  checkCollision(ball) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].alive) {
          const x = this.offsetSide + c * (this.width + this.padding);
          const y = this.offsetTop + r * (this.height + this.padding);
          if (
            ball.x + ball.radius > x &&
            ball.x - ball.radius < x + this.width &&
            ball.y + ball.radius > y &&
            ball.y - ball.radius < y + this.height
          ) {
            this.grid[r][c].alive = false;
            return true;
          }
        }
      }
    }
    return false;
  }

  allDestroyed() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].alive) {
          return false;
        }
      }
    }
    return true;
  }
}

export { Bricks };