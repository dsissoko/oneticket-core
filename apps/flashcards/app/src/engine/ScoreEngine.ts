import { Renderer, Stave, Voice, Formatter, StaveNote } from 'vexflow';
import type { RenderEngine } from '@/types';

export interface ScoreData {
  clef: 'treble' | 'bass';
  notes: Array<{ note: string; duration: string }>;
}

function noteToVexKey(note: string): string {
  // Convert VexFlow note format C4 → c/4
  // Split on the boundary between letters and digits
  const match = note.match(/^([A-Za-z#b]+)(\d+)$/);
  if (!match) return note.toLowerCase();
  return `${match[1].toLowerCase()}/${match[2]}`;
}

export class ScoreEngine implements RenderEngine {
  render(data: ScoreData, target: HTMLElement): void {
    target.innerHTML = '';

    const renderer = new Renderer(target as HTMLDivElement, Renderer.Backends.SVG);
    renderer.resize(300, 150);
    const context = renderer.getContext();

    const stave = new Stave(10, 20, 280);
    stave.addClef(data.clef);
    stave.setContext(context).draw();

    const staveNotes = data.notes.map(
      ({ note, duration }) =>
        new StaveNote({
          keys: [noteToVexKey(note)],
          duration,
        })
    );

    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.setStrict(false);
    voice.addTickables(staveNotes);

    new Formatter().joinVoices([voice]).format([voice], 260);
    voice.draw(context, stave);
  }
}

export const scoreEngine = new ScoreEngine();
