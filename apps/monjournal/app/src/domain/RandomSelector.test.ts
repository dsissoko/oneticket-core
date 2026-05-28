import { describe, it, expect } from 'vitest';
import { selectRandom } from './RandomSelector';

/**
 * Chi-squared statistical test implementation.
 * Tests if observed distribution matches expected uniform distribution.
 */
function chiSquaredTest(observed: number[], expected: number[]): {
  statistic: number;
  pValue: number;
  isUniform: boolean;
} {
  if (observed.length !== expected.length) {
    throw new Error('Observed and expected must have same length');
  }

  let chiSquared = 0;
  for (let i = 0; i < observed.length; i++) {
    if (expected[i] === 0) continue;
    const diff = observed[i] - expected[i];
    chiSquared += (diff * diff) / expected[i];
  }

  // Degrees of freedom = categories - 1
  const df = observed.length - 1;

  // Critical value for chi-squared with df degrees of freedom at α=0.05
  // We'll use a simplified approach: for df=9 (10 categories), critical ≈ 16.92
  // For general case, we'll use this approximation
  const criticalValue = 16.92; // For df=9, α=0.05

  return {
    statistic: chiSquared,
    pValue: chiSquared > criticalValue ? 0.01 : 0.95, // Simplified p-value
    isUniform: chiSquared <= criticalValue,
  };
}

/**
 * Simple seeded random number generator for deterministic testing.
 * Uses a linear congruential generator (LCG).
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // Standard LCG parameters
    const a = 1103515245;
    const c = 12345;
    const m = 2147483648; // 2^31

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}

describe('RandomSelector.selectRandom', () => {
  describe('Basic functionality', () => {
    it('should return an item from non-empty array', () => {
      const items = [1, 2, 3, 4, 5];
      const result = selectRandom(items);

      expect(result).not.toBeNull();
      expect(items).toContain(result);
    });

    it('should return null for empty array', () => {
      const result = selectRandom([]);
      expect(result).toBeNull();
    });

    it('should handle single-item array', () => {
      const items = ['only'];
      const result = selectRandom(items);
      expect(result).toBe('only');
    });

    it('should work with any type (strings)', () => {
      const items = ['apple', 'banana', 'cherry'];
      const result = selectRandom(items);

      expect(typeof result).toBe('string');
      expect(items).toContain(result);
    });

    it('should work with any type (objects)', () => {
      const obj1 = { id: 1, name: 'Object 1' };
      const obj2 = { id: 2, name: 'Object 2' };
      const items = [obj1, obj2];
      const result = selectRandom(items);

      expect(result).toEqual(expect.objectContaining({ id: expect.any(Number) }));
      expect(items).toContain(result);
    });
  });

  describe('Custom random function', () => {
    it('should accept and use custom random function', () => {
      const items = [10, 20, 30];
      // Always return 0.5 (should select middle item)
      const customRandom = () => 0.5;
      const result = selectRandom(items, customRandom);

      // floor(0.5 * 3) = floor(1.5) = 1
      expect(result).toBe(20);
    });

    it('should handle custom function returning 0', () => {
      const items = ['a', 'b', 'c'];
      const customRandom = () => 0;
      const result = selectRandom(items, customRandom);

      // floor(0 * 3) = 0
      expect(result).toBe('a');
    });

    it('should handle custom function returning near 1', () => {
      const items = ['a', 'b', 'c'];
      const customRandom = () => 0.9999;
      const result = selectRandom(items, customRandom);

      // floor(0.9999 * 3) = floor(2.9997) = 2
      expect(result).toBe('c');
    });

    it('should work with seeded random generator', () => {
      const items = [1, 2, 3, 4, 5];
      const seeded1 = new SeededRandom(12345);
      const seeded2 = new SeededRandom(12345);

      const result1 = selectRandom(items, () => seeded1.next());
      const result2 = selectRandom(items, () => seeded2.next());

      // Same seed should produce same sequence
      expect(result1).toBe(result2);
    });
  });

  describe('Uniform distribution (statistical tests)', () => {
    it('should produce uniform distribution over 1000 selections with 10 items', () => {
      const items = Array.from({ length: 10 }, (_, i) => i);
      const counts = new Array(10).fill(0);
      const iterations = 1000;

      // Perform random selections
      for (let i = 0; i < iterations; i++) {
        const selected = selectRandom(items);
        if (selected !== null) {
          counts[selected]++;
        }
      }

      // Expected: ~100 selections per item (1000/10)
      const expected = new Array(10).fill(100);

      // Run chi-squared test
      const test = chiSquaredTest(counts, expected);

      // Results should show uniform distribution
      expect(test.isUniform).toBe(true);

      // Verify each item appears approximately same number of times
      counts.forEach((count) => {
        // Allow ±20% variance from expected (80-120)
        expect(count).toBeGreaterThanOrEqual(80);
        expect(count).toBeLessThanOrEqual(120);
      });
    });

    it('should produce uniform distribution over 5000 selections with 20 items', () => {
      const items = Array.from({ length: 20 }, (_, i) => i);
      const counts = new Array(20).fill(0);
      const iterations = 5000;

      for (let i = 0; i < iterations; i++) {
        const selected = selectRandom(items);
        if (selected !== null) {
          counts[selected]++;
        }
      }

      const expected = new Array(20).fill(250); // 5000/20

      // With larger dataset, allow ±20% variance for better robustness
      counts.forEach((count) => {
        // Allow ±20% variance (200-300)
        expect(count).toBeGreaterThanOrEqual(200);
        expect(count).toBeLessThanOrEqual(300);
      });
    });

    it('should distribute relatively evenly with seeded random (small sample)', () => {
      const items = ['a', 'b', 'c'];
      const seeded = new SeededRandom(42);
      const counts: { [key: string]: number } = { a: 0, b: 0, c: 0 };
      const iterations = 300;

      for (let i = 0; i < iterations; i++) {
        const selected = selectRandom(items, () => seeded.next());
        if (selected !== null) {
          counts[selected]++;
        }
      }

      // With seeded RNG and 300 iterations on 3 items, expect ~100 each
      // Allow ±25% variance due to deterministic sequence characteristics
      const values = Object.values(counts);
      values.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(75);
        expect(count).toBeLessThanOrEqual(125);
      });
    });
  });

  describe('Edge cases and robustness', () => {
    it('should handle corrupted/undefined entries gracefully', () => {
      const items: (number | null)[] = [1, null, 3, null, 5];
      const result = selectRandom(items);

      // Should still return an item from the array (even if null)
      expect(items).toContain(result);
    });

    it('should maintain selection across multiple calls', () => {
      const items = [10, 20, 30, 40, 50];
      const results = new Array(5).fill(0).map(() => selectRandom(items));

      // All results should be from items
      results.forEach((result) => {
        expect(items).toContain(result);
      });
    });

    it('should handle very large arrays efficiently', () => {
      const items = Array.from({ length: 10000 }, (_, i) => i);
      const startTime = performance.now();

      const result = selectRandom(items);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result).not.toBeNull();
      expect(items).toContain(result);
      // Should complete in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should return null consistently for empty array', () => {
      const results = Array.from({ length: 10 }, () => selectRandom([]));
      results.forEach((result) => {
        expect(result).toBeNull();
      });
    });
  });

  describe('Type safety and generics', () => {
    it('should preserve type T in return value', () => {
      interface User {
        id: string;
        name: string;
      }

      const users: User[] = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];

      const selected = selectRandom(users);

      // TypeScript should infer type as User | null
      if (selected !== null) {
        expect(selected.name).toBeDefined();
        expect(typeof selected.name).toBe('string');
      }
    });
  });
});
