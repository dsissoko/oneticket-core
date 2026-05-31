import type { Thought } from '../types/thought'

export function searchThoughts(thoughts: Thought[], query: string): Thought[] {
  if (!query.trim()) return thoughts

  const lowerQuery = query.toLowerCase()
  return thoughts.filter((thought) =>
    thought.text.toLowerCase().includes(lowerQuery)
  )
}

export function filterByTags(thoughts: Thought[], selectedTags: string[]): Thought[] {
  if (selectedTags.length === 0) return thoughts

  // AND logic: thought must have ALL selected tags
  return thoughts.filter((thought) =>
    selectedTags.every((tag) => thought.tags.includes(tag))
  )
}

export function applyAllFilters(
  thoughts: Thought[],
  query: string,
  selectedTags: string[]
): Thought[] {
  let result = thoughts
  result = searchThoughts(result, query)
  result = filterByTags(result, selectedTags)
  return result
}

// Legacy class-based API for backward compatibility
interface FilterCriteria {
  tags?: string[]
  searchQuery?: string
}

export class ThoughtFilter {
  static filter(thoughts: Thought[], criteria: FilterCriteria): Thought[] {
    return applyAllFilters(
      thoughts,
      criteria.searchQuery ?? '',
      criteria.tags ?? []
    )
  }

  static filterByTags(thoughts: Thought[], tags: string[]): Thought[] {
    return filterByTags(thoughts, tags)
  }

  static filterBySearch(thoughts: Thought[], query: string): Thought[] {
    return searchThoughts(thoughts, query)
  }
}
