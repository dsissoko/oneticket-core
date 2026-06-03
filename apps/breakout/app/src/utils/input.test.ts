import { describe, it, expect } from 'vitest';
import { mapMouseTopaddle, updateSpeedMultiplier } from './input';

describe('Input Handling Module', () => {
  describe('mapMouseTopaddle', () => {
    it('should center paddle on mouse position when in bounds', () => {
      // Mouse at 400px, canvas 800px, paddle 80px
      // Centered: 400 - 40 = 360
      const result = mapMouseTopaddle(400, 800, 80);
      expect(result).toBe(360);
    });

    it('should clamp paddle to right edge when mouse is near right boundary', () => {
      // Mouse at 790px, canvas 800px, paddle 80px
      // Centered: 790 - 40 = 750, max allowed: 800 - 80 = 720
      // Should clamp to 720
      const result = mapMouseTopaddle(790, 800, 80);
      expect(result).toBe(720);
    });

    it('should clamp paddle to left edge when mouse is near left boundary', () => {
      // Mouse at 10px, canvas 800px, paddle 80px
      // Normal: 10 - 40 = -30, min allowed: 0
      // Should clamp to 0
      const result = mapMouseTopaddle(10, 800, 80);
      expect(result).toBe(0);
    });

    it('should handle mouse at exact center', () => {
      // Mouse at exact canvas center
      const result = mapMouseTopaddle(400, 800, 80);
      expect(result).toBe(360);
    });

    it('should handle mouse at left edge (0)', () => {
      // Mouse at left edge
      const result = mapMouseTopaddle(0, 800, 80);
      expect(result).toBe(0);
    });

    it('should handle mouse at right edge', () => {
      // Mouse at right edge, should clamp properly
      const result = mapMouseTopaddle(800, 800, 80);
      expect(result).toBe(720);
    });

    it('should handle small paddle width', () => {
      // Small paddle (10px) at mouse position 500
      // Centered: 500 - 5 = 495
      const result = mapMouseTopaddle(500, 1000, 10);
      expect(result).toBe(495);
    });

    it('should handle large paddle width', () => {
      // Large paddle (500px) at mouse position 400, canvas 1000px
      // Centered: 400 - 250 = 150
      const result = mapMouseTopaddle(400, 1000, 500);
      expect(result).toBe(150);
    });

    it('should handle paddle wider than canvas', () => {
      // Paddle (1000px) wider than canvas (800px)
      // Centered: 400 - 500 = -100, min is 0, max is -200 (invalid)
      // Should clamp to min of 0
      const result = mapMouseTopaddle(400, 800, 1000);
      expect(result).toBe(0);
    });

    it('should handle very small canvas', () => {
      // Very small canvas (100px), paddle 20px
      const result = mapMouseTopaddle(50, 100, 20);
      expect(result).toBe(40);
    });

    it('should be deterministic', () => {
      const result1 = mapMouseTopaddle(350, 800, 80);
      const result2 = mapMouseTopaddle(350, 800, 80);
      expect(result1).toBe(result2);
    });

    it('should handle fractional mouse positions', () => {
      // Fractional mouse position
      const result = mapMouseTopaddle(400.5, 800, 80);
      expect(result).toBe(360.5);
    });

    it('should handle negative mouse positions (outside canvas)', () => {
      // Mouse position outside canvas (negative)
      const result = mapMouseTopaddle(-10, 800, 80);
      expect(result).toBe(0);
    });
  });

  describe('updateSpeedMultiplier', () => {
    it('should return minimum multiplier at slider value 0', () => {
      const result = updateSpeedMultiplier(0);
      expect(result).toBe(0.5);
    });

    it('should return maximum multiplier at slider value 100', () => {
      const result = updateSpeedMultiplier(100);
      expect(result).toBe(2.0);
    });

    it('should return midpoint multiplier at slider value 50', () => {
      // Midpoint between 0.5 and 2.0 is 1.25
      const result = updateSpeedMultiplier(50);
      expect(result).toBe(1.25);
    });

    it('should interpolate correctly at 25% slider', () => {
      // 25% of range from 0.5 to 2.0
      // 0.5 + 0.25 * (2.0 - 0.5) = 0.5 + 0.375 = 0.875
      const result = updateSpeedMultiplier(25);
      expect(result).toBeCloseTo(0.875);
    });

    it('should interpolate correctly at 75% slider', () => {
      // 75% of range from 0.5 to 2.0
      // 0.5 + 0.75 * (2.0 - 0.5) = 0.5 + 1.125 = 1.625
      const result = updateSpeedMultiplier(75);
      expect(result).toBeCloseTo(1.625);
    });

    it('should clamp negative slider values to 0', () => {
      const result = updateSpeedMultiplier(-50);
      expect(result).toBe(0.5);
    });

    it('should clamp slider values above 100', () => {
      const result = updateSpeedMultiplier(150);
      expect(result).toBe(2.0);
    });

    it('should accept custom minimum multiplier', () => {
      const result = updateSpeedMultiplier(0, 0.8, 3.0);
      expect(result).toBe(0.8);
    });

    it('should accept custom maximum multiplier', () => {
      const result = updateSpeedMultiplier(100, 0.8, 3.0);
      expect(result).toBe(3.0);
    });

    it('should interpolate with custom multiplier bounds', () => {
      // Custom: 0.8 to 3.0, at 50%
      // 0.8 + 0.5 * (3.0 - 0.8) = 0.8 + 1.1 = 1.9
      const result = updateSpeedMultiplier(50, 0.8, 3.0);
      expect(result).toBeCloseTo(1.9);
    });

    it('should handle equal min and max multipliers', () => {
      // When min and max are equal, should always return that value
      const result = updateSpeedMultiplier(50, 1.5, 1.5);
      expect(result).toBe(1.5);
    });

    it('should handle reversed multiplier bounds (max < min)', () => {
      // Even with reversed bounds, linear interpolation should work
      const result = updateSpeedMultiplier(50, 2.0, 0.5);
      expect(result).toBeCloseTo(1.25);
    });

    it('should handle very small multiplier values', () => {
      const result = updateSpeedMultiplier(50, 0.1, 0.2);
      expect(result).toBeCloseTo(0.15);
    });

    it('should handle very large multiplier values', () => {
      const result = updateSpeedMultiplier(50, 10, 20);
      expect(result).toBe(15);
    });

    it('should be deterministic', () => {
      const result1 = updateSpeedMultiplier(42);
      const result2 = updateSpeedMultiplier(42);
      expect(result1).toBe(result2);
    });

    it('should handle fractional slider values', () => {
      // 33.33% slider
      const result = updateSpeedMultiplier(33.33);
      const expected = 0.5 + (33.33 / 100) * (2.0 - 0.5);
      expect(result).toBeCloseTo(expected);
    });

    it('should handle slider value exactly at bounds', () => {
      const result0 = updateSpeedMultiplier(0);
      const result100 = updateSpeedMultiplier(100);
      expect(result0).toBe(0.5);
      expect(result100).toBe(2.0);
    });

    it('should produce consistent speed increments across range', () => {
      // Test that speed increases linearly
      const result0 = updateSpeedMultiplier(0);
      const result50 = updateSpeedMultiplier(50);
      const result100 = updateSpeedMultiplier(100);

      const increment1 = result50 - result0;
      const increment2 = result100 - result50;

      expect(increment1).toBeCloseTo(increment2);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for typical game scenario', () => {
      // Simulate mouse at center, speed slider at 60%
      const paddleX = mapMouseTopaddle(400, 800, 80);
      const speedMult = updateSpeedMultiplier(60);

      expect(paddleX).toBe(360);
      // 0.5 + 0.6 * (2.0 - 0.5) = 0.5 + 0.6 * 1.5 = 0.5 + 0.9 = 1.4
      expect(speedMult).toBeCloseTo(1.4);
    });

    it('should handle extreme input combinations', () => {
      // Mouse far left, speed at minimum
      const paddleX1 = mapMouseTopaddle(0, 1000, 100);
      const speedMult1 = updateSpeedMultiplier(0);

      expect(paddleX1).toBe(0);
      expect(speedMult1).toBe(0.5);

      // Mouse far right, speed at maximum
      const paddleX2 = mapMouseTopaddle(1000, 1000, 100);
      const speedMult2 = updateSpeedMultiplier(100);

      expect(paddleX2).toBe(900);
      expect(speedMult2).toBe(2.0);
    });
  });
});
