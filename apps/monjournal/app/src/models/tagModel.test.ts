import { describe, it, expect } from 'vitest';
import {
  hashCode,
  getTagColor,
  deriveTags,
  validateTag,
} from './tagModel';
import { createThought } from './thoughtModel';
import { COLORS } from '../utils/colorPalette';
import { Tag } from './types';

describe('tagModel', () => {
  describe('hashCode', () => {
    it('generates a positive number', () => {
      expect(hashCode('test')).toBeGreaterThanOrEqual(0);
      expect(hashCode('another')).toBeGreaterThanOrEqual(0);
    });

    it('is deterministic (same input = same output)', () => {
      const hash1 = hashCode('consistent');
      const hash2 = hashCode('consistent');
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different strings', () => {
      const hash1 = hashCode('string1');
      const hash2 = hashCode('string2');
      expect(hash1).not.toBe(hash2);
    });

    it('handles empty strings', () => {
      expect(typeof hashCode('')).toBe('number');
      expect(hashCode('')).toBeGreaterThanOrEqual(0);
    });

    it('handles special characters', () => {
      expect(typeof hashCode('tag-with-dashes')).toBe('number');
      expect(typeof hashCode('tag_with_underscores')).toBe('number');
      expect(typeof hashCode('tag with spaces')).toBe('number');
    });
  });

  describe('getTagColor', () => {
    it('returns a color from the palette', () => {
      const color = getTagColor('work');
      expect(COLORS.includes(color)).toBe(true);
    });

    it('is deterministic (same tag = same color)', () => {
      const color1 = getTagColor('persistent');
      const color2 = getTagColor('persistent');
      expect(color1).toBe(color2);
    });

    it('assigns different colors to different tags (mostly)', () => {
      const color1 = getTagColor('work');
      const color2 = getTagColor('personal');
      // They might collide, but usually different
      // We can't guarantee they're different due to hash collisions
      expect([color1, color2].every((c) => COLORS.includes(c))).toBe(true);
    });

    it('returns default color for empty/invalid tags', () => {
      expect(getTagColor('')).toBe(COLORS[0]);
      expect(getTagColor('   ')).toBe(COLORS[0]);
    });

    it('handles case sensitivity in hashing', () => {
      // Uppercase and lowercase will produce different hashes
      const colorLower = getTagColor('work');
      const colorUpper = getTagColor('WORK');
      // They might be different (which is expected)
      expect(COLORS.includes(colorLower)).toBe(true);
      expect(COLORS.includes(colorUpper)).toBe(true);
    });
  });

  describe('deriveTags', () => {
    it('returns empty array for empty thoughts', () => {
      expect(deriveTags([])).toEqual([]);
    });

    it('derives unique tags from thoughts', () => {
      const thoughts = [
        createThought('T1', 'C1', ['work', 'urgent']),
        createThought('T2', 'C2', ['personal']),
        createThought('T3', 'C3', ['work']),
      ];
      const tags = deriveTags(thoughts);

      expect(tags.length).toBe(3);
      expect(tags.map((t) => t.name).sort()).toEqual([
        'personal',
        'urgent',
        'work',
      ]);
    });

    it('deduplicates tags', () => {
      const thoughts = [
        createThought('T1', 'C1', ['tag1', 'tag1']),
        createThought('T2', 'C2', ['tag1']),
      ];
      const tags = deriveTags(thoughts);
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('tag1');
    });

    it('filters out empty tag strings', () => {
      const thoughts = [
        createThought('T1', 'C1', ['valid', '']),
        createThought('T2', 'C2', []),
      ];
      const tags = deriveTags(thoughts);
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('valid');
    });

    it('trims whitespace from tag names', () => {
      const thoughts = [
        createThought('T1', 'C1', [' tag1 ', 'tag1']),
      ];
      const tags = deriveTags(thoughts);
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('tag1');
    });

    it('returns Tag objects with name and color', () => {
      const thoughts = [
        createThought('T1', 'C1', ['work']),
      ];
      const tags = deriveTags(thoughts);

      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('work');
      expect(typeof tags[0].color).toBe('string');
      expect(COLORS.includes(tags[0].color)).toBe(true);
    });

    it('returns tags sorted alphabetically', () => {
      const thoughts = [
        createThought('T1', 'C1', ['zebra', 'apple', 'middle']),
      ];
      const tags = deriveTags(thoughts);
      const names = tags.map((t) => t.name);
      expect(names).toEqual(['apple', 'middle', 'zebra']);
    });

    it('handles thoughts with no tags', () => {
      const thoughts = [
        createThought('T1', 'C1', []),
        createThought('T2', 'C2'),
        createThought('T3', 'C3', ['tag1']),
      ];
      const tags = deriveTags(thoughts);
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('tag1');
    });
  });

  describe('validateTag', () => {
    let validTag: Tag;

    beforeEach(() => {
      validTag = {
        name: 'work',
        color: '#FF6B6B',
      };
    });

    it('validates a correct tag', () => {
      expect(validateTag(validTag)).toBe(true);
    });

    it('rejects null or undefined', () => {
      expect(validateTag(null)).toBe(false);
      expect(validateTag(undefined)).toBe(false);
    });

    it('rejects non-objects', () => {
      expect(validateTag('string')).toBe(false);
      expect(validateTag(123)).toBe(false);
    });

    it('rejects missing required fields', () => {
      expect(validateTag({ name: 'work' })).toBe(false);
      expect(validateTag({ color: '#FF6B6B' })).toBe(false);
    });

    it('rejects invalid field types', () => {
      expect(validateTag({ ...validTag, name: 123 })).toBe(false);
      expect(validateTag({ ...validTag, color: 123 })).toBe(false);
    });

    it('rejects empty name or color', () => {
      expect(validateTag({ ...validTag, name: '' })).toBe(false);
      expect(validateTag({ ...validTag, color: '' })).toBe(false);
    });
  });
});
