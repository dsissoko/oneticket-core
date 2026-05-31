import { useState } from 'react'

interface Filters {
  tags: string[]
  searchQuery: string
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    tags: [],
    searchQuery: '',
  })

  const setTags = (tags: string[]): void => {
    setFilters((prev) => ({ ...prev, tags }))
  }

  const setSearchQuery = (query: string): void => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
  }

  const clearFilters = (): void => {
    setFilters({
      tags: [],
      searchQuery: '',
    })
  }

  return {
    filters,
    setTags,
    setSearchQuery,
    clearFilters,
  }
}
