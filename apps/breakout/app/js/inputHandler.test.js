/**
 * InputHandler — Test suite for input event handling
 */

// Simple test runner for Node.js
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    process.exit(1);
  }
}

// Load InputHandler and GameState
import InputHandler from './inputHandler.js';
// GameState uses CommonJS, so we need to create it inline for tests
class GameState {
  constructor(options = {}) {
    this.phase = options.phase || "menu";
    this.lives = options.lives !== undefined ? options.lives : 3;
    this.bricks = options.bricks || [];
    this.ball = options.ball || {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 5
    };
    this.paddle = options.paddle || {
      x: 0,
      y: 0,
      width: 60,
      height: 10,
      vx: 0
    };
    this.speedMultiplier = options.speedMultiplier || 1.0;
    this.isPaused = options.isPaused || false;
    this.score = options.score || 0;
    this.isWon = options.isWon || false;
  }
}

// Test suite

test('InputHandler constructor initializes with default paddleSpeed', () => {
  const handler = new InputHandler();
  assert(handler.paddleSpeed === 300, `Expected paddleSpeed 300, got ${handler.paddleSpeed}`);
});

test('InputHandler constructor accepts custom paddleSpeed', () => {
  const handler = new InputHandler(400);
  assert(handler.paddleSpeed === 400, `Expected paddleSpeed 400, got ${handler.paddleSpeed}`);
});

test('InputHandler initializes with keysPressed tracking', () => {
  const handler = new InputHandler();
  assert(handler.keysPressed.ArrowLeft === false, 'ArrowLeft should be false initially');
  assert(handler.keysPressed.ArrowRight === false, 'ArrowRight should be false initially');
});

test('InputHandler.update() sets paddle.vx = -paddleSpeed when ArrowLeft is pressed', () => {
  const handler = new InputHandler(300);
  const gameState = new GameState();
  
  // Simulate ArrowLeft key press
  handler.keysPressed.ArrowLeft = true;
  handler.keysPressed.ArrowRight = false;
  
  handler.update(gameState);
  
  assert(gameState.paddle.vx === -300, `Expected paddle.vx = -300, got ${gameState.paddle.vx}`);
});

test('InputHandler.update() sets paddle.vx = +paddleSpeed when ArrowRight is pressed', () => {
  const handler = new InputHandler(300);
  const gameState = new GameState();
  
  // Simulate ArrowRight key press
  handler.keysPressed.ArrowLeft = false;
  handler.keysPressed.ArrowRight = true;
  
  handler.update(gameState);
  
  assert(gameState.paddle.vx === 300, `Expected paddle.vx = 300, got ${gameState.paddle.vx}`);
});

test('InputHandler.update() sets paddle.vx = 0 when no key is pressed', () => {
  const handler = new InputHandler(300);
  const gameState = new GameState();
  
  // Simulate no key press
  handler.keysPressed.ArrowLeft = false;
  handler.keysPressed.ArrowRight = false;
  
  handler.update(gameState);
  
  assert(gameState.paddle.vx === 0, `Expected paddle.vx = 0, got ${gameState.paddle.vx}`);
});

test('InputHandler.update() sets paddle.vx = 0 when both keys are pressed', () => {
  const handler = new InputHandler(300);
  const gameState = new GameState();
  
  // Simulate both keys pressed (should neutralize)
  handler.keysPressed.ArrowLeft = true;
  handler.keysPressed.ArrowRight = true;
  
  handler.update(gameState);
  
  assert(gameState.paddle.vx === 0, `Expected paddle.vx = 0 when both keys pressed, got ${gameState.paddle.vx}`);
});

// Mock keyboard event helper
function mockKeyboardEvent(key) {
  return { key };
}

test('InputHandler.handleKeyDown() sets keysPressed.ArrowLeft on ArrowLeft key', () => {
  const handler = new InputHandler();
  const event = mockKeyboardEvent('ArrowLeft');
  
  handler.handleKeyDown(event);
  
  assert(handler.keysPressed.ArrowLeft === true, 'ArrowLeft should be true after keydown');
});

test('InputHandler.handleKeyDown() sets keysPressed.ArrowRight on ArrowRight key', () => {
  const handler = new InputHandler();
  const event = mockKeyboardEvent('ArrowRight');
  
  handler.handleKeyDown(event);
  
  assert(handler.keysPressed.ArrowRight === true, 'ArrowRight should be true after keydown');
});

test('InputHandler.handleKeyDown() ignores non-arrow keys', () => {
  const handler = new InputHandler();
  const event = mockKeyboardEvent('a');
  
  handler.handleKeyDown(event);
  
  assert(handler.keysPressed.ArrowLeft === false, 'ArrowLeft should remain false');
  assert(handler.keysPressed.ArrowRight === false, 'ArrowRight should remain false');
});

test('InputHandler.handleKeyUp() clears keysPressed.ArrowLeft on ArrowLeft key', () => {
  const handler = new InputHandler();
  handler.keysPressed.ArrowLeft = true;
  
  const event = mockKeyboardEvent('ArrowLeft');
  handler.handleKeyUp(event);
  
  assert(handler.keysPressed.ArrowLeft === false, 'ArrowLeft should be false after keyup');
});

test('InputHandler.handleKeyUp() clears keysPressed.ArrowRight on ArrowRight key', () => {
  const handler = new InputHandler();
  handler.keysPressed.ArrowRight = true;
  
  const event = mockKeyboardEvent('ArrowRight');
  handler.handleKeyUp(event);
  
  assert(handler.keysPressed.ArrowRight === false, 'ArrowRight should be false after keyup');
});

test('InputHandler.handleKeyUp() ignores non-arrow keys', () => {
  const handler = new InputHandler();
  handler.keysPressed.ArrowLeft = true;
  
  const event = mockKeyboardEvent('a');
  handler.handleKeyUp(event);
  
  assert(handler.keysPressed.ArrowLeft === true, 'ArrowLeft should remain true when non-arrow key released');
});

test('InputHandler respects custom paddleSpeed in update()', () => {
  const handler = new InputHandler(500);
  const gameState = new GameState();
  
  handler.keysPressed.ArrowLeft = true;
  handler.keysPressed.ArrowRight = false;
  
  handler.update(gameState);
  
  assert(gameState.paddle.vx === -500, `Expected paddle.vx = -500, got ${gameState.paddle.vx}`);
});

test('InputHandler sequential key presses work correctly', () => {
  const handler = new InputHandler(300);
  const gameState = new GameState();
  
  // First press ArrowLeft
  handler.keysPressed.ArrowLeft = true;
  handler.update(gameState);
  assert(gameState.paddle.vx === -300, 'Should move left');
  
  // Release ArrowLeft, press ArrowRight
  handler.keysPressed.ArrowLeft = false;
  handler.keysPressed.ArrowRight = true;
  handler.update(gameState);
  assert(gameState.paddle.vx === 300, 'Should move right');
  
  // Release ArrowRight
  handler.keysPressed.ArrowRight = false;
  handler.update(gameState);
  assert(gameState.paddle.vx === 0, 'Should stop moving');
});

console.log('\nAll tests passed! ✓');
