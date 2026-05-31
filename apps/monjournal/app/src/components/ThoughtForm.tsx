import { Box, Button, Text, Textarea } from '@primer/react'

export function ThoughtForm() {
  return (
    <Box
      as="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box>
        <Text as="label" htmlFor="thought-input" sx={{ display: 'block', mb: 2 }}>
          What's on your mind?
        </Text>
        <Textarea
          id="thought-input"
          placeholder="Write your thought here..."
          rows={4}
          disabled
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button disabled>Save Thought</Button>
      </Box>
    </Box>
  )
}
