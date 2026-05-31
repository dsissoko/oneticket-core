import { Box, Text } from '@primer/react'

export function FilterBar() {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Text sx={{ color: 'fg.muted' }}>Tags: (none)</Text>
    </Box>
  )
}
