export function validateThought(text: string): { valid: boolean; error?: string } {
  if (text.length === 0) return { valid: false, error: 'Thought cannot be empty' }
  if (text.length > 200) return { valid: false, error: 'Thought must be 200 characters or less' }
  return { valid: true }
}

export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map(t => t.toLowerCase().trim()).filter(Boolean))]
}
