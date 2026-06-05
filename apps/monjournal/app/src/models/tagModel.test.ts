import { describe, it, expect } from 'vitest';
import { getTagColor, deriveTags } from './tagModel';
import { COLORS } from '../utils/colorPalette';
import type { Thought } from './thoughtModel';

describe('tagModel', () => {
  describe('getTagColor', () => {
    it('should return a color from the palette', () => {
      const color = getTagColor('work');
      expect(COLORS).toContain(color);
    });

    it('should return the same color for the same tag name', () => {
      const color1 = getTagColor('work');
      const color2 = getTagColor('work');
      expect(color1).toBe(color2);
    });

    it('should return consistent colors across multiple calls', () => {
      const tagName = 'personal';
      const colors = [
        getTagColor(tagName),
        getTagColor(tagName),
        getTagColor(tagName),
      ];
      expect(colors[0]).toBe(colors[1]);
      expect(colors[1]).toBe(colors[2]);
    });

    it('should distribute different tags across the palette', () => {
      // Test that different starting characters likely get different colors
      const tags = ['apple', 'banana', 'cherry', 'date', 'egg', 'fig'];
      const colors = tags.map((tag) => getTagColor(tag));

      // We should have variety in the colors (not all the same)
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });

    it('should handle single character tag names', () => {
      const color = getTagColor('a');
      expect(COLORS).toContain(color);
    });

    it('should handle long tag names', () => {
      const color = getTagColor('this-is-a-very-long-tag-name');
      expect(COLORS).toContain(color);
    });

    it('should handle tag names with special characters', () => {
      const color = getTagColor('tag-with-special!@#chars');
      expect(COLORS).toContain(color);
    });

    it('should handle empty string with default color', () => {
      const color = getTagColor('');
      expect(color).toBe(COLORS[0]);
    });

    it('should use first character to determine color', () => {
      // Tags starting with same character should get same color
      const color1 = getTagColor('work');
      const color2 = getTagColor('wonderful');
      expect(color1).toBe(color2);
    });

    it('should handle tag names with spaces', () => {
      const color = getTagColor('my tag');
      expect(COLORS).toContain(color);
    });

    it('should be deterministic across sessions (simulated)', () => {
      // Simulate multiple "session" calls
      const sessions = 5;
      const colors: string[] = [];
      for (let i = 0; i < sessions; i++) {
        colors.push(getTagColor('urgent'));
      }
      // All should be identical
      expect(new Set(colors).size).toBe(1);
    });
  });

  describe('deriveTags', () => {
    it('should return empty array for empty thoughts', () => {
      const tags = deriveTags([]);
      expect(tags).toEqual([]);
    });

    it('should return empty array when no thoughts have tags', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought without tags',
          content: 'Content',
          createdAt: 123456,
          tags: [],
        },
        {
          id: '2',
          title: 'Another thought',
          content: 'More content',
          createdAt: 123457,
          tags: [],
        },
      ];
      const tags = deriveTags(thoughts);
      expect(tags).toEqual([]);
    });

    it('should derive unique tags from thoughts', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'First thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['work', 'urgent'],
        },
        {
          id: '2',
          title: 'Second thought',
          content: 'More content',
          createdAt: 123457,
          tags: ['personal', 'work'],
        },
      ];
      const tags = deriveTags(thoughts);

      expect(tags).toHaveLength(3);
      const tagNames = tags.map((t) => t.name);
      expect(tagNames).toContain('work');
      expect(tagNames).toContain('urgent');
      expect(tagNames).toContain('personal');
    });

    it('should assign colors to derived tags', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['project', 'deadline'],
        },
      ];
      const tags = deriveTags(thoughts);

      tags.forEach((tag) => {
        expect(tag.color).toBeDefined();
        expect(typeof tag.color).toBe('string');
        expect(COLORS).toContain(tag.color);
      });
    });

    it('should not duplicate tags', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'First',
          content: 'Content',
          createdAt: 123456,
          tags: ['work', 'work', 'work'],
        },
        {
          id: '2',
          title: 'Second',
          content: 'Content',
          createdAt: 123457,
          tags: ['work'],
        },
      ];
      const tags = deriveTags(thoughts);

      // Should only have one 'work' tag despite multiple occurrences
      const workTags = tags.filter((t) => t.name === 'work');
      expect(workTags).toHaveLength(1);
      expect(tags.length).toBe(1);
    });

    it('should sort tags alphabetically for consistent ordering', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['zebra', 'apple', 'monkey', 'banana'],
        },
      ];
      const tags = deriveTags(thoughts);
      const tagNames = tags.map((t) => t.name);

      expect(tagNames).toEqual(['apple', 'banana', 'monkey', 'zebra']);
    });

    it('should ensure tag colors are consistent with getTagColor', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['research', 'writing'],
        },
      ];
      const tags = deriveTags(thoughts);

      tags.forEach((tag) => {
        const expectedColor = getTagColor(tag.name);
        expect(tag.color).toBe(expectedColor);
      });
    });

    it('should handle thoughts with single tag', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Single tag thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['focus'],
        },
      ];
      const tags = deriveTags(thoughts);

      expect(tags).toHaveLength(1);
      expect(tags[0].name).toBe('focus');
      expect(COLORS).toContain(tags[0].color);
    });

    it('should handle many thoughts with overlapping tags', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 123456,
          tags: ['work', 'morning'],
        },
        {
          id: '2',
          title: 'Thought 2',
          content: 'Content',
          createdAt: 123457,
          tags: ['work', 'afternoon'],
        },
        {
          id: '3',
          title: 'Thought 3',
          content: 'Content',
          createdAt: 123458,
          tags: ['personal', 'morning'],
        },
        {
          id: '4',
          title: 'Thought 4',
          content: 'Content',
          createdAt: 123459,
          tags: ['evening', 'reflection'],
        },
      ];
      const tags = deriveTags(thoughts);

      // Should have 6 unique tags: work, morning, afternoon, personal, evening, reflection
      expect(tags).toHaveLength(6);
      const uniqueTags = new Set(tags.map((t) => t.name));
      expect(uniqueTags.size).toBe(6);
    });

    it('should handle edge case: tag with spaces', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['my project', 'high priority'],
        },
      ];
      const tags = deriveTags(thoughts);

      expect(tags).toHaveLength(2);
      expect(tags.map((t) => t.name)).toContain('my project');
      expect(tags.map((t) => t.name)).toContain('high priority');
    });

    it('should handle edge case: empty string in tags array', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['work', '', 'personal'],
        },
      ];
      const tags = deriveTags(thoughts);

      // Empty string should be included as a tag (edge case handling)
      expect(tags.map((t) => t.name)).toContain('');
      expect(tags.map((t) => t.name)).toContain('work');
      expect(tags.map((t) => t.name)).toContain('personal');
    });

    it('should return Tag objects with required properties', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['learning'],
        },
      ];
      const tags = deriveTags(thoughts);

      expect(tags[0]).toHaveProperty('name');
      expect(tags[0]).toHaveProperty('color');
      expect(Object.keys(tags[0])).toEqual(['name', 'color']);
    });

    it('should be deterministic across multiple calls', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['alpha', 'beta', 'gamma'],
        },
      ];

      const tags1 = deriveTags(thoughts);
      const tags2 = deriveTags(thoughts);
      const tags3 = deriveTags(thoughts);

      expect(tags1).toEqual(tags2);
      expect(tags2).toEqual(tags3);
    });

    it('should handle large number of thoughts efficiently', () => {
      // Create 100 thoughts with various tags
      const thoughts: Thought[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `Thought ${i}`,
        content: 'Content',
        createdAt: 123456 + i,
        tags: [
          ['work', 'personal', 'hobby'][i % 3],
          ['monday', 'tuesday', 'wednesday'][i % 3],
        ],
      }));

      const tags = deriveTags(thoughts);

      // Should have 6 unique tags (3 time-based + 3 category-based)
      expect(tags.length).toBeLessThanOrEqual(6);
      expect(tags.length).toBeGreaterThan(0);

      // All should have valid colors
      tags.forEach((tag) => {
        expect(COLORS).toContain(tag.color);
      });
    });

    it('should preserve tag immutability through return value', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought',
          content: 'Content',
          createdAt: 123456,
          tags: ['immutable'],
        },
      ];
      const tags = deriveTags(thoughts);
      const originalColor = tags[0].color;

      // Try to modify (should not affect future calls)
      tags[0].color = '#FFFFFF';

      const tagsAgain = deriveTags(thoughts);
      expect(tagsAgain[0].color).toBe(originalColor);
    });
  });

  describe('Color Assignment Consistency', () => {
    it('same tag in different thoughts should have same color', () => {
      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 123456,
          tags: ['consistency'],
        },
        {
          id: '2',
          title: 'Thought 2',
          content: 'Content',
          createdAt: 123457,
          tags: ['consistency'],
        },
      ];

      const tags = deriveTags(thoughts);
      const consistencyTags = tags.filter((t) => t.name === 'consistency');

      expect(consistencyTags).toHaveLength(1);
      expect(consistencyTags[0].color).toBe(getTagColor('consistency'));
    });

    it('tag color should not change when new thoughts are added', () => {
      const initialThoughts: Thought[] = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 123456,
          tags: ['stable'],
        },
      ];

      const initialTags = deriveTags(initialThoughts);
      const stableColorInitial = initialTags.find((t) => t.name === 'stable')
        ?.color;

      const moreThoughts: Thought[] = [
        ...initialThoughts,
        {
          id: '2',
          title: 'Thought 2',
          content: 'Content',
          createdAt: 123457,
          tags: ['stable', 'new'],
        },
      ];

      const updatedTags = deriveTags(moreThoughts);
      const stableColorAfter = updatedTags.find((t) => t.name === 'stable')
        ?.color;

      expect(stableColorInitial).toBe(stableColorAfter);
    });
  });
});
