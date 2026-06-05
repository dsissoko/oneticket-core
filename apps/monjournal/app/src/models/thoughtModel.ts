export interface Thought {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  tags: string[];
}

/**
 * Creates a new Thought with auto-generated UUID and timestamp.
 * All properties are immutable after creation.
 */
export function createThought(
  title: string,
  content: string,
  tags: string[] = []
): Thought {
  // Simple UUID v4-like generation
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  return {
    id: uuid,
    title,
    content,
    createdAt: Date.now(),
    tags: Object.freeze([...tags]) as unknown as string[],
  };
}

/**
 * Validates that a thought object has all required fields with correct types.
 */
export function validateThought(t: any): boolean {
  if (!t || typeof t !== 'object') return false;

  // Check required string fields
  if (typeof t.id !== 'string' || !t.id) return false;
  if (typeof t.title !== 'string' || !t.title) return false;
  if (typeof t.content !== 'string' || !t.content) return false;

  // Check required timestamp field
  if (typeof t.createdAt !== 'number' || t.createdAt < 0) return false;

  // Check tags is array of strings
  if (!Array.isArray(t.tags)) return false;
  if (!t.tags.every((tag: any) => typeof tag === 'string')) return false;

  return true;
}
