/**
 * Tag data model and derivation logic
 *
 * Tags are derived from thoughts (not stored separately).
 * Colors are assigned deterministically using a hash of the tag name,
 * ensuring the same tag always gets the same color across sessions.
 */
import { COLORS } from './colorPalette';
/**
 * Simple deterministic hash function for tag names
 *
 * Converts a tag name to a numeric hash that will be consistent
 * across multiple calls with the same input.
 *
 * @param tagName - The tag name to hash
 * @returns A numeric hash value
 */
function hashTagName(tagName) {
    let hash = 0;
    // Iterate through each character and accumulate hash
    for (let i = 0; i < tagName.length; i++) {
        const char = tagName.charCodeAt(i);
        // Use a simple FNV-1a style hash
        hash = ((hash << 5) - hash) + char;
        // Keep it as a 32-bit integer
        hash = hash & hash;
    }
    // Return absolute value to ensure positive index
    return Math.abs(hash);
}
/**
 * Gets a deterministic color for a tag name
 *
 * The same tag name will always produce the same color, even across
 * different browser sessions. The color is selected from the palette
 * using a hash of the tag name.
 *
 * @param tagName - The name of the tag
 * @returns A hex color string from the palette
 */
export function getTagColor(tagName) {
    const hash = hashTagName(tagName);
    const colorIndex = hash % COLORS.length;
    return COLORS[colorIndex];
}
/**
 * Derives unique tags from an array of thoughts
 *
 * Tags are not stored separately; they are computed from the union
 * of all tag names across all thoughts. Each tag is assigned a
 * deterministic color based on its name.
 *
 * @param thoughts - Array of thought objects
 * @returns Array of Tag objects with names and colors, sorted alphabetically
 */
export function deriveTags(thoughts) {
    // Collect all unique tag names
    const tagNamesSet = new Set();
    for (const thought of thoughts) {
        if (Array.isArray(thought.tags)) {
            for (const tag of thought.tags) {
                if (typeof tag === 'string' && tag.length > 0) {
                    tagNamesSet.add(tag);
                }
            }
        }
    }
    // Convert to array and sort alphabetically
    const tagNames = Array.from(tagNamesSet).sort();
    // Create Tag objects with colors
    const tags = tagNames.map(name => ({
        name,
        color: getTagColor(name),
    }));
    return tags;
}
/**
 * Filters a tag array by name (case-sensitive)
 *
 * @param tags - Array of tags to filter
 * @param names - Set of tag names to keep
 * @returns Filtered array of tags
 */
export function filterTagsByName(tags, names) {
    return tags.filter(tag => names.has(tag.name));
}
/**
 * Finds a single tag by name
 *
 * @param tags - Array of tags to search
 * @param name - The tag name to find
 * @returns The tag object, or undefined if not found
 */
export function findTag(tags, name) {
    return tags.find(tag => tag.name === name);
}
