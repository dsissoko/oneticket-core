import type { Thought } from '../types/thought'

export class StorageAdapter {
  private readonly KEY = 'monjournal_thoughts'

  loadThoughts(): Thought[] {
    // Placeholder: load from localStorage
    return []
  }

  saveThoughts(thoughts: Thought[]): void {
    // Placeholder: save to localStorage
  }

  addThought(thought: Thought): void {
    // Placeholder: add to localStorage
  }

  updateThought(id: string, updates: Partial<Thought>): void {
    // Placeholder: update in localStorage
  }

  deleteThought(id: string): void {
    // Placeholder: delete from localStorage
  }

  clear(): void {
    // Placeholder: clear localStorage
  }
}
