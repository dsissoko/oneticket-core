export interface Thought {
  id: string
  text: string
  tags: string[]
  createdAt: number
  updatedAt?: number
}

export type ThoughtInput = Omit<Thought, 'id' | 'createdAt'>
