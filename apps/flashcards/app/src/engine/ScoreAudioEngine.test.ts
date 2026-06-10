import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScoreAudioEngine } from '@/engine/ScoreAudioEngine';
import type { ScoreData } from '@/engine/ScoreEngine';

// ---------------------------------------------------------------------------
// VexFlow mock — reused from ScoreEngine.test.ts
// The real VexFlow uses SVGElement APIs not available in jsdom.
// ---------------------------------------------------------------------------

vi.mock('vexflow', () => {
  const mockContext = {
    setFont: vi.fn(),
    setBackgroundFillStyle: vi.fn(),
    resize: vi.fn(),
  };

  class MockRenderer {
    constructor(target: HTMLElement) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      target.appendChild(svg);
    }
    resize = vi.fn();
    getContext = vi.fn(() => mockContext);

    static Backends = { SVG: 1 };
  }

  class MockStave {
    addClef = vi.fn().mockReturnThis();
    setContext = vi.fn().mockReturnThis();
    draw = vi.fn().mockReturnThis();
  }

  class MockVoice {
    addTickables = vi.fn().mockReturnThis();
    draw = vi.fn().mockReturnThis();
  }

  class MockFormatter {
    joinVoices = vi.fn().mockReturnThis();
    format = vi.fn().mockReturnThis();
  }

  class MockStaveNote {
    // no-op — just needs to be instantiable
  }

  return {
    Renderer: MockRenderer,
    Stave: MockStave,
    Voice: MockVoice,
    Formatter: MockFormatter,
    StaveNote: MockStaveNote,
  };
});

// ---------------------------------------------------------------------------
// Tone.js mock
// Exposes all symbols used by ScoreAudioEngine with vi.fn() stubs.
// ---------------------------------------------------------------------------

const mockTransport = {
  stop: vi.fn(),
  cancel: vi.fn(),
  start: vi.fn(),
};

vi.mock('tone', () => {
  class MockSynth {
    triggerAttackRelease = vi.fn();
    toDestination = vi.fn().mockReturnThis();
    dispose = vi.fn();
  }

  class MockPart {
    start = vi.fn().mockReturnThis();
    dispose = vi.fn();
    // The constructor receives a callback and notes array — we ignore them.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_callback: unknown, _notes: unknown) {}
  }

  return {
    start: vi.fn(),
    getTransport: vi.fn(() => mockTransport),
    Time: vi.fn(() => ({ toSeconds: vi.fn().mockReturnValue(1) })),
    Synth: MockSynth,
    Part: MockPart,
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ScoreAudioEngine', () => {
  let engine: ScoreAudioEngine;
  let target: HTMLDivElement;
  const scoreData: ScoreData = {
    clef: 'treble',
    notes: [
      { note: 'C4', duration: 'q' },
      { note: 'E4', duration: 'q' },
      { note: 'G4', duration: 'h' },
    ],
  };

  beforeEach(async () => {
    // Reset all mock call counts before each test
    vi.clearAllMocks();
    // Restore mockTransport reference (clearAllMocks resets calls but keeps structure)
    mockTransport.stop.mockReset();
    mockTransport.cancel.mockReset();
    mockTransport.start.mockReset();

    engine = new ScoreAudioEngine();
    target = document.createElement('div');
    document.body.appendChild(target);

    // Pre-schedule notes before each test (most tests need this)
    await engine.precompute(scoreData);
    // Reset transport mocks AFTER precompute so render tests start clean
    mockTransport.stop.mockReset();
    mockTransport.cancel.mockReset();
    mockTransport.start.mockReset();
  });

  // 1. ScoreAudioEngine implements RenderEngine
  it('ScoreAudioEngine implements RenderEngine — has render and precompute methods', () => {
    const freshEngine = new ScoreAudioEngine();
    expect(typeof freshEngine.render).toBe('function');
    expect(typeof freshEngine.precompute).toBe('function');
  });

  // 2. render() injects an SVG element into target
  it('render() injects an SVG element into target', () => {
    engine.render(scoreData, target);
    const svg = target.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  // 3. render() calls Tone.start()
  it('render() calls Tone.start()', async () => {
    const Tone = await import('tone');
    engine.render(scoreData, target);
    expect(Tone.start).toHaveBeenCalled();
  });

  // 4. render() starts Tone Transport
  it('render() starts Tone Transport', () => {
    engine.render(scoreData, target);
    expect(mockTransport.start).toHaveBeenCalled();
  });

  // 5. precompute() stops and cancels Transport
  it('precompute() stops and cancels Transport', async () => {
    // Call precompute fresh — beforeEach already reset mocks after initial precompute
    await engine.precompute(scoreData);
    expect(mockTransport.stop).toHaveBeenCalled();
    expect(mockTransport.cancel).toHaveBeenCalled();
  });

  // 6. precompute() is idempotent — calling twice produces no errors and calls stop/cancel each time
  it('precompute() is idempotent — no errors on repeated calls', async () => {
    await expect(engine.precompute(scoreData)).resolves.toBeUndefined();
    const stopCountAfterFirst = mockTransport.stop.mock.calls.length;
    const cancelCountAfterFirst = mockTransport.cancel.mock.calls.length;

    await expect(engine.precompute(scoreData)).resolves.toBeUndefined();

    expect(mockTransport.stop.mock.calls.length).toBeGreaterThan(stopCountAfterFirst);
    expect(mockTransport.cancel.mock.calls.length).toBeGreaterThan(cancelCountAfterFirst);
  });

  // 7. render() does NOT call getTransport().start inside precompute — only render triggers it
  it('Transport.start is NOT called after precompute alone — only after render', async () => {
    // Transport mocks were reset at end of beforeEach; now call precompute again
    await engine.precompute(scoreData);
    // Transport.start must NOT have been called yet
    expect(mockTransport.start).not.toHaveBeenCalled();

    // Only after render should Transport.start be triggered
    engine.render(scoreData, target);
    expect(mockTransport.start).toHaveBeenCalled();
  });
});
