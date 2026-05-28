/**
 * BrickFactory — Test suite for brick layout creation
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

// Load BrickFactory
import BrickFactory from './brickFactory.js';

// Test suite
test('BrickFactory.createInitialLayout() returns 50 bricks', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();
  assert(bricks.length === 50, `Expected 50 bricks, got ${bricks.length}`);
});

test('Each brick has required properties', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();

  bricks.forEach((brick, index) => {
    assert(brick.id !== undefined, `Brick ${index} missing id`);
    assert(typeof brick.x === 'number', `Brick ${index} x is not a number`);
    assert(typeof brick.y === 'number', `Brick ${index} y is not a number`);
    assert(typeof brick.width === 'number', `Brick ${index} width is not a number`);
    assert(typeof brick.height === 'number', `Brick ${index} height is not a number`);
    assert(brick.color !== undefined, `Brick ${index} missing color`);
  });
});

test('Brick IDs are unique', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();
  const ids = new Set(bricks.map(b => b.id));
  assert(ids.size === 50, `Expected 50 unique IDs, got ${ids.size}`);
});

test('First brick (row 0, col 0) is red', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();
  const firstBrick = bricks[0];

  assert(firstBrick.id === 'brick-0-0', `Expected id 'brick-0-0', got '${firstBrick.id}'`);
  assert(firstBrick.color === 'red', `Expected red, got ${firstBrick.color}`);
  assert(firstBrick.x === 0, `Expected x=0, got x=${firstBrick.x}`);
  assert(firstBrick.y === 30, `Expected y=30, got y=${firstBrick.y}`);
});

test('Last brick (row 4, col 9) is blue', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();
  const lastBrick = bricks[49];

  assert(lastBrick.id === 'brick-4-9', `Expected id 'brick-4-9', got '${lastBrick.id}'`);
  assert(lastBrick.color === 'blue', `Expected blue, got ${lastBrick.color}`);
});

test('All bricks have correct width and height', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();

  bricks.forEach((brick, index) => {
    assert(brick.width === 80, `Brick ${index} has wrong width: ${brick.width}`);
    assert(brick.height === 20, `Brick ${index} has wrong height: ${brick.height}`);
  });
});

test('Bricks are arranged in 5 rows with correct Y positions', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();

  const expectedYPositions = [30, 50, 70, 90, 110];

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      const brick = bricks[row * 10 + col];
      assert(
        brick.y === expectedYPositions[row],
        `Brick at row ${row} has y=${brick.y}, expected ${expectedYPositions[row]}`
      );
    }
  }
});

test('Bricks are arranged in 10 columns with correct X positions', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      const brick = bricks[row * 10 + col];
      const expectedX = col * 80;
      assert(
        brick.x === expectedX,
        `Brick at col ${col} has x=${brick.x}, expected ${expectedX}`
      );
    }
  }
});

test('Row colors follow rainbow progression', () => {
  const factory = new BrickFactory();
  const bricks = factory.createInitialLayout();
  const expectedColors = ['red', 'orange', 'yellow', 'green', 'blue'];

  for (let row = 0; row < 5; row++) {
    const brick = bricks[row * 10]; // First brick in each row
    assert(
      brick.color === expectedColors[row],
      `Row ${row} has color ${brick.color}, expected ${expectedColors[row]}`
    );
  }
});

console.log('\nAll tests passed! ✓');
