import { describe, it, expect, beforeEach } from 'vitest';
import { Thought, createThought, validateThought } from './thoughtModel';

describe('thoughtModel', () => {
  describe('createThought', () => {
    it('creates a thought with auto-generated UUID', () => {
      const thought = createThought('Test Title', 'Test Content', []);

      expect(thought.id).toBeTruthy();
      // UUID format: 8-4-4-4-12 hex digits separated by hyphens
      expect(thought.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('generates different UUIDs for multiple calls', () => {
      const thought1 = createThought('Title 1', 'Content 1', []);
      const thought2 = createThought('Title 2', 'Content 2', []);

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('creates a thought with correct title and content', () => {
      const title = 'Morning Reflection';
      const content = 'Had a great start to the day';

      const thought = createThought(title, content, []);

      expect(thought.title).toBe(title);
      expect(thought.content).toBe(content);
    });

    it('sets createdAt to current timestamp in milliseconds', () => {
      const beforeTime = Date.now();
      const thought = createThought('Test', 'Test', []);
      const afterTime = Date.now();

      expect(thought.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(thought.createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('preserves tags array passed in', () => {
      const tags = ['personal', 'morning', 'reflection'];
      const thought = createThought('Test', 'Test', tags);

      expect(thought.tags).toEqual(tags);
    });

    it('defaults to empty tags array when none provided', () => {
      const thought = createThought('Test', 'Test');

      expect(thought.tags).toEqual([]);
      expect(Array.isArray(thought.tags)).toBe(true);
    });

    it('handles empty tags array', () => {
      const thought = createThought('Test', 'Test', []);

      expect(thought.tags).toEqual([]);
    });

    it('handles single tag', () => {
      const thought = createThought('Test', 'Test', ['work']);

      expect(thought.tags).toEqual(['work']);
    });

    it('returns an object with all required Thought properties', () => {
      const thought = createThought('Title', 'Content', ['tag1']);

      expect(thought).toHaveProperty('id');
      expect(thought).toHaveProperty('title');
      expect(thought).toHaveProperty('content');
      expect(thought).toHaveProperty('createdAt');
      expect(thought).toHaveProperty('tags');
    });
  });

  describe('immutability', () => {
    it('creates an object that cannot be easily mutated', () => {
      const thought = createThought('Original', 'Content', []);
      const originalId = thought.id;

      // Attempting to mutate should not change the original reference properties
      const mutated = { ...thought, title: 'Modified' };

      expect(thought.title).toBe('Original');
      expect(thought.id).toBe(originalId);
      expect(mutated.title).toBe('Modified');
      expect(mutated.id).toBe(originalId);
    });

    it('timestamps are immutable after creation', async () => {
      const thought = createThought('Test', 'Content', []);
      const originalTimestamp = thought.createdAt;

      // Wait a bit and verify timestamp hasn't changed
      await new Promise((resolve) => setTimeout(resolve, 1));
      const futureThought = createThought('Test', 'Content', []);

      expect(thought.createdAt).toBe(originalTimestamp);
      expect(futureThought.createdAt).toBeGreaterThanOrEqual(originalTimestamp);
    });

    it('tags array is independent between thoughts', () => {
      const tags1 = ['personal'];
      const tags2 = ['work'];

      const thought1 = createThought('Test1', 'Content1', tags1);
      const thought2 = createThought('Test2', 'Content2', tags2);

      expect(thought1.tags).toEqual(['personal']);
      expect(thought2.tags).toEqual(['work']);
    });
  });

  describe('validateThought', () => {
    let validThought: Thought;

    beforeEach(() => {
      validThought = createThought('Valid Title', 'Valid Content', ['tag1', 'tag2']);
    });

    it('returns true for a valid thought', () => {
      expect(validateThought(validThought)).toBe(true);
    });

    it('returns true for a thought with empty tags', () => {
      const thought = createThought('Title', 'Content', []);
      expect(validateThought(thought)).toBe(true);
    });

    it('returns false when id is missing', () => {
      const invalid = { title: 'Test', content: 'Content', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when title is missing', () => {
      const invalid = { id: 'uuid', content: 'Content', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when content is missing', () => {
      const invalid = { id: 'uuid', title: 'Title', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when createdAt is missing', () => {
      const invalid = { id: 'uuid', title: 'Title', content: 'Content', tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when tags is missing', () => {
      const invalid = { id: 'uuid', title: 'Title', content: 'Content', createdAt: 123456 };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when id is empty string', () => {
      const invalid = { id: '', title: 'Title', content: 'Content', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when id is whitespace only', () => {
      const invalid = { id: '   ', title: 'Title', content: 'Content', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when title is empty string', () => {
      const invalid = { id: 'uuid', title: '', content: 'Content', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when title is whitespace only', () => {
      const invalid = { id: 'uuid', title: '   ', content: 'Content', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when content is empty string', () => {
      const invalid = { id: 'uuid', title: 'Title', content: '', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when content is whitespace only', () => {
      const invalid = { id: 'uuid', title: 'Title', content: '   ', createdAt: 123456, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when createdAt is not a number', () => {
      const invalid = { id: 'uuid', title: 'Title', content: 'Content', createdAt: 'not-a-number', tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when createdAt is negative', () => {
      const invalid = { id: 'uuid', title: 'Title', content: 'Content', createdAt: -1, tags: [] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when tags is not an array', () => {
      const invalid = { id: 'uuid', title: 'Title', content: 'Content', createdAt: 123456, tags: 'not-an-array' };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when tags contains non-string elements', () => {
      const invalid = { id: 'uuid', title: 'Title', content: 'Content', createdAt: 123456, tags: ['tag1', 123] };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when tags contains mixed types', () => {
      const invalid = {
        id: 'uuid',
        title: 'Title',
        content: 'Content',
        createdAt: 123456,
        tags: ['tag1', null, 'tag2'],
      };
      expect(validateThought(invalid)).toBe(false);
    });

    it('returns false when input is null', () => {
      expect(validateThought(null)).toBe(false);
    });

    it('returns false when input is undefined', () => {
      expect(validateThought(undefined)).toBe(false);
    });

    it('returns false when input is a string', () => {
      expect(validateThought('not an object')).toBe(false);
    });

    it('returns false when input is a number', () => {
      expect(validateThought(123)).toBe(false);
    });

    it('returns false when input is an array', () => {
      expect(validateThought([])).toBe(false);
    });

    it('returns true for thought with special characters in content', () => {
      const thought = { id: 'uuid', title: 'Title', content: 'Content with @#$%^&*()', createdAt: 123456, tags: [] };
      expect(validateThought(thought)).toBe(true);
    });

    it('returns true for thought with unicode characters', () => {
      const thought = {
        id: 'uuid',
        title: 'Chinese Title 中文',
        content: 'Japanese Content 日本語',
        createdAt: 123456,
        tags: ['emoji-😀'],
      };
      expect(validateThought(thought)).toBe(true);
    });

    it('returns true for thought with very long strings', () => {
      const longString = 'a'.repeat(10000);
      const thought = { id: 'uuid', title: longString, content: longString, createdAt: 123456, tags: [] };
      expect(validateThought(thought)).toBe(true);
    });

    it('returns true for thought with many tags', () => {
      const manyTags = Array.from({ length: 100 }, (_, i) => `tag${i}`);
      const thought = { id: 'uuid', title: 'Title', content: 'Content', createdAt: 123456, tags: manyTags };
      expect(validateThought(thought)).toBe(true);
    });

    it('correctly distinguishes valid from invalid in batch validation', () => {
      const valid1 = createThought('Title1', 'Content1', ['tag1']);
      const valid2 = createThought('Title2', 'Content2', []);
      const invalid1 = { id: 'uuid', title: '', content: 'Content', createdAt: 123456, tags: [] };
      const invalid2 = { id: 'uuid', title: 'Title', content: 'Content', createdAt: 'not-number', tags: [] };

      expect(validateThought(valid1)).toBe(true);
      expect(validateThought(valid2)).toBe(true);
      expect(validateThought(invalid1)).toBe(false);
      expect(validateThought(invalid2)).toBe(false);
    });
  });

  describe('type safety', () => {
    it('has proper TypeScript type inference', () => {
      const thought = createThought('Title', 'Content', ['tag']);

      // These should compile without errors
      const id: string = thought.id;
      const title: string = thought.title;
      const content: string = thought.content;
      const createdAt: number = thought.createdAt;
      const tags: string[] = thought.tags;

      expect(typeof id).toBe('string');
      expect(typeof title).toBe('string');
      expect(typeof content).toBe('string');
      expect(typeof createdAt).toBe('number');
      expect(Array.isArray(tags)).toBe(true);
    });

    it('type guard works with conditional logic', () => {
      const data: unknown = createThought('Title', 'Content', []);

      if (validateThought(data)) {
        // Inside this block, TypeScript knows data is a Thought
        const id: string = data.id;
        const title: string = data.title;
        expect(typeof id).toBe('string');
        expect(typeof title).toBe('string');
      }
    });
  });
});
