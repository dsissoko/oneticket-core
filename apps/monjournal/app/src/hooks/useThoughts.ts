import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Thought } from '../types/thought'
import { StorageAdapter } from '../storage/storageAdapter'

const storage = new StorageAdapter()

export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [editingId, setEditingId] = useState<string | undefined>()

  // Load on mount
  useEffect(() => {
    const loaded = storage.loadThoughts()
    setThoughts(loaded)
  }, [])

  // Sorted getter (newest first)
  const sortedThoughts = useMemo(
    () => [...thoughts].sort((a, b) => b.createdAt - a.createdAt),
    [thoughts]
  )

  const addThought = useCallback((text: string, tags: string[]): boolean => {
    // Validation: max 200 chars
    if (text.length > 200 || text.length === 0) return false

    const thought: Thought = {
      id: crypto.randomUUID(),
      text,
      tags: tags.map(t => t.toLowerCase().trim()).filter(Boolean),
      createdAt: Date.now(),
    }

    setThoughts(prev => [...prev, thought])
    storage.addThought(thought)
    return true
  }, [])

  const updateThought = useCallback((id: string, text: string, tags: string[]): boolean => {
    if (text.length > 200 || text.length === 0) return false

    const updates = {
      text,
      tags: tags.map(t => t.toLowerCase().trim()).filter(Boolean),
      updatedAt: Date.now(),
    }

    setThoughts(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    )
    storage.updateThought(id, updates)
    setEditingId(undefined)
    return true
  }, [])

  const deleteThought = useCallback((id: string) => {
    setThoughts(prev => prev.filter(t => t.id !== id))
    storage.deleteThought(id)
  }, [])

  return {
    thoughts: sortedThoughts,
    addThought,
    updateThought,
    deleteThought,
    editingId,
    setEditingId,
  }
}
