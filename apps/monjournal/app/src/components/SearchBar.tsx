import { TextInput } from '@primer/react'

export function SearchBar() {
  return (
    <TextInput
      placeholder="Search thoughts..."
      disabled
      sx={{ flex: 1 }}
    />
  )
}
