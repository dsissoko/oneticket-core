import { Box } from '@primer/react'
import type { Thought } from '../types/thought'

interface ThoughtItemProps {
  thought: Thought
}

export function ThoughtItem({ thought }: ThoughtItemProps) {
  return (
    <Box
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        bg: 'canvas.default',
      }}
    >
      {/* Thought content will be rendered here */}
    </Box>
  )
}
