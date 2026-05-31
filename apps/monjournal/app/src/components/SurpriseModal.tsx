import { Box, Heading, Button, Label } from '@primer/react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Thought } from '../types/thought'

interface SurpriseModalProps {
  show: boolean
  thought: Thought | null
  onClose: () => void
  onNext: () => void
}

export function SurpriseModal({ show, thought, onClose, onNext }: SurpriseModalProps) {
  if (!show || !thought) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          backgroundColor: 'canvas.default',
          borderRadius: 2,
          p: 4,
          maxWidth: 600,
          width: '90%',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Heading as="h2" sx={{ fontSize: 3, mb: 2 }}>
            ✨ A Random Thought
          </Heading>
        </Box>

        <Box sx={{ mb: 4, p: 3, backgroundColor: 'canvas.subtle', borderRadius: 1 }}>
          <Box sx={{ fontSize: 2, mb: 2, lineHeight: 1.6 }}>
            <ReactMarkdown>{thought.text}</ReactMarkdown>
          </Box>

          <Box sx={{ fontSize: 0, color: 'fg.muted', mb: 2 }}>
            {new Date(thought.createdAt).toLocaleString()}
          </Box>

          {thought.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {thought.tags.map(tag => (
                <Label key={tag} variant="secondary">{tag}</Label>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button onClick={onClose}>
            Back to List
          </Button>
          <Button variant="primary" onClick={onNext}>
            Another Surprise 🎲
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
