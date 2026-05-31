import { useState, useMemo, useCallback } from 'react'
import type { Thought } from '../types/thought'

export function useFilters(thoughts: Thought[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Calculate available tags from all thoughts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    thoughts.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [thoughts])

  // Filter thoughts by search and selected tags
  const filteredThoughts = useMemo(() => {
    return thoughts.filter((thought) => {
      // Search filter: match keyword in text
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!thought.text.toLowerCase().includes(query)) {
          return false
        }
      }

      // Tag filter: AND logic (thought must have ALL selected tags)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => thought.tags.includes(tag))
        if (!hasAllTags) {
          return false
        }
      }

      return true
    })
  }, [thoughts, searchQuery, selectedTags])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedTags([])
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    availableTags,
    filteredThoughts,
    clearFilters,
  }
}
