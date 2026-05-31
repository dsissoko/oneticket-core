import { Box, Stack, Heading, Text } from '@primer/react'
import { useThoughts } from './hooks/useThoughts'
import { useFilters } from './hooks/useFilters'
import { ThoughtForm } from './components/ThoughtForm'
import { ThoughtStream } from './components/ThoughtStream'
import { SearchBar } from './components/SearchBar'
import { FilterBar } from './components/FilterBar'

export function App() {
  const {
    thoughts,
    addThought,
    updateThought,
    deleteThought,
    editingId,
    setEditingId,
  } = useThoughts()

  const {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    availableTags,
    filteredThoughts,
    clearFilters,
  } = useFilters(thoughts)

  const editingThought = thoughts.find(t => t.id === editingId)

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
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </Stack>
          <FilterBar
            availableTags={availableTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearFilters={clearFilters}
          />
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
          <ThoughtForm
            onSubmit={(text, tags) => {
              if (editingThought) {
                updateThought(editingThought.id, text, tags)
              } else {
                addThought(text, tags)
              }
            }}
            initialText={editingThought?.text}
            initialTags={editingThought?.tags}
            isEditing={!!editingId}
          />
          
          {(selectedTags.length > 0 || searchQuery) && (
            <Box sx={{ fontSize: 0, color: 'fg.muted' }}>
              Showing {filteredThoughts.length} of {thoughts.length} thoughts
            </Box>
          )}

          <ThoughtStream
            thoughts={filteredThoughts}
            onEdit={setEditingId}
            onDelete={deleteThought}
          />
        </Stack>
      </Box>
    </Box>
  )
}
