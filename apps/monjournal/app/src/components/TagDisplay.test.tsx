import React from 'react';
import { screen, render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagDisplay } from './TagDisplay';
import * as tagModel from '../models/tagModel';

// Mock the tagModel.getTagColor function
vi.mock('../models/tagModel', () => ({
  getTagColor: vi.fn((tagName: string) => {
    // Deterministic colors for testing
    const colors: { [key: string]: string } = {
      personal: '#FF6B6B',
      morning: '#4ECDC4',
      work: '#45B7D1',
    };
    return colors[tagName] || '#888888';
  }),
}));

describe('TagDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tags from the input array', () => {
    const tags = ['personal', 'morning', 'work'];
    render(<TagDisplay tags={tags} />);

    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('morning')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  it('calls getTagColor for each tag', () => {
    const tags = ['personal', 'morning'];
    render(<TagDisplay tags={tags} />);

    expect(tagModel.getTagColor).toHaveBeenCalledWith('personal');
    expect(tagModel.getTagColor).toHaveBeenCalledWith('morning');
    expect(tagModel.getTagColor).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when tags array is empty', () => {
    const { container } = render(<TagDisplay tags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when tags is undefined', () => {
    const { container } = render(<TagDisplay tags={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies normal padding when compact is false', () => {
    render(<TagDisplay tags={['personal']} compact={false} />);
    const chip = screen.getByText('personal').closest('span');
    expect(chip).toHaveClass('px-3', 'py-2', 'text-sm');
  });

  it('applies compact padding when compact is true', () => {
    render(<TagDisplay tags={['personal']} compact={true} />);
    const chip = screen.getByText('personal').closest('span');
    expect(chip).toHaveClass('px-2', 'py-1', 'text-xs');
  });

  it('applies background color from getTagColor', () => {
    render(<TagDisplay tags={['personal']} />);
    const chip = screen.getByText('personal').closest('span');
    expect(chip).toHaveStyle({ backgroundColor: '#FF6B6B' });
  });

  it('applies correct text color based on background brightness', () => {
    // #FF6B6B (red) has luminance ~0.593 (> 0.5), so it's light -> use black text
    render(<TagDisplay tags={['personal']} />);
    const chip = screen.getByText('personal').closest('span');
    expect(chip).toHaveStyle({ color: '#000000' }); // Black text on light red background
  });

  it('applies consistent gap spacing in non-compact mode', () => {
    render(<TagDisplay tags={['personal', 'morning']} compact={false} />);
    const container = screen.getByText('personal').closest('div');
    expect(container).toHaveClass('gap-2');
  });

  it('applies compact gap spacing in compact mode', () => {
    render(<TagDisplay tags={['personal', 'morning']} compact={true} />);
    const container = screen.getByText('personal').closest('div');
    expect(container).toHaveClass('gap-1');
  });

  it('renders chips with rounded corners and hover state', () => {
    render(<TagDisplay tags={['personal']} />);
    const chip = screen.getByText('personal').closest('span');
    expect(chip).toHaveClass('rounded-md', 'transition-colors', 'duration-150');
  });

  it('sets title attribute for accessibility', () => {
    render(<TagDisplay tags={['personal']} />);
    const chip = screen.getByText('personal');
    expect(chip).toHaveAttribute('title', 'personal');
  });

  it('handles multiple tags with different colors', () => {
    const tags = ['personal', 'morning', 'work'];
    render(<TagDisplay tags={tags} />);

    const personalChip = screen.getByText('personal').closest('span');
    const morningChip = screen.getByText('morning').closest('span');
    const workChip = screen.getByText('work').closest('span');

    expect(personalChip).toHaveStyle({ backgroundColor: '#FF6B6B' });
    expect(morningChip).toHaveStyle({ backgroundColor: '#4ECDC4' });
    expect(workChip).toHaveStyle({ backgroundColor: '#45B7D1' });
  });
});
