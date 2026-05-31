import { Box, Heading, Text } from '@primer/react'

export function ThoughtStream() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Heading as="h2" sx={{ fontSize: 4 }}>
        Thought Stream
      </Heading>
      <Text sx={{ color: 'fg.muted' }}>
        No thoughts yet. Add your first thought above!
      </Text>
    </Box>
  )
}
