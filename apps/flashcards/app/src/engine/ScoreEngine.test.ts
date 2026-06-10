import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScoreEngine, ScoreData } from '@/engine/ScoreEngine';

// ---------------------------------------------------------------------------
// Minimal VexFlow mock
// The real VexFlow uses SVGElement APIs that are not available in jsdom.
// We mock the module so tests validate the ScoreEngine contract
// (interface compliance + SVG injection behavior) without VexFlow internals.
// ---------------------------------------------------------------------------

vi.mock('vexflow', () => {
  // A mock context returned by Renderer.getContext()
  const mockContext = {
    setFont: vi.fn(),
    setBackgroundFillStyle: vi.fn(),
    resize: vi.fn(),
  };

  // Mock Renderer: appends an <svg> to the target in its constructor
  // (simulating VexFlow's actual SVG-backend behavior)
  class MockRenderer {
    constructor(target: HTMLElement) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      target.appendChild(svg);
    }
    resize = vi.fn();
    getContext = vi.fn(() => mockContext);

    static Backends = { SVG: 1 };
  }

  // Minimal stub with chainable/no-op methods
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
// Tests
// ---------------------------------------------------------------------------

describe('ScoreEngine', () => {
  let engine: ScoreEngine;
  let target: HTMLDivElement;

  beforeEach(() => {
    engine = new ScoreEngine();
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  it('ScoreData interface is exported', () => {
    // If the import above resolved, the interface is exported correctly.
    // We additionally verify a value conforming to the interface can be assigned.
    const data: ScoreData = { clef: 'treble', notes: [{ note: 'C4', duration: 'q' }] };
    expect(data).toBeDefined();
    expect(data.clef).toBe('treble');
    expect(data.notes).toHaveLength(1);
  });

  it('render clears target before rendering', () => {
    // Populate target with pre-existing content
    target.innerHTML = '<p>old content</p>';
    expect(target.innerHTML).toContain('old content');

    const scoreData: ScoreData = { clef: 'treble', notes: [{ note: 'C4', duration: 'q' }] };
    engine.render(scoreData, target);

    // The old <p> must be gone
    expect(target.querySelector('p')).toBeNull();
  });

  it('render injects an SVG element into target', () => {
    const scoreData: ScoreData = { clef: 'treble', notes: [{ note: 'C4', duration: 'q' }] };
    engine.render(scoreData, target);

    const svg = target.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('render accepts treble clef', () => {
    const scoreData: ScoreData = { clef: 'treble', notes: [{ note: 'E4', duration: 'q' }] };
    expect(() => engine.render(scoreData, target)).not.toThrow();
  });

  it('render accepts bass clef', () => {
    const scoreData: ScoreData = { clef: 'bass', notes: [{ note: 'G2', duration: 'h' }] };
    expect(() => engine.render(scoreData, target)).not.toThrow();
  });

  it('render handles multiple notes', () => {
    const scoreData: ScoreData = {
      clef: 'treble',
      notes: [
        { note: 'C4', duration: 'q' },
        { note: 'D4', duration: 'q' },
        { note: 'E4', duration: 'q' },
      ],
    };
    expect(() => engine.render(scoreData, target)).not.toThrow();
  });
});
