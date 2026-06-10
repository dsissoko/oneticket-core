import * as Tone from 'tone';
import type { RenderEngine } from '@/types';
import { ScoreEngine, ScoreData } from '@/engine/ScoreEngine';

function durationToTone(duration: string): string {
  const map: Record<string, string> = { w: '1n', h: '2n', q: '4n' };
  return map[duration] ?? '4n';
}

export class ScoreAudioEngine implements RenderEngine {
  private _scoreEngine = new ScoreEngine();
  private _synth: Tone.Synth | null = null;
  private _part: Tone.Part | null = null;

  async precompute(data: ScoreData): Promise<void> {
    // Idempotency: stop and reset Transport before re-scheduling
    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    // Dispose previous resources to avoid memory leaks
    if (this._part) { this._part.dispose(); this._part = null; }
    if (this._synth) { this._synth.dispose(); this._synth = null; }

    const notes = data.notes.map((n, i) => ({
      time: i * Tone.Time(durationToTone(n.duration)).toSeconds(),
      note: n.note,
      duration: durationToTone(n.duration),
    }));

    const synth = new Tone.Synth().toDestination();
    const part = new Tone.Part((time: number, value: { note: string; duration: string }) => {
      synth.triggerAttackRelease(value.note, value.duration, time);
    }, notes);
    part.start(0);

    this._synth = synth;
    this._part = part;
  }

  render(data: ScoreData, target: HTMLElement): void {
    // 1. Inject VexFlow SVG via ScoreEngine delegation
    this._scoreEngine.render(data, target);

    // 2. Unlock AudioContext — MUST be called inside a user gesture handler (flip tap)
    void Tone.start();

    // 3. Start Transport playback
    Tone.getTransport().start();
  }
}
