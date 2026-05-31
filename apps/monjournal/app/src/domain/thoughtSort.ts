import type { Thought } from '../types/thought'

export type SortOrder = 'asc' | 'desc'
export type SortField = 'createdAt' | 'updatedAt'

export class ThoughtSort {
  static sort(
    thoughts: Thought[],
    field: SortField = 'createdAt',
    order: SortOrder = 'desc'
  ): Thought[] {
    // Placeholder: sorting logic
    return [...thoughts]
  }

  static byDate(thoughts: Thought[], order: SortOrder = 'desc'): Thought[] {
    // Placeholder: date sorting logic
    return [...thoughts]
  }
}
