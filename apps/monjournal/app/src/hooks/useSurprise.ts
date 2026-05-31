import { useState } from 'react'
import type { Thought } from '../types/thought'

export function useSurprise() {
  const [surpriseThought, setSurpriseThought] = useState<Thought | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const pickSurprise = (thoughts: Thought[]): void => {
    // Placeholder implementation
  }

  const closeSurprise = (): void => {
    setIsOpen(false)
    setSurpriseThought(null)
  }

  return {
    surpriseThought,
    isOpen,
    pickSurprise,
    closeSurprise,
  }
}
