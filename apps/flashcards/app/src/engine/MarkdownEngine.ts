import { marked } from 'marked';
import type { RenderEngine } from '@/types';

const MarkdownEngine: RenderEngine = {
  render(data: any, target: HTMLElement): void {
    const markdown = String(data ?? '');
    target.innerHTML = marked.parse(markdown, { async: false }) as string;
  }
};

export { MarkdownEngine };
