import { describe, it, expect, vi } from 'vitest';
import {
  generateUUID,
  createThought,
  validateThought,
  validateThoughts,
} from './thoughtModel';
import { Thought } from './types';

describe('thoughtModel', () => {
  describe('generateUUID', () => {
    it('generates a valid UUID format', () => {
      const uuid = generateUUID();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('generates unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('createThought', () => {
    it('creates a thought with required fields', () => {
      const thought = createThought('Test Title', 'Test Content');
      expect(thought.title).toBe('Test Title');
      expect(thought.content).toBe('Test Content');
      expect(thought.tags).toEqual([]);
    });

    it('includes id and createdAt', () => {
      const before = Date.now();
      const thought = createThought('Title', 'Content');
      const after = Date.now();

      expect(thought.id).toBeDefined();
      expect(typeof thought.id).toBe('string');
      expect(thought.id.length).toBeGreaterThan(0);
      expect(thought.createdAt).toBeGreaterThanOrEqual(before);
      expect(thought.createdAt).toBeLessThanOrEqual(after);
    });

    it('includes provided tags', () => {
      const thought = createThought('Title', 'Content', ['tag1', 'tag2']);
      expect(thought.tags).toEqual(['tag1', 'tag2']);
    });

    it('makes the thought immutable', () => {
      const thought = createThought('Title', 'Content', ['tag1']);
      expect(() => {
        (thought as any).title = 'New Title';
      }).toThrow();
      expect(() => {
        (thought as any).id = 'new-id';
      }).toThrow();
      expect(() => {
        thought.tags.push('tag2');
      }).toThrow();
    });

    it('stores empty tags array by default', () => {
      const thought = createThought('Title', 'Content');
      expect(Array.isArray(thought.tags)).toBe(true);
      expect(thought.tags.length).toBe(0);
    });
  });

  describe('validateThought', () => {
    let validThought: Thought;

    beforeEach(() => {
      validThought = createThought('Title', 'Content', ['tag1']);
    });

    it('validates a correct thought', () => {
      expect(validateThought(validThought)).toBe(true);
    });

    it('rejects null or undefined', () => {
      expect(validateThought(null)).toBe(false);
      expect(validateThought(undefined)).toBe(false);
    });

    it('rejects non-objects', () => {
      expect(validateThought('string')).toBe(false);
      expect(validateThought(123)).toBe(false);
      expect(validateThought([])).toBe(false);
    });

    it('rejects objects with missing required fields', () => {
      expect(validateThought({ title: 'Title', content: 'Content' })).toBe(
        false
      );
      expect(validateThought({ id: 'id', content: 'Content' })).toBe(false);
      expect(validateThought({ id: 'id', title: 'Title' })).toBe(false);
      expect(validateThought({ id: 'id', title: 'Title', content: 'Content' })).toBe(
        false
      ); // missing createdAt
    });

    it('rejects invalid field types', () => {
      expect(
        validateThought({
          ...validThought,
          id: 123,
        })
      ).toBe(false);
      expect(
        validateThought({
          ...validThought,
          title: 123,
        })
      ).toBe(false);
      expect(
        validateThought({
          ...validThought,
          createdAt: 'string',
        })
      ).toBe(false);
      expect(
        validateThought({
          ...validThought,
          tags: 'not-array',
        })
      ).toBe(false);
    });

    it('rejects non-string tags in array', () => {
      expect(
        validateThought({
          ...validThought,
          tags: ['tag1', 123],
        })
      ).toBe(false);
    });

    it('accepts valid thoughts with empty tags', () => {
      expect(validateThought({ ...validThought, tags: [] })).toBe(true);
    });

    it('rejects createdAt <= 0', () => {
      expect(validateThought({ ...validThought, createdAt: 0 })).toBe(false);
      expect(validateThought({ ...validThought, createdAt: -1 })).toBe(false);
    });

    it('rejects empty id or title', () => {
      expect(validateThought({ ...validThought, id: '' })).toBe(false);
      expect(validateThought({ ...validThought, title: '' })).toBe(false);
    });
  });

  describe('validateThoughts', () => {
    it('validates an array of valid thoughts', () => {
      const thoughts = [
        createThought('Title 1', 'Content 1'),
        createThought('Title 2', 'Content 2', ['tag1']),
      ];
      expect(validateThoughts(thoughts)).toBe(true);
    });

    it('validates an empty array', () => {
      expect(validateThoughts([])).toBe(true);
    });

    it('rejects non-arrays', () => {
      expect(validateThoughts(null)).toBe(false);
      expect(validateThoughts('string')).toBe(false);
      expect(validateThoughts({})).toBe(false);
    });

    it('rejects if any item is invalid', () => {
      const invalid = [
        createThought('Title', 'Content'),
        { title: 'Missing required fields' },
      ];
      expect(validateThoughts(invalid)).toBe(false);
    });
  });
});
