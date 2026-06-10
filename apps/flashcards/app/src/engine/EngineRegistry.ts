import type { RenderEngine, CardSide } from '@/types';

class EngineRegistry {
  private engines = new Map<string, RenderEngine>()

  register(id: string, engine: RenderEngine): void {
    this.engines.set(id, engine)
  }

  resolve(id?: string): RenderEngine {
    if (!id || !this.engines.has(id)) {
      // Fallback: return TextEngine if registered, or a minimal text renderer
      const fallback = this.engines.get('text')
      if (fallback) return fallback
      // Minimal fallback if text engine not yet registered
      return {
        render(data: any, target: HTMLElement) {
          target.textContent = String(data ?? '')
        }
      }
    }
    return this.engines.get(id)!
  }
}

function normalizeCardSide(side: CardSide): { data: any; renderEngineId: string } {
  if (typeof side === 'string') return { data: side, renderEngineId: 'text' }
  return side
}

// Singleton instance
const engineRegistry = new EngineRegistry()

export { EngineRegistry, normalizeCardSide, engineRegistry }
export type { RenderEngine }
