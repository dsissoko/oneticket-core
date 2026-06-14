import { describe, it, expect } from 'vitest';
import {
  circlesOverlap,
  circleRectOverlap,
  type Circle,
  type Rect,
} from './collision';

describe('Collision Detection Module', () => {
  describe('circlesOverlap', () => {
    it('should return true when circles overlap', () => {
      const a: Circle = { x: 0, y: 0, radius: 10 };
      const b: Circle = { x: 5, y: 0, radius: 10 };
      expect(circlesOverlap(a, b)).toBe(true);
    });

    it('should return false when circles do not overlap', () => {
      const a: Circle = { x: 0, y: 0, radius: 5 };
      const b: Circle = { x: 20, y: 0, radius: 5 };
      expect(circlesOverlap(a, b)).toBe(false);
    });

    it('should return true when circles are touching', () => {
      const a: Circle = { x: 0, y: 0, radius: 5 };
      const b: Circle = { x: 10, y: 0, radius: 5 };
      expect(circlesOverlap(a, b)).toBe(true);
    });

    it('should return true when one circle is inside another', () => {
      const a: Circle = { x: 0, y: 0, radius: 20 };
      const b: Circle = { x: 0, y: 0, radius: 5 };
      expect(circlesOverlap(a, b)).toBe(true);
    });

    it('should return true when circles are identical', () => {
      const c: Circle = { x: 0, y: 0, radius: 10 };
      expect(circlesOverlap(c, c)).toBe(true);
    });

    it('should handle diagonal overlap', () => {
      const a: Circle = { x: 0, y: 0, radius: 10 };
      const b: Circle = { x: 7, y: 7, radius: 10 };
      expect(circlesOverlap(a, b)).toBe(true);
    });
  });

  describe('circleRectOverlap', () => {
    it('should return true when circle overlaps rectangle', () => {
      const circle: Circle = { x: 5, y: 5, radius: 5 };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(circleRectOverlap(circle, rect)).toBe(true);
    });

    it('should return false when circle is outside rectangle', () => {
      const circle: Circle = { x: 20, y: 20, radius: 5 };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(circleRectOverlap(circle, rect)).toBe(false);
    });

    it('should return true when circle touches rectangle edge', () => {
      const circle: Circle = { x: 10, y: 5, radius: 5 };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(circleRectOverlap(circle, rect)).toBe(true);
    });

    it('should return true when circle is completely inside rectangle', () => {
      const circle: Circle = { x: 5, y: 5, radius: 2 };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(circleRectOverlap(circle, rect)).toBe(true);
    });

    it('should return true when circle corner nearly touches rectangle corner', () => {
      const circle: Circle = { x: 9.5, y: 9.5, radius: 1 };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(circleRectOverlap(circle, rect)).toBe(true);
    });

    it('should handle circle above rectangle', () => {
      const circle: Circle = { x: 5, y: -5, radius: 3 };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(circleRectOverlap(circle, rect)).toBe(false);
    });
  });
});
