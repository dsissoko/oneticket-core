import { useState, useCallback } from 'react'
import type { Thought } from '../types/thought'

export function useSurprise(filteredThoughts: Thought[]) {
  const [showSurprise, setShowSurprise] = useState(false)
  const [surpriseThought, setSurpriseThought] = useState<Thought | null>(null)

  const pickSurprise = useCallback(() => {
    if (filteredThoughts.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * filteredThoughts.length)
    const thought = filteredThoughts[randomIndex]
    setSurpriseThought(thought)
    setShowSurprise(true)
  }, [filteredThoughts])

  const closeSurprise = useCallback(() => {
    setShowSurprise(false)
    setSurpriseThought(null)
  }, [])

  const nextSurprise = useCallback(() => {
    pickSurprise()
  }, [pickSurprise])

  return {
    showSurprise,
    surpriseThought,
    pickSurprise,
    closeSurprise,
    nextSurprise,
  }
}
