import { Box, Stack, Heading } from '@primer/react'
import { ThoughtForm } from './components/ThoughtForm'
import { ThoughtStream } from './components/ThoughtStream'
import { SearchBar } from './components/SearchBar'
import { FilterBar } from './components/FilterBar'

export function App() {
  return (
    <Box
      as="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bg: 'canvas.default',
      }}
    >
      <Box
        as="header"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'border.default',
          p: 4,
          bg: 'canvas.inset',
        }}
      >
        <Stack direction="vertical" gap="spacious">
          <Heading as="h1" sx={{ fontSize: 6 }}>
            MonJournal
          </Heading>
          <Stack direction="horizontal" gap="normal">
            <SearchBar />
          </Stack>
          <FilterBar />
        </Stack>
      </Box>

      <Box
        as="section"
        sx={{
          flex: 1,
          p: 4,
          maxWidth: '900px',
          mx: 'auto',
          width: '100%',
        }}
      >
        <Stack direction="vertical" gap="spacious">
          <ThoughtForm />
          <ThoughtStream />
        </Stack>
      </Box>
    </Box>
  )
}
