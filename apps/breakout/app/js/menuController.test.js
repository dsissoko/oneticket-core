/**
 * MenuController — Test suite for menu controller functionality
 */

// Simple test runner for Node.js (browser compatibility)
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

// Mock GameState
class MockGameState {
  constructor() {
    this.phase = 'menu';
    this.lives = 3;
    this.bricks = [];
    this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 5 };
    this.paddle = { x: 0, y: 0, width: 60, height: 10, vx: 0 };
    this.speedMultiplier = 1.0;
    this.isPaused = false;
    this.isWon = false;
  }

  resetGame(initialBricks = []) {
    this.phase = 'menu';
    this.lives = 3;
    this.bricks = JSON.parse(JSON.stringify(initialBricks));
    this.ball = {
      x: this.paddle.x,
      y: this.paddle.y - 20,
      vx: 0,
      vy: 0,
      radius: 5
    };
    this.paddle.vx = 0;
    this.speedMultiplier = 1.0;
    this.isPaused = false;
    this.isWon = false;
  }

  setSpeedMultiplier(factor) {
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, factor));
  }

  isVictory() {
    return this.bricks.length === 0 || this.bricks.every(brick => brick.isDestroyed);
  }
}

// Mock BrickFactory
class MockBrickFactory {
  createInitialLayout() {
    return [
      { id: 'brick-0-0', x: 0, y: 30, width: 80, height: 20, color: 'red' },
      { id: 'brick-0-1', x: 80, y: 30, width: 80, height: 20, color: 'red' }
    ];
  }
}

// Mock Canvas Element
class MockCanvasElement {
  constructor() {
    this.width = 800;
    this.height = 600;
  }
}

// Mock DOM elements
global.document = {
  getElementById: function(id) {
    return {
      addEventListener: function() {},
      style: { display: 'none' },
      innerHTML: ''
    };
  }
};

// Load MenuController (in Node.js context, we need to handle module loading)
// For this test, we'll use a simplified version that doesn't require module.exports

// Import MenuController code directly
import MenuController from './menuController.js';

// Test suite
test('MenuController initializes with required properties', () => {
  const gameState = new MockGameState();
  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  assert(menuController.gameState === gameState, 'gameState not set');
  assert(menuController.brickFactory === brickFactory, 'brickFactory not set');
  assert(menuController.canvasElement === canvas, 'canvasElement not set');
  assert(menuController.showOptions === false, 'showOptions should be false initially');
  assert(menuController.speedValue === 1.0, 'speedValue should be 1.0 initially');
});

test('handleStartGame transitions to playing phase', () => {
  const gameState = new MockGameState();
  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  // Create mock event
  const mockEvent = { preventDefault: () => {} };

  menuController.handleStartGame(mockEvent);

  assert(gameState.phase === 'playing', `Expected phase 'playing', got '${gameState.phase}'`);
  assert(gameState.lives === 3, `Expected lives 3, got ${gameState.lives}`);
  assert(gameState.bricks.length === 2, `Expected 2 bricks, got ${gameState.bricks.length}`);
  assert(gameState.ball.vx === 150, `Expected ball.vx 150, got ${gameState.ball.vx}`);
  assert(gameState.ball.vy === -150, `Expected ball.vy -150, got ${gameState.ball.vy}`);
});

test('handlePlayAgain resets game and returns to playing phase', () => {
  const gameState = new MockGameState();
  gameState.phase = 'victory';
  gameState.lives = 1;
  gameState.bricks = [];

  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  const mockEvent = { preventDefault: () => {} };

  menuController.handlePlayAgain(mockEvent);

  assert(gameState.phase === 'playing', `Expected phase 'playing', got '${gameState.phase}'`);
  assert(gameState.lives === 3, `Expected lives reset to 3, got ${gameState.lives}`);
  assert(gameState.bricks.length === 2, `Expected 2 bricks, got ${gameState.bricks.length}`);
});

test('handleReturnToMenu transitions to menu phase', () => {
  const gameState = new MockGameState();
  gameState.phase = 'victory';
  gameState.lives = 2;

  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  const mockEvent = { preventDefault: () => {} };

  menuController.handleReturnToMenu(mockEvent);

  assert(gameState.phase === 'menu', `Expected phase 'menu', got '${gameState.phase}'`);
  assert(menuController.showOptions === false, 'showOptions should be false');
});

test('handleOptionsClicked toggles options screen visibility', () => {
  const gameState = new MockGameState();
  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  assert(menuController.showOptions === false, 'showOptions should be false initially');

  const mockEvent = { preventDefault: () => {} };
  menuController.handleOptionsClicked(mockEvent);

  assert(menuController.showOptions === true, 'showOptions should be true after click');
});

test('handleSpeedChange updates speed multiplier', () => {
  const gameState = new MockGameState();
  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  const mockEvent = {
    target: { value: '1.5' },
    preventDefault: () => {}
  };

  menuController.handleSpeedChange(mockEvent);

  assert(gameState.speedMultiplier === 1.5, `Expected speedMultiplier 1.5, got ${gameState.speedMultiplier}`);
  assert(menuController.speedValue === 1.5, `Expected local speedValue 1.5, got ${menuController.speedValue}`);
});

test('handleSpeedChange clamps speed to valid range', () => {
  const gameState = new MockGameState();
  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  // Test clamping to min (0.5)
  let mockEvent = { target: { value: '0.2' }, preventDefault: () => {} };
  menuController.handleSpeedChange(mockEvent);
  assert(gameState.speedMultiplier === 0.5, `Expected speedMultiplier clamped to 0.5, got ${gameState.speedMultiplier}`);

  // Test clamping to max (2.0)
  mockEvent = { target: { value: '3.0' }, preventDefault: () => {} };
  menuController.handleSpeedChange(mockEvent);
  assert(gameState.speedMultiplier === 2.0, `Expected speedMultiplier clamped to 2.0, got ${gameState.speedMultiplier}`);
});

test('getSpeedLabel returns correct label for speed value', () => {
  const gameState = new MockGameState();
  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  // Test different speed values
  assert(menuController.getSpeedLabel(0.5).includes('Très lent'), 'Label for 0.5 should include "Très lent"');
  assert(menuController.getSpeedLabel(0.75).includes('Lent'), 'Label for 0.75 should include "Lent"');
  assert(menuController.getSpeedLabel(1.0).includes('Moyen'), 'Label for 1.0 should include "Moyen"');
  assert(menuController.getSpeedLabel(1.5).includes('Rapide'), 'Label for 1.5 should include "Rapide"');
  assert(menuController.getSpeedLabel(2.0).includes('Très rapide'), 'Label for 2.0 should include "Très rapide"');
});

test('handleBackFromOptions hides options screen', () => {
  const gameState = new MockGameState();
  const brickFactory = new MockBrickFactory();
  const canvas = new MockCanvasElement();

  const menuController = new MenuController(gameState, brickFactory, canvas);

  // Show options first
  menuController.showOptions = true;

  const mockEvent = { preventDefault: () => {} };
  menuController.handleBackFromOptions(mockEvent);

  assert(menuController.showOptions === false, 'showOptions should be false after back button click');
});

console.log('\nAll MenuController tests passed! ✓');
