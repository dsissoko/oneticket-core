import type { RenderEngine } from '@/types';

const TextEngine: RenderEngine = {
  render(data: any, target: HTMLElement): void {
    target.textContent = String(data ?? '')
  }
}

export { TextEngine }
