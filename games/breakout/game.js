class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.score = 0;
    this.gameOver = false;
    this.boundKeyboardEvents = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.boundKeyboardEvents);
  }

  init() {
    this.gameLoop();
  }

  update() {
    if (this.paddle) this.paddle.update();
    if (this.ball) this.ball.update();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  gameOver() {
    this.gameOver = true;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
  }

  gameLoop() {
    if (this.gameOver) return;
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  handleKeyDown(event) {
  }
}

export default Game;