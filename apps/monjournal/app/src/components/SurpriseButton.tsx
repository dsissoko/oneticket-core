import { Button } from '@primer/react'

interface SurpriseButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function SurpriseButton({ onClick, disabled = false }: SurpriseButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: disabled ? 'var(--color-btn-inactive-bg)' : 'var(--color-btn-primary-bg)',
      }}
    >
      🎲 Surprise Me!
    </Button>
  )
}
