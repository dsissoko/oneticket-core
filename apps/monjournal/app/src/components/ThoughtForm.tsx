import { useState } from 'react'
import { Box, Button, Text, Textarea } from '@primer/react'

interface ThoughtFormProps {
  onSubmit: (text: string, tags: string[]) => void
  initialText?: string
  initialTags?: string[]
  isEditing?: boolean
}

export function ThoughtForm({
  onSubmit,
  initialText = '',
  initialTags = [],
  isEditing = false,
}: ThoughtFormProps) {
  const [text, setText] = useState(initialText)
  const [tags, setTags] = useState(initialTags.join(', '))
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (text.length === 0) {
      setError('Thought cannot be empty')
      return
    }
    if (text.length > 200) {
      setError('Thought must be 200 characters or less')
      return
    }

    onSubmit(
      text,
      tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    )
    setText('')
    setTags('')
    setError('')
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
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
          value={text}
          onChange={e => {
            const newText = e.target.value.slice(0, 200)
            setText(newText)
          }}
          maxLength={200}
        />
        <Text
          sx={{ display: 'block', mt: 1, fontSize: 0, color: 'fg.muted' }}
        >
          {text.length}/200
        </Text>
      </Box>

      <Box>
        <Text as="label" htmlFor="tags-input" sx={{ display: 'block', mb: 2 }}>
          Tags (comma-separated)
        </Text>
        <Textarea
          id="tags-input"
          placeholder="e.g. happiness, nature, work"
          rows={2}
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
      </Box>

      {error && (
        <Text sx={{ color: 'danger.fg' }}>
          {error}
        </Text>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button type="submit" variant="primary">
          {isEditing ? 'Update Thought' : 'Save Thought'}
        </Button>
      </Box>
    </Box>
  )
}
