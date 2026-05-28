/**
 * Physics Engine — Test suite for ball and paddle physics
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

function approxEqual(a, b, tolerance = 0.01) {
  return Math.abs(a - b) < tolerance;
}

// Load modules
import Physics from './physics.js';
import GameState from './gameState.js';

// Test suite

test('Physics constructor initializes with default canvas dimensions', () => {
  const physics = new Physics();
  assert(physics.canvasWidth === 800, 'Default canvasWidth should be 800');
  assert(physics.canvasHeight === 600, 'Default canvasHeight should be 600');
});

test('Physics constructor accepts custom canvas dimensions', () => {
  const physics = new Physics({ canvasWidth: 1024, canvasHeight: 768 });
  assert(physics.canvasWidth === 1024, 'canvasWidth should be 1024');
  assert(physics.canvasHeight === 768, 'canvasHeight should be 768');
});

test('Ball position updates correctly: x += vx * deltaTime', () => {
  const physics = new Physics();
  const gameState = new GameState();

  gameState.ball.x = 400;
  gameState.ball.vx = 200; // pixels per second
  gameState.speedMultiplier = 1.0;

  const deltaTime = 0.01; // 10ms
  physics.update(deltaTime, gameState);

  // Expected: 400 + 200 * 0.01 = 402
  assert(
    approxEqual(gameState.ball.x, 402, 0.01),
    `Expected ball.x ≈ 402, got ${gameState.ball.x}`
  );
});

test('Ball position updates correctly: y += vy * deltaTime', () => {
  const physics = new Physics();
  const gameState = new GameState();

  gameState.ball.y = 300;
  gameState.ball.vy = -150; // pixels per second (upward)
  gameState.speedMultiplier = 1.0;

  const deltaTime = 0.01; // 10ms
  physics.update(deltaTime, gameState);

  // Expected: 300 + (-150) * 0.01 = 298.5
  assert(
    approxEqual(gameState.ball.y, 298.5, 0.01),
    `Expected ball.y ≈ 298.5, got ${gameState.ball.y}`
  );
});

test('Speed multiplier is applied to ball velocity', () => {
  const physics = new Physics();
  const gameState = new GameState();

  gameState.ball.vx = 200;
  gameState.ball.vy = 150;
  gameState.speedMultiplier = 2.0; // Double speed

  physics.update(0.01, gameState);

  // Velocity should be multiplied by speedMultiplier
  // After update: vx = 200 * 2.0 = 400, vy = 150 * 2.0 = 300
  assert(
    approxEqual(gameState.ball.vx, 400, 0.01),
    `Expected ball.vx ≈ 400, got ${gameState.ball.vx}`
  );
  assert(
    approxEqual(gameState.ball.vy, 300, 0.01),
    `Expected ball.vy ≈ 300, got ${gameState.ball.vy}`
  );
});

test('Speed multiplier is clamped to [0.5, 2.0] range', () => {
  const physics = new Physics();
  const gameState = new GameState();

  gameState.ball.vx = 100;
  gameState.ball.vy = 100;
  gameState.speedMultiplier = 3.0; // Out of range (should clamp to 2.0)

  physics.update(0.01, gameState);

  // Should be clamped to 2.0
  assert(
    approxEqual(gameState.ball.vx, 200, 0.01),
    `Expected ball.vx ≈ 200 (clamped multiplier 2.0), got ${gameState.ball.vx}`
  );
});

test('Paddle position updates correctly: x += vx * deltaTime', () => {
  const physics = new Physics();
  const gameState = new GameState();

  gameState.paddle.x = 300;
  gameState.paddle.width = 60;
  gameState.paddle.vx = 300; // pixels per second (moving right)
  gameState.ball.vx = 0;
  gameState.ball.vy = 0;
  gameState.speedMultiplier = 1.0;

  const deltaTime = 0.01; // 10ms
  physics.update(deltaTime, gameState);

  // Expected: 300 + 300 * 0.01 = 303
  assert(
    approxEqual(gameState.paddle.x, 303, 0.01),
    `Expected paddle.x ≈ 303, got ${gameState.paddle.x}`
  );
});

test('Paddle is clamped to left boundary (x >= 0)', () => {
  const physics = new Physics({ canvasWidth: 800, canvasHeight: 600 });
  const gameState = new GameState();

  gameState.paddle.x = 5;
  gameState.paddle.width = 60;
  gameState.paddle.vx = -200; // Moving left at high speed
  gameState.ball.vx = 0;
  gameState.ball.vy = 0;
  gameState.speedMultiplier = 1.0;

  physics.update(0.1, gameState); // Large deltaTime to move far left

  // Paddle should be clamped to x = 0
  assert(
    gameState.paddle.x >= 0,
    `Expected paddle.x >= 0, got ${gameState.paddle.x}`
  );
});

test('Paddle is clamped to right boundary (x + width <= canvasWidth)', () => {
  const physics = new Physics({ canvasWidth: 800, canvasHeight: 600 });
  const gameState = new GameState();

  gameState.paddle.x = 750;
  gameState.paddle.width = 60;
  gameState.paddle.vx = 300; // Moving right at high speed
  gameState.ball.vx = 0;
  gameState.ball.vy = 0;
  gameState.speedMultiplier = 1.0;

  physics.update(0.1, gameState); // Large deltaTime to move far right

  // Paddle should be clamped so that x + width <= 800
  assert(
    gameState.paddle.x + gameState.paddle.width <= 800,
    `Expected paddle.x + width <= 800, got ${gameState.paddle.x + gameState.paddle.width}`
  );
});

test('Paddle stays within bounds when moving left', () => {
  const physics = new Physics({ canvasWidth: 800, canvasHeight: 600 });
  const gameState = new GameState();

  gameState.paddle.x = 100;
  gameState.paddle.width = 60;
  gameState.paddle.vx = -500; // Fast left movement
  gameState.ball.vx = 0;
  gameState.ball.vy = 0;
  gameState.speedMultiplier = 1.0;

  physics.update(1.0, gameState); // 1 second update

  // Paddle should not go below x = 0
  assert(
    gameState.paddle.x >= 0 && gameState.paddle.x + gameState.paddle.width <= 800,
    `Paddle out of bounds: x=${gameState.paddle.x}, width=${gameState.paddle.width}`
  );
});

test('Ball and paddle update independently in same frame', () => {
  const physics = new Physics();
  const gameState = new GameState();

  gameState.ball.x = 400;
  gameState.ball.y = 300;
  gameState.ball.vx = 200;
  gameState.ball.vy = -100;
  gameState.paddle.x = 300;
  gameState.paddle.vx = 400;
  gameState.paddle.width = 60;
  gameState.speedMultiplier = 1.0;

  const deltaTime = 0.01;
  physics.update(deltaTime, gameState);

  // Ball should have moved
  assert(
    approxEqual(gameState.ball.x, 402, 0.01),
    `Ball should have moved: x ≈ 402, got ${gameState.ball.x}`
  );

  // Paddle should have moved independently
  assert(
    approxEqual(gameState.paddle.x, 304, 0.01),
    `Paddle should have moved: x ≈ 304, got ${gameState.paddle.x}`
  );
});

test('Physics throws error if gameState is missing', () => {
  const physics = new Physics();

  try {
    physics.update(0.01, null);
    assert(false, 'Should have thrown an error for missing gameState');
  } catch (error) {
    assert(
      error.message.includes('GameState'),
      `Expected error about GameState, got: ${error.message}`
    );
  }
});

test('DeltaTime is clamped to prevent large jumps', () => {
  const physics = new Physics();
  const gameState = new GameState();

  gameState.ball.x = 400;
  gameState.ball.vx = 1000;
  gameState.speedMultiplier = 1.0;

  const largeDeltaTime = 1.0; // 1 second is too large
  physics.update(largeDeltaTime, gameState);

  // Ball should not move more than MAX_DELTA_TIME (0.05s) * velocity
  const maxMovement = 1000 * 0.05; // 50 pixels max
  const actualMovement = Math.abs(gameState.ball.x - 400);

  assert(
    actualMovement <= maxMovement + 1, // +1 for tolerance
    `Ball moved ${actualMovement}px, but max should be ${maxMovement}px`
  );
});

console.log('\nAll Physics tests passed! ✓');
