import { Box, Stack } from '@primer/react'
import type { Thought } from '../types/thought'
import { ThoughtItem } from './ThoughtItem'

interface ThoughtStreamProps {
  thoughts: Thought[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ThoughtStream({ thoughts, onEdit, onDelete }: ThoughtStreamProps) {
  if (thoughts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'fg.muted' }}>
        No thoughts yet. Add your first thought above!
      </Box>
    )
  }

  return (
    <Stack direction="vertical" gap="spacious">
      {thoughts.map(thought => (
        <ThoughtItem
          key={thought.id}
          thought={thought}
          onEdit={() => onEdit(thought.id)}
          onDelete={() => onDelete(thought.id)}
        />
      ))}
    </Stack>
  )
}
