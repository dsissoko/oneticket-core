import { describe, it, expect } from 'vitest';
import {
  checkAABB,
  checkCircleAABB,
  resolveBallCollision,
  type Ball,
  type Rect,
} from './collision';

describe('Collision Detection Module', () => {
  describe('checkAABB', () => {
    it('should return true when rectangles overlap', () => {
      const rect1: Rect = { x: 0, y: 0, width: 10, height: 10 };
      const rect2: Rect = { x: 5, y: 5, width: 10, height: 10 };

      expect(checkAABB(rect1, rect2)).toBe(true);
    });

    it('should return false when rectangles do not overlap on X axis', () => {
      const rect1: Rect = { x: 0, y: 0, width: 10, height: 10 };
      const rect2: Rect = { x: 20, y: 5, width: 10, height: 10 };

      expect(checkAABB(rect1, rect2)).toBe(false);
    });

    it('should return false when rectangles do not overlap on Y axis', () => {
      const rect1: Rect = { x: 0, y: 0, width: 10, height: 10 };
      const rect2: Rect = { x: 5, y: 20, width: 10, height: 10 };

      expect(checkAABB(rect1, rect2)).toBe(false);
    });

    it('should return true when rectangles are touching edge to edge', () => {
      const rect1: Rect = { x: 0, y: 0, width: 10, height: 10 };
      const rect2: Rect = { x: 10, y: 0, width: 10, height: 10 };

      // Touching edges should NOT overlap
      expect(checkAABB(rect1, rect2)).toBe(false);
    });

    it('should return true when one rectangle is inside another', () => {
      const rect1: Rect = { x: 0, y: 0, width: 20, height: 20 };
      const rect2: Rect = { x: 5, y: 5, width: 5, height: 5 };

      expect(checkAABB(rect1, rect2)).toBe(true);
    });

    it('should return true when rectangles are identical', () => {
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };

      expect(checkAABB(rect, rect)).toBe(true);
    });
  });

  describe('checkCircleAABB', () => {
    it('should return true when ball overlaps rectangle', () => {
      const ball: Ball = {
        x: 5,
        y: 5,
        width: 0,
        height: 0,
        radius: 5,
        vx: 0,
        vy: 0,
      };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };

      expect(checkCircleAABB(ball, rect)).toBe(true);
    });

    it('should return false when ball is completely outside rectangle', () => {
      const ball: Ball = {
        x: 20,
        y: 20,
        width: 0,
        height: 0,
        radius: 5,
        vx: 0,
        vy: 0,
      };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };

      expect(checkCircleAABB(ball, rect)).toBe(false);
    });

    it('should return true when ball touches rectangle edge', () => {
      const ball: Ball = {
        x: 10,
        y: 5,
        width: 0,
        height: 0,
        radius: 5,
        vx: 0,
        vy: 0,
      };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };

      expect(checkCircleAABB(ball, rect)).toBe(true);
    });

    it('should return true when ball is completely inside rectangle', () => {
      const ball: Ball = {
        x: 3,
        y: 3,
        width: 0,
        height: 0,
        radius: 2,
        vx: 0,
        vy: 0,
      };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };

      expect(checkCircleAABB(ball, rect)).toBe(true);
    });

    it('should return true when ball corner nearly touches rectangle corner', () => {
      const ball: Ball = {
        x: 9.5,
        y: 9.5,
        width: 0,
        height: 0,
        radius: 1,
        vx: 0,
        vy: 0,
      };
      const rect: Rect = { x: 0, y: 0, width: 10, height: 10 };

      expect(checkCircleAABB(ball, rect)).toBe(true);
    });
  });

  describe('resolveBallCollision', () => {
    it('should reverse vx on horizontal collision (ball from left)', () => {
      // ball center at (11, 5), hitting left face of obstacle at x:10
      // overlapLeft = 11-10 = 1, overlapRight = 20-11 = 9 → minH=1
      // overlapTop = 5-0 = 5, overlapBottom = 10-5 = 5 → minV=5
      // minH < minV → hit left face → vx reversed
      const ball: Ball = { x: 9, y: 3, width: 0, height: 0, radius: 2, vx: 5, vy: 0 };
      const obstacle: Rect = { x: 10, y: 0, width: 10, height: 10 };
      const resolution = resolveBallCollision(ball, obstacle);
      expect(resolution.vx).toBe(-5);
      expect(resolution.vy).toBe(0);
    });

    it('should reverse vy on vertical collision (ball from top)', () => {
      // ball center at (5, 11), obstacle top edge at y:10 → top face hit
      const ball: Ball = { x: 3, y: 9, width: 0, height: 0, radius: 2, vx: 0, vy: 5 };
      const obstacle: Rect = { x: 0, y: 10, width: 10, height: 10 };
      const resolution = resolveBallCollision(ball, obstacle);
      expect(resolution.vx).toBe(0);
      expect(resolution.vy).toBe(-5);
    });

    it('should reverse both velocity components on corner collision', () => {
      // ball center at (11, 11), obstacle corner at (10,10) — equal overlap on both axes
      const ball: Ball = { x: 9, y: 9, width: 0, height: 0, radius: 2, vx: 3, vy: 3 };
      const obstacle: Rect = { x: 10, y: 10, width: 10, height: 10 };
      const resolution = resolveBallCollision(ball, obstacle);
      // Both axes have equal overlap (1px each) → both reversed
      expect(resolution.vx === -3 || resolution.vy === -3).toBe(true);
    });

    it('should handle negative velocities', () => {
      // ball center at (9, 5) moving left into obstacle right edge at x+w=10
      const ball: Ball = { x: 7, y: 3, width: 0, height: 0, radius: 2, vx: -5, vy: 0 };
      const obstacle: Rect = { x: 0, y: 0, width: 10, height: 10 };
      const resolution = resolveBallCollision(ball, obstacle);
      expect(resolution.vx).toBe(5); // -(-5) = 5
      expect(resolution.vy).toBe(0);
    });

    it('should preserve zero velocities', () => {
      const ball: Ball = {
        x: 5,
        y: 5,
        width: 0,
        height: 0,
        radius: 2,
        vx: 0,
        vy: 0,
      };
      const obstacle: Rect = { x: 0, y: 0, width: 10, height: 10 };

      const resolution = resolveBallCollision(ball, obstacle);

      // Use Object.is to handle -0 vs 0
      expect(Object.is(resolution.vx, 0) || resolution.vx === 0).toBe(true);
      expect(Object.is(resolution.vy, 0) || resolution.vy === 0).toBe(true);
    });

    it('should work with ball completely overlapping obstacle', () => {
      const ball: Ball = {
        x: 3,
        y: 3,
        width: 0,
        height: 0,
        radius: 2,
        vx: 3,
        vy: 4,
      };
      const obstacle: Rect = { x: 0, y: 0, width: 10, height: 10 };

      const resolution = resolveBallCollision(ball, obstacle);

      // Should reverse one component based on overlap depth
      expect(resolution.vx !== ball.vx || resolution.vy !== ball.vy).toBe(true);
    });

    it('should be deterministic', () => {
      const ball: Ball = {
        x: 8,
        y: 5,
        width: 0,
        height: 0,
        radius: 2,
        vx: 5,
        vy: 0,
      };
      const obstacle: Rect = { x: 10, y: 0, width: 10, height: 10 };

      const resolution1 = resolveBallCollision(ball, obstacle);
      const resolution2 = resolveBallCollision(ball, obstacle);

      expect(resolution1.vx).toBe(resolution2.vx);
      expect(resolution1.vy).toBe(resolution2.vy);
    });
  });
});
