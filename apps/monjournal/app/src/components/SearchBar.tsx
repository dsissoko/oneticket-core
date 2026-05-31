import { TextInput } from '@primer/react'
import { SearchIcon } from '@primer/octicons-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search thoughts...',
}: SearchBarProps) {
  return (
    <TextInput
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{
        flex: 1,
      }}
      leadingVisual={SearchIcon}
    />
  )
}
