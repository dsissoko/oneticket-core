/**
 * Unit Tests for LocalStorageRepository
 *
 * Tests CRUD operations, error handling, and data persistence.
 */

import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { LocalStorageRepository } from './LocalStorageRepository';
import type { JournalEntry } from '../domain/Entry';

describe('LocalStorageRepository', () => {
  let repository: LocalStorageRepository;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    repository = new LocalStorageRepository();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAll', () => {
    it('should return empty array when no entries exist', async () => {
      const entries = await repository.getAll();
      expect(entries).toEqual([]);
    });

    it('should return all stored entries', async () => {
      // Create two entries
      const entry1 = await repository.create({ date: '2026-05-28', text: 'First entry' });
      const entry2 = await repository.create({ date: '2026-05-27', text: 'Second entry' });

      const entries = await repository.getAll();
      expect(entries).toHaveLength(2);
      expect(entries.map((e) => e.id)).toContain(entry1.id);
      expect(entries.map((e) => e.id)).toContain(entry2.id);
    });

    it('should return empty array if stored data is invalid JSON', async () => {
      localStorage.setItem('journal_entries', 'invalid json {]');
      const entries = await repository.getAll();
      expect(entries).toEqual([]);
    });

    it('should skip invalid entries but return valid ones', async () => {
      const validEntry = await repository.create({ date: '2026-05-28', text: 'Valid' });
      // Manually add invalid entry to localStorage
      const data = JSON.parse(localStorage.getItem('journal_entries') || '[]');
      data.push({ id: 'invalid' }); // Missing required fields
      localStorage.setItem('journal_entries', JSON.stringify(data));

      const entries = await repository.getAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe(validEntry.id);
    });
  });

  describe('getById', () => {
    it('should return entry by ID', async () => {
      const created = await repository.create({ date: '2026-05-28', text: 'Test entry' });
      const retrieved = await repository.getById(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.text).toBe('Test entry');
    });

    it('should return null for non-existent ID', async () => {
      const retrieved = await repository.getById('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('create', () => {
    it('should create entry with generated ID and timestamps', async () => {
      const entry = await repository.create({ date: '2026-05-28', text: 'New entry' });

      expect(entry.id).toBeDefined();
      expect(entry.id).toMatch(/^[0-9a-f-]+$/i); // UUID format
      expect(entry.date).toBe('2026-05-28');
      expect(entry.text).toBe('New entry');
      expect(entry.createdAt).toBeDefined();
      expect(entry.updatedAt).toBeDefined();
      expect(entry.createdAt).toBe(entry.updatedAt);
    });

    it('should persist entry to localStorage', async () => {
      const entry = await repository.create({ date: '2026-05-28', text: 'Test' });

      const stored = JSON.parse(localStorage.getItem('journal_entries') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(entry.id);
    });

    it('should throw error for missing date', async () => {
      await expect(
        repository.create({ date: '', text: 'Test' } as any),
      ).rejects.toThrow();
    });

    it('should throw error for missing text', async () => {
      await expect(
        repository.create({ date: '2026-05-28', text: '' } as any),
      ).rejects.toThrow();
    });

    it('should throw error for invalid date format', async () => {
      await expect(
        repository.create({ date: '05/28/2026', text: 'Test' }),
      ).rejects.toThrow();
    });

    it('should throw error for future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];

      await expect(
        repository.create({ date: dateStr, text: 'Test' }),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
  it('should update entry text', async () => {
    const created = await repository.create({ date: '2026-05-28', text: 'Original' });
    
    // Wait a bit to ensure timestamp changes
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    const updated = await repository.update(created.id, { text: 'Updated' });

    expect(updated.text).toBe('Updated');
    expect(updated.createdAt).toBe(created.createdAt); // immutable
    expect(updated.updatedAt).not.toBe(created.updatedAt); // changed
  });

    it('should update entry date', async () => {
      const created = await repository.create({ date: '2026-05-28', text: 'Test' });
      const updated = await repository.update(created.id, { date: '2026-05-27' });

      expect(updated.date).toBe('2026-05-27');
    });

  it('should preserve createdAt on update', async () => {
    const created = await repository.create({ date: '2026-05-28', text: 'Test' });
    const originalCreatedAt = created.createdAt;

    // Wait a bit to ensure timestamp changes
    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = await repository.update(created.id, { text: 'Changed' });

    expect(updated.createdAt).toBe(originalCreatedAt);
  });

    it('should throw error for non-existent ID', async () => {
      await expect(
        repository.update('non-existent-id', { text: 'Updated' }),
      ).rejects.toThrow();
    });

    it('should throw error for invalid date', async () => {
      const created = await repository.create({ date: '2026-05-28', text: 'Test' });

      await expect(
        repository.update(created.id, { date: 'invalid' }),
      ).rejects.toThrow();
    });

    it('should throw error for empty text', async () => {
      const created = await repository.create({ date: '2026-05-28', text: 'Test' });

      await expect(
        repository.update(created.id, { text: '' }),
      ).rejects.toThrow();
    });

    it('should persist updates to localStorage', async () => {
      const created = await repository.create({ date: '2026-05-28', text: 'Original' });
      await repository.update(created.id, { text: 'Updated' });

      const stored = JSON.parse(localStorage.getItem('journal_entries') || '[]');
      const storedEntry = stored[0];
      expect(storedEntry.text).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete entry from repository', async () => {
      const entry1 = await repository.create({ date: '2026-05-28', text: 'Entry 1' });
      const entry2 = await repository.create({ date: '2026-05-27', text: 'Entry 2' });

      await repository.delete(entry1.id);

      const remaining = await repository.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(entry2.id);
    });

    it('should persist deletion to localStorage', async () => {
      const entry = await repository.create({ date: '2026-05-28', text: 'To delete' });
      await repository.delete(entry.id);

      const stored = JSON.parse(localStorage.getItem('journal_entries') || '[]');
      expect(stored).toHaveLength(0);
    });

    it('should throw error for non-existent ID', async () => {
      await expect(repository.delete('non-existent-id')).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should create entry in less than 50ms', async () => {
      const start = performance.now();
      await repository.create({ date: '2026-05-28', text: 'Performance test' });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should read all entries (1000 entries) in less than 50ms', async () => {
      // Create 1000 entries
      for (let i = 0; i < 1000; i++) {
        await repository.create({
          date: '2026-05-28',
          text: `Entry ${i}`,
        });
      }

      const start = performance.now();
      const entries = await repository.getAll();
      const duration = performance.now() - start;

      expect(entries).toHaveLength(1000);
      expect(duration).toBeLessThan(50);
    });

    it('should update entry in less than 50ms', async () => {
      const entry = await repository.create({ date: '2026-05-28', text: 'Original' });

      const start = performance.now();
      await repository.update(entry.id, { text: 'Updated' });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should delete entry in less than 50ms', async () => {
      const entry = await repository.create({ date: '2026-05-28', text: 'To delete' });

      const start = performance.now();
      await repository.delete(entry.id);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
