import { useState } from 'react'
import { Box, Button, Label, Text } from '@primer/react'
import ReactMarkdown from 'react-markdown'
import type { Thought } from '../types/thought'

interface ThoughtItemProps {
  thought: Thought
  onEdit: () => void
  onDelete: () => void
}

export function ThoughtItem({ thought, onEdit, onDelete }: ThoughtItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

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
      <Box sx={{ mb: 2 }}>
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          {new Date(thought.createdAt).toLocaleString()}
        </Text>
      </Box>

      <Box sx={{ mb: 2, fontSize: 1 }}>
        <ReactMarkdown>{thought.text}</ReactMarkdown>
      </Box>

      {thought.tags.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {thought.tags.map(tag => (
            <Label key={tag}>{tag}</Label>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button size="small" onClick={onEdit}>
          Edit
        </Button>
        <Button
          size="small"
          variant={confirmDelete ? 'danger' : 'default'}
          onClick={handleDelete}
        >
          {confirmDelete ? 'Confirm Delete?' : 'Delete'}
        </Button>
      </Box>
    </Box>
  )
}
