/**
 * Unit Tests for useEditEntry Hook
 *
 * Tests entry editing, validation, timestamp preservation, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditEntry } from './useEditEntry';
import type { JournalEntry } from '../domain/Entry';
import { LocalStorageRepository } from '../infrastructure/LocalStorageRepository';

describe('useEditEntry', () => {
  let repository: LocalStorageRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageRepository();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useEditEntry());

    expect(result.current.isEditing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.editEntry).toBe('function');
  });

  it('should update entry text', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Original' });

    const { result } = renderHook(() => useEditEntry());

    let updatedEntry: JournalEntry | undefined;
    await act(async () => {
      updatedEntry = await result.current.editEntry(entry.id, {
        text: 'Updated',
      });
    });

    expect(updatedEntry?.text).toBe('Updated');
  });

  it('should update entry date', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useEditEntry());

    let updatedEntry: JournalEntry | undefined;
    await act(async () => {
      updatedEntry = await result.current.editEntry(entry.id, {
        date: '2026-05-27',
      });
    });

    expect(updatedEntry?.date).toBe('2026-05-27');
  });

  it('should update both date and text', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Original' });

    const { result } = renderHook(() => useEditEntry());

    let updatedEntry: JournalEntry | undefined;
    await act(async () => {
      updatedEntry = await result.current.editEntry(entry.id, {
        date: '2026-05-27',
        text: 'Updated',
      });
    });

    expect(updatedEntry?.date).toBe('2026-05-27');
    expect(updatedEntry?.text).toBe('Updated');
  });

  it('should preserve createdAt timestamp', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Original' });
    const originalCreatedAt = entry.createdAt;

    const { result } = renderHook(() => useEditEntry());

    let updatedEntry: JournalEntry | undefined;
    await act(async () => {
      updatedEntry = await result.current.editEntry(entry.id, {
        text: 'Updated',
      });
    });

    expect(updatedEntry?.createdAt).toBe(originalCreatedAt);
  });

  it('should update updatedAt timestamp', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Original' });
    const originalUpdatedAt = entry.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    const { result } = renderHook(() => useEditEntry());

    let updatedEntry: JournalEntry | undefined;
    await act(async () => {
      updatedEntry = await result.current.editEntry(entry.id, {
        text: 'Updated',
      });
    });

    expect(updatedEntry?.updatedAt).not.toBe(originalUpdatedAt);
  });

  it('should reject invalid date format', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useEditEntry());

    await act(async () => {
      try {
        await result.current.editEntry(entry.id, {
          date: 'invalid-date',
        });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should reject empty text', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useEditEntry());

    await act(async () => {
      try {
        await result.current.editEntry(entry.id, {
          text: '',
        });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should reject non-existent entry ID', async () => {
    const { result } = renderHook(() => useEditEntry());

    await act(async () => {
      try {
        await result.current.editEntry('non-existent-id', {
          text: 'Updated',
        });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should persist updates to localStorage', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Original' });

    const { result } = renderHook(() => useEditEntry());

    await act(async () => {
      await result.current.editEntry(entry.id, {
        text: 'Updated',
      });
    });

    const stored = JSON.parse(localStorage.getItem('journal_entries') || '[]');
    expect(stored[0].text).toBe('Updated');
  });

  it('should reject empty updates', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useEditEntry());

    await act(async () => {
      try {
        await result.current.editEntry(entry.id, {});
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should allow updating only date', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

    const { result } = renderHook(() => useEditEntry());

    let updatedEntry: JournalEntry | undefined;
    await act(async () => {
      updatedEntry = await result.current.editEntry(entry.id, {
        date: '2026-05-27',
      });
    });

    expect(updatedEntry?.date).toBe('2026-05-27');
    expect(updatedEntry?.text).toBe('Test'); // Unchanged
  });

  it('should maintain other entry properties during edit', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Original' });
    const originalId = entry.id;

    const { result } = renderHook(() => useEditEntry());

    let updatedEntry: JournalEntry | undefined;
    await act(async () => {
      updatedEntry = await result.current.editEntry(entry.id, {
        text: 'Updated',
      });
    });

    expect(updatedEntry?.id).toBe(originalId); // ID unchanged
  });

  it('should handle multiple edits to same entry', async () => {
    const entry = await repository.create({ date: '2026-05-28', text: 'Original' });

    const { result } = renderHook(() => useEditEntry());

    let entry1: JournalEntry | undefined;
    let entry2: JournalEntry | undefined;
    await act(async () => {
      entry1 = await result.current.editEntry(entry.id, {
        text: 'First update',
      });
      entry2 = await result.current.editEntry(entry.id, {
        text: 'Second update',
      });
    });

    expect(entry1?.text).toBe('First update');
    expect(entry2?.text).toBe('Second update');
    expect(entry2?.id).toBe(entry.id);
  });
});
