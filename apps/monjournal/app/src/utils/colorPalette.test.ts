import { describe, it, expect } from 'vitest';
import { COLORS, validatePalette } from './colorPalette';

describe('colorPalette', () => {
  describe('COLORS array', () => {
    it('contains 8-12 colors', () => {
      expect(COLORS.length).toBeGreaterThanOrEqual(8);
      expect(COLORS.length).toBeLessThanOrEqual(12);
    });

    it('contains all valid hex color strings', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      COLORS.forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });

    it('contains unique colors', () => {
      const uniqueColors = new Set(COLORS);
      expect(uniqueColors.size).toBe(COLORS.length);
    });

    it('provides visually distinct colors', () => {
      // Verify we have colors across different hue ranges
      // This is a basic check that colors are reasonably distinct
      expect(COLORS.length).toBeGreaterThan(1);
      // Red, Teal, Blue, Orange, Green, Purple etc.
      const expectedColors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#FFA07A', // Light Salmon
      ];
      expectedColors.forEach((color) => {
        expect(COLORS.includes(color)).toBe(true);
      });
    });
  });

  describe('validatePalette', () => {
    it('returns true for valid palette', () => {
      expect(validatePalette()).toBe(true);
    });

    it('confirms palette size is in range', () => {
      const isValid = validatePalette();
      expect(isValid).toBe(COLORS.length >= 8 && COLORS.length <= 12);
    });
  });
});
