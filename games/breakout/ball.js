class Ball {
  constructor(x, y, radius = 8, dx = 4, dy = -4, speed = 5) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
  }

  update(canvasWidth, canvasHeight) {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x - this.radius <= 0 || this.x + this.radius >= canvasWidth) {
      this.dx = -this.dx;
      this.x = Math.max(this.radius, Math.min(this.x, canvasWidth - this.radius));
    }

    if (this.y - this.radius <= 0 || this.y + this.radius >= canvasHeight) {
      this.dy = -this.dy;
      this.y = Math.max(this.radius, Math.min(this.y, canvasHeight - this.radius));
    }
  }

  reset(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    this.dx = Math.sin(angle) * this.speed;
    this.dy = -Math.cos(angle) * this.speed;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }
}

export default Ball;