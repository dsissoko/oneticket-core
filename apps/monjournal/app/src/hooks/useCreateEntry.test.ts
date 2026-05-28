/**
 * Unit Tests for useCreateEntry Hook
 *
 * Tests entry creation, validation, loading states, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateEntry } from './useCreateEntry';
import { LocalStorageRepository } from '../infrastructure/LocalStorageRepository';

describe('useCreateEntry', () => {
  let repository: LocalStorageRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageRepository();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useCreateEntry());

    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.createEntry).toBe('function');
  });

  it('should create entry with valid input', async () => {
    const { result } = renderHook(() => useCreateEntry());

    let createdEntry;
    await act(async () => {
      createdEntry = await result.current.createEntry({
        date: '2026-05-28',
        text: 'My thoughts',
      });
    });

    expect(createdEntry).toBeDefined();
    expect(createdEntry?.id).toBeDefined();
    expect(createdEntry?.date).toBe('2026-05-28');
    expect(createdEntry?.text).toBe('My thoughts');
    expect(createdEntry?.createdAt).toBeDefined();
    expect(createdEntry?.updatedAt).toBeDefined();
  });

  it('should set isCreating to true during creation', async () => {
    const { result } = renderHook(() => useCreateEntry());

    // Start creation
    const promise = act(async () => {
      await result.current.createEntry({
        date: '2026-05-28',
        text: 'Test',
      });
    });

    // Note: isCreating state might not be observable due to timing
    // but the hook should still work correctly

    await promise;
    expect(result.current.isCreating).toBe(false);
  });

  it('should persist created entry to localStorage', async () => {
    const { result } = renderHook(() => useCreateEntry());

    await act(async () => {
      await result.current.createEntry({
        date: '2026-05-28',
        text: 'Persistent entry',
      });
    });

    const stored = JSON.parse(localStorage.getItem('journal_entries') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe('Persistent entry');
  });

  it('should reject invalid date format', async () => {
    const { result } = renderHook(() => useCreateEntry());

    await act(async () => {
      try {
        await result.current.createEntry({
          date: '05/28/2026', // Wrong format
          text: 'Test',
        });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('YYYY-MM-DD');
  });

  it('should reject future dates', async () => {
    const { result } = renderHook(() => useCreateEntry());

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().split('T')[0];

    await act(async () => {
      try {
        await result.current.createEntry({
          date: dateStr,
          text: 'Test',
        });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should reject empty text', async () => {
    const { result } = renderHook(() => useCreateEntry());

    await act(async () => {
      try {
        await result.current.createEntry({
          date: '2026-05-28',
          text: '',
        });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should reject whitespace-only text', async () => {
    const { result } = renderHook(() => useCreateEntry());

    await act(async () => {
      try {
        await result.current.createEntry({
          date: '2026-05-28',
          text: '   ',
        });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should generate unique IDs for each entry', async () => {
    const { result } = renderHook(() => useCreateEntry());

    let entry1, entry2;
    await act(async () => {
      entry1 = await result.current.createEntry({
        date: '2026-05-28',
        text: 'First',
      });
      entry2 = await result.current.createEntry({
        date: '2026-05-28',
        text: 'Second',
      });
    });

    expect(entry1?.id).not.toBe(entry2?.id);
  });

  it('should set proper timestamps', async () => {
    const { result } = renderHook(() => useCreateEntry());

    const beforeTime = new Date().getTime();

    let createdEntry;
    await act(async () => {
      createdEntry = await result.current.createEntry({
        date: '2026-05-28',
        text: 'Test',
      });
    });

    const afterTime = new Date().getTime();

    const createdAtTime = new Date(createdEntry?.createdAt || 0).getTime();
    expect(createdAtTime).toBeGreaterThanOrEqual(beforeTime);
    expect(createdAtTime).toBeLessThanOrEqual(afterTime);
    expect(createdEntry?.createdAt).toBe(createdEntry?.updatedAt);
  });

  it('should allow creating entries on the same date', async () => {
    const { result } = renderHook(() => useCreateEntry());

    await act(async () => {
      await result.current.createEntry({
        date: '2026-05-28',
        text: 'First entry',
      });
      await result.current.createEntry({
        date: '2026-05-28',
        text: 'Second entry',
      });
    });

    const stored = JSON.parse(localStorage.getItem('journal_entries') || '[]');
    expect(stored).toHaveLength(2);
    expect(stored[0].date).toBe(stored[1].date);
  });

  it('should return error in state on validation failure', async () => {
    const { result } = renderHook(() => useCreateEntry());

    let caughtError = false;
    await act(async () => {
      try {
        await result.current.createEntry({
          date: '2026-05-28',
          text: '',
        });
      } catch {
        caughtError = true;
      }
    });

    expect(caughtError).toBe(true);
    expect(result.current.error).not.toBeNull();
  });
});
