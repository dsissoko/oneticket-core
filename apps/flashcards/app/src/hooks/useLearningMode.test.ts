import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLearningMode } from './useLearningMode';

describe('useLearningMode', () => {
  describe('flip mode', () => {
    it('returns null display timing (immediate reveal)', () => {
      const { result } = renderHook(() => useLearningMode('flip'));
      expect(result.current.getDisplayTiming()).toBeNull();
    });

    it('recordResult returns neutral scheduling (no SR effect)', () => {
      const { result } = renderHook(() => useLearningMode('flip'));
      const scheduling = result.current.recordResult(true, 'card-1');
      expect(scheduling.nextReviewAt).toBeNull();
      expect(scheduling.interval).toBe(0);
      expect(scheduling.easeFactor).toBe(2.5);
    });

    it('recordResult with unknown returns same neutral values', () => {
      const { result } = renderHook(() => useLearningMode('flip'));
      const scheduling = result.current.recordResult(false, 'card-1');
      expect(scheduling.nextReviewAt).toBeNull();
      expect(scheduling.interval).toBe(0);
    });
  });

  describe('spaced-repetition mode', () => {
    it('returns null display timing (same as flip for initial display)', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      expect(result.current.getDisplayTiming()).toBeNull();
    });

    it('records known result with 30s interval and initial ease', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      const scheduling = result.current.recordResult(true, 'card-1');
      expect(scheduling.interval).toBe(30_000);
      expect(scheduling.easeFactor).toBe(2.5);
      expect(scheduling.nextReviewAt).toBeGreaterThan(Date.now());
    });

    it('records unknown result with shorter interval and lower ease', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      const scheduling = result.current.recordResult(false, 'card-1');
      expect(scheduling.interval).toBe(10_000);
      expect(scheduling.easeFactor).toBe(2.3); // 2.5 - 0.2
    });

    it('known result increases interval based on ease factor', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      // First known: 30s interval
      const first = result.current.recordResult(true, 'card-1');
      expect(first.interval).toBe(30_000);

      // Second known: interval * ease factor (30s * 2.6)
      const second = result.current.recordResult(true, 'card-1');
      expect(second.interval).toBe(78_000); // 30000 * 2.6 rounded
      expect(second.easeFactor).toBe(2.6);
    });

    it('unknown result decreases interval and ease', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      const first = result.current.recordResult(false, 'card-1');
      expect(first.interval).toBe(10_000);
      expect(first.easeFactor).toBe(2.3);

      // Second unknown: half of 10s with further ease reduction
      const second = result.current.recordResult(false, 'card-1');
      expect(second.interval).toBe(5_000);
      expect(second.easeFactor).toBe(2.1);
    });

    it('ease factor does not go below minimum 1.3', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      // Keep marking unknown to drive ease factor down
      let scheduling = result.current.recordResult(false, 'card-1');
      scheduling = result.current.recordResult(false, 'card-1');
      scheduling = result.current.recordResult(false, 'card-1');
      scheduling = result.current.recordResult(false, 'card-1');
      scheduling = result.current.recordResult(false, 'card-1');
      expect(scheduling.easeFactor).toBe(1.3);
    });

    it('ease factor does not exceed maximum 3.0', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      // Keep marking known to raise ease factor
      let scheduling = result.current.recordResult(true, 'card-1');
      scheduling = result.current.recordResult(true, 'card-1');
      scheduling = result.current.recordResult(true, 'card-1');
      scheduling = result.current.recordResult(true, 'card-1');
      scheduling = result.current.recordResult(true, 'card-1');
      expect(scheduling.easeFactor).toBe(3.0);
    });

    it('resets clear all card state', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      result.current.recordResult(true, 'card-1');
      result.current.recordResult(true, 'card-2');
      expect(result.current.recordResult(true, 'card-1').interval).toBe(78_000);

      act(() => {
        result.current.reset();
      });

      // After reset, card-1 should be treated as first occurrence again
      const afterReset = result.current.recordResult(true, 'card-1');
      expect(afterReset.interval).toBe(30_000);
    });

    it('different cards have independent scheduling', () => {
      const { result } = renderHook(() => useLearningMode('spaced-repetition'));
      result.current.recordResult(true, 'card-1');
      result.current.recordResult(false, 'card-2');

      // card-1 is now at 30s * 2.6 = 78s (after one known)
      // card-2 is at 10s (after one unknown)
      const card1Scheduling = result.current.recordResult(true, 'card-1');
      const card2Scheduling = result.current.recordResult(false, 'card-2');

      expect(card1Scheduling.interval).toBe(78_000);
      expect(card2Scheduling.interval).toBe(5_000); // half of 10s
    });
  });
});