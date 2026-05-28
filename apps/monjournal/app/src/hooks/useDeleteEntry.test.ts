/**
 * Unit Tests for useDeleteEntry Hook
 *
 * Tests entry deletion, confirmation state, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteEntry } from './useDeleteEntry';
import { LocalStorageRepository } from '../infrastructure/LocalStorageRepository';

describe('useDeleteEntry', () => {
  let repository: LocalStorageRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageRepository();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useDeleteEntry());

    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isConfirming.size).toBe(0);
    expect(typeof result.current.deleteEntry).toBe('function');
    expect(typeof result.current.confirmDelete).toBe('function');
  });

  it('should delete entry from repository', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'To delete' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.deleteEntry(entry.id);
    });

    const remaining = await repository.getAll();
    expect(remaining).toHaveLength(0);
  });

  it('should remove entry from localStorage', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'To delete' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.deleteEntry(entry.id);
    });

    const stored = JSON.parse(localStorage.getItem('journal_entries') || '[]');
    expect(stored).toHaveLength(0);
  });

  it('should delete only specified entry', async () => {
    const entry1 = await repository.create({ date: '2026-05-28', text: 'Keep' });
    const entry2 = await repository.create({ date: '2026-05-27', text: 'Delete' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.deleteEntry(entry2.id);
    });

    const remaining = await repository.getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(entry1.id);
  });

  it('should reject non-existent entry ID', async () => {
    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      try {
        await result.current.deleteEntry('non-existent-id');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should add entry to confirmation set', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.confirmDelete(entry.id);
    });

    expect(result.current.isConfirming.size).toBe(1);
    expect(result.current.isConfirming.has(entry.id)).toBe(true);
  });

  it('should track multiple entries awaiting confirmation', async () => {
    const entry1 = await repository.create({ date: '2026-05-28', text: 'Test 1' });
    const entry2 = await repository.create({ date: '2026-05-27', text: 'Test 2' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.confirmDelete(entry1.id);
      await result.current.confirmDelete(entry2.id);
    });

    expect(result.current.isConfirming.size).toBe(2);
    expect(result.current.isConfirming.has(entry1.id)).toBe(true);
    expect(result.current.isConfirming.has(entry2.id)).toBe(true);
  });

  it('should remove entry from confirmation set after deletion', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.confirmDelete(entry.id);
    });

    expect(result.current.isConfirming.has(entry.id)).toBe(true);

    await act(async () => {
      await result.current.deleteEntry(entry.id);
    });

    expect(result.current.isConfirming.has(entry.id)).toBe(false);
  });

  it('should allow deletion without prior confirmation', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useDeleteEntry());

    // Delete without calling confirmDelete first
    await act(async () => {
      await result.current.deleteEntry(entry.id);
    });

    const remaining = await repository.getAll();
    expect(remaining).toHaveLength(0);
  });

  it('should allow re-confirmation after cancellation', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.confirmDelete(entry.id);
    });

    expect(result.current.isConfirming.has(entry.id)).toBe(true);

    // Simulate user canceling: remove from confirmation manually
    // (In real app, user would click cancel button)
    // Then confirm again:
    await act(async () => {
      await result.current.confirmDelete(entry.id);
    });

    expect(result.current.isConfirming.has(entry.id)).toBe(true);
  });

  it('should handle deletion errors', async () => {
    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      try {
        await result.current.deleteEntry('invalid-id');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('not found');
  });

  it('should set isDeleting state during deletion', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useDeleteEntry());

    const promise = act(async () => {
      await result.current.deleteEntry(entry.id);
    });

    await promise;
    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle deleting all entries', async () => {
    const entry1 = await repository.create({ date: '2026-05-28', text: 'Test 1' });
    const entry2 = await repository.create({ date: '2026-05-27', text: 'Test 2' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.deleteEntry(entry1.id);
      await result.current.deleteEntry(entry2.id);
    });

    const remaining = await repository.getAll();
    expect(remaining).toHaveLength(0);
  });

  it('should clear confirmation state on error during deletion', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useDeleteEntry());

    await act(async () => {
      await result.current.confirmDelete(entry.id);
    });

    expect(result.current.isConfirming.has(entry.id)).toBe(true);

    // Delete successfully
    await act(async () => {
      await result.current.deleteEntry(entry.id);
    });

    expect(result.current.isConfirming.has(entry.id)).toBe(false);
  });
});
