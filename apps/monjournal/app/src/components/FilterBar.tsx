import { Box, Button, Text } from '@primer/react'

interface FilterBarProps {
  availableTags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearFilters: () => void
  showClearButton?: boolean
}

export function FilterBar({
  availableTags,
  selectedTags,
  onToggleTag,
  onClearFilters,
  showClearButton = true,
}: FilterBarProps) {
  if (availableTags.length === 0) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Text sx={{ fontSize: 0, fontWeight: 'bold', color: 'fg.muted' }}>
        Filter by Tag:
      </Text>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {availableTags.map((tag) => (
          <Button
            key={tag}
            size="small"
            variant={selectedTags.includes(tag) ? 'primary' : 'default'}
            onClick={() => onToggleTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </Box>

      {showClearButton && selectedTags.length > 0 && (
        <Box>
          <Button
            size="small"
            variant="invisible"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Box>
  )
}
