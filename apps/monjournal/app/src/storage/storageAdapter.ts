import type { Thought } from '../types/thought'

export class StorageAdapter {
  private readonly KEY = 'monjournal_thoughts'

  loadThoughts(): Thought[] {
    try {
      const data = localStorage.getItem(this.KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.warn('Failed to load thoughts from storage', e)
      return []
    }
  }

  saveThoughts(thoughts: Thought[]): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(thoughts))
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded')
      }
    }
  }

  addThought(thought: Thought): void {
    const thoughts = this.loadThoughts()
    thoughts.push(thought)
    this.saveThoughts(thoughts)
  }

  updateThought(id: string, updates: Partial<Thought>): void {
    const thoughts = this.loadThoughts()
    const index = thoughts.findIndex(t => t.id === id)
    if (index !== -1) {
      thoughts[index] = { ...thoughts[index], ...updates, id }
      this.saveThoughts(thoughts)
    }
  }

  deleteThought(id: string): void {
    const thoughts = this.loadThoughts()
    const filtered = thoughts.filter(t => t.id !== id)
    this.saveThoughts(filtered)
  }

  clear(): void {
    try {
      localStorage.removeItem(this.KEY)
    } catch (e) {
      console.warn('Failed to clear storage', e)
    }
  }
}
