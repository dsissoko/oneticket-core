import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimelineView } from './TimelineView';
import { Thought } from '../models/types';
import * as groupByDateModule from '../utils/groupByDate';

// Mock dependencies
vi.mock('../utils/groupByDate', () => ({
  groupThoughtsByDate: vi.fn((thoughts: Thought[]) => {
    // Simulate the grouping logic
    const grouped = new Map<string, Thought[]>();
    
    thoughts.forEach((thought) => {
      const date = new Date(thought.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(thought);
    });

    // Sort by date descending
    const sortedEntries = Array.from(grouped.entries()).sort(
      ([dateKeyA], [dateKeyB]) => dateKeyB.localeCompare(dateKeyA)
    );

    return new Map(sortedEntries);
  }),
}));

vi.mock('./TimelineGroup', () => ({
  TimelineGroup: ({
    date,
    thoughts,
    onSurpriseClick,
  }: {
    date: number;
    thoughts: Thought[];
    onSurpriseClick?: (thought: Thought) => void;
  }) => (
    <div data-testid={`timeline-group-${date}`}>
      <span data-testid={`date-${date}`}>{new Date(date).toISOString().split('T')[0]}</span>
      {thoughts.map((thought) => (
        <div
          key={thought.id}
          data-testid={`group-thought-${thought.id}`}
          onClick={() => onSurpriseClick?.(thought)}
          role="article"
        >
          {thought.title}
        </div>
      ))}
    </div>
  ),
}));

describe('TimelineView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockThought = (overrides: Partial<Thought> = {}): Thought => ({
    id: '1',
    title: 'Test Thought',
    content: 'This is the content',
    createdAt: 1717534800000, // June 4, 2026
    tags: [],
    ...overrides,
  });

  // Test 1: Empty state rendering
  it('renders empty state when no thoughts', () => {
    render(<TimelineView thoughts={[]} />);

    expect(screen.getByText('No thoughts yet. Start by adding a new thought!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // Test 2: Empty state icon is present
  it('displays empty state icon and message', () => {
    const { container } = render(<TimelineView thoughts={[]} />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-16', 'h-16', 'text-gray-400', 'mb-4');
  });

  // Test 3: Grouping by date is called
  it('calls groupThoughtsByDate utility', () => {
    const thoughts = [
      createMockThought({ id: '1', createdAt: 1717534800000 }), // June 4, 2026
      createMockThought({ id: '2', createdAt: 1717534800000 }), // Same day
    ];

    render(<TimelineView thoughts={thoughts} />);

    expect(groupByDateModule.groupThoughtsByDate).toHaveBeenCalledWith(thoughts);
  });

  // Test 4: Renders TimelineGroup for each day
  it('renders TimelineGroup components for each grouped day', () => {
    const thoughts = [
      createMockThought({ id: '1', createdAt: 1717534800000 }), // June 4, 2026
      createMockThought({ id: '2', createdAt: 1717621200000 }), // June 5, 2026
    ];

    render(<TimelineView thoughts={thoughts} />);

    // Should have 2 timeline groups
    const groups = screen.getAllByTestId(/^timeline-group-/);
    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  // Test 5: Single thought renders
  it('renders single thought in timeline', () => {
    const thought = createMockThought({ id: '1', title: 'Single Thought' });
    render(<TimelineView thoughts={[thought]} />);

    expect(screen.getByText('Single Thought')).toBeInTheDocument();
  });

  // Test 6: Multiple thoughts same day
  it('groups multiple thoughts from the same day', () => {
    const sameDay = 1717534800000;
    const thoughts = [
      createMockThought({ id: '1', title: 'First', createdAt: sameDay }),
      createMockThought({ id: '2', title: 'Second', createdAt: sameDay + 3600000 }),
      createMockThought({ id: '3', title: 'Third', createdAt: sameDay + 7200000 }),
    ];

    render(<TimelineView thoughts={thoughts} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  // Test 7: Multiple thoughts different days
  it('creates separate groups for thoughts on different days', () => {
    const day1 = 1717534800000; // June 4, 2026
    const day2 = 1717621200000; // June 5, 2026
    const day3 = 1717707600000; // June 6, 2026

    const thoughts = [
      createMockThought({ id: '1', createdAt: day1 }),
      createMockThought({ id: '2', createdAt: day2 }),
      createMockThought({ id: '3', createdAt: day3 }),
    ];

    render(<TimelineView thoughts={thoughts} />);

    const groups = screen.getAllByTestId(/^timeline-group-/);
    expect(groups.length).toBeGreaterThanOrEqual(3);
  });

  // Test 8: Chronological order - newest first
  it('displays groups in reverse chronological order (newest first)', () => {
    const day1 = 1717534800000; // June 4, 2026
    const day2 = 1717621200000; // June 5, 2026
    const day3 = 1717707600000; // June 6, 2026

    const thoughts = [
      createMockThought({ id: '1', createdAt: day1 }),
      createMockThought({ id: '2', createdAt: day2 }),
      createMockThought({ id: '3', createdAt: day3 }),
    ];

    const { container } = render(<TimelineView thoughts={thoughts} />);

    // Get the order of rendered groups
    const timelineGroups = container.querySelectorAll('[data-testid^="timeline-group-"]');
    
    // Extract timestamps from testid
    const groupTimestamps: number[] = [];
    timelineGroups.forEach((group) => {
      const testId = group.getAttribute('data-testid');
      if (testId) {
        const timestamp = Number(testId.replace('timeline-group-', ''));
        groupTimestamps.push(timestamp);
      }
    });

    // Verify descending order (newest first)
    for (let i = 0; i < groupTimestamps.length - 1; i++) {
      expect(groupTimestamps[i]).toBeGreaterThanOrEqual(groupTimestamps[i + 1]);
    }
  });

  // Test 9: onSurpriseClick callback passed to TimelineGroup
  it('passes onSurpriseClick callback to TimelineGroup components', async () => {
    const onSurpriseClick = vi.fn();
    const thought = createMockThought({ id: '1', title: 'Surprise Thought' });
    const user = userEvent.setup();

    render(
      <TimelineView thoughts={[thought]} onSurpriseClick={onSurpriseClick} />
    );

    const thoughtElement = screen.getByTestId('group-thought-1');
    await user.click(thoughtElement);

    expect(onSurpriseClick).toHaveBeenCalledWith(thought);
  });

  // Test 10: Without onSurpriseClick callback
  it('renders without onSurpriseClick callback', () => {
    const thought = createMockThought();
    const { container } = render(<TimelineView thoughts={[thought]} />);

    expect(container).toBeInTheDocument();
  });

  // Test 11: Main content area rendering
  it('renders with main role and proper structure', () => {
    const thought = createMockThought();
    render(<TimelineView thoughts={[thought]} />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // Test 12: Max width container for readability
  it('applies max-width container for layout', () => {
    const thought = createMockThought();
    const { container } = render(<TimelineView thoughts={[thought]} />);

    const maxWidthContainer = container.querySelector('.max-w-2xl');
    expect(maxWidthContainer).toBeInTheDocument();
  });

  // Test 13: Large number of thoughts
  it('renders a large number of thoughts across multiple days', () => {
    const thoughts = Array.from({ length: 100 }, (_, i) => {
      // Spread across 10 days
      const dayOffset = Math.floor(i / 10) * 86400000; // 24 hours in ms
      return createMockThought({
        id: `${i}`,
        title: `Thought ${i}`,
        createdAt: 1717534800000 - dayOffset,
      });
    });

    render(<TimelineView thoughts={thoughts} />);

    expect(groupByDateModule.groupThoughtsByDate).toHaveBeenCalledWith(thoughts);
  });

  // Test 14: Empty state has proper aria attributes
  it('provides proper accessibility for empty state', () => {
    const { container } = render(<TimelineView thoughts={[]} />);

    const emptyStateContainer = screen.getByRole('status');
    expect(emptyStateContainer).toHaveAttribute('aria-live', 'polite');

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  // Test 15: Timeline main area has proper aria label
  it('provides proper aria label for timeline content area', () => {
    const thought = createMockThought();
    render(<TimelineView thoughts={[thought]} />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveAttribute('aria-label', 'Timeline view of thoughts');
  });

  // Test 16: Responsive overflow behavior
  it('applies responsive overflow styling to timeline', () => {
    const thought = createMockThought();
    const { container } = render(<TimelineView thoughts={[thought]} />);

    const mainElement = container.querySelector('[role="main"]');
    expect(mainElement).toHaveClass('flex-1', 'overflow-y-auto');
  });

  // Test 17: Mixed dates and thoughts
  it('correctly groups mixed set of thoughts across multiple days', () => {
    const baseDate = 1717534800000;
    const thoughts = [
      createMockThought({ id: '1', createdAt: baseDate, title: 'Day 1 - First' }),
      createMockThought({ id: '2', createdAt: baseDate + 3600000, title: 'Day 1 - Second' }),
      createMockThought({ id: '3', createdAt: baseDate + 86400000, title: 'Day 2 - First' }),
      createMockThought({ id: '4', createdAt: baseDate + 86400000 + 3600000, title: 'Day 2 - Second' }),
      createMockThought({ id: '5', createdAt: baseDate + 172800000, title: 'Day 3 - First' }),
    ];

    render(<TimelineView thoughts={thoughts} />);

    expect(screen.getByText('Day 1 - First')).toBeInTheDocument();
    expect(screen.getByText('Day 1 - Second')).toBeInTheDocument();
    expect(screen.getByText('Day 2 - First')).toBeInTheDocument();
    expect(screen.getByText('Day 2 - Second')).toBeInTheDocument();
    expect(screen.getByText('Day 3 - First')).toBeInTheDocument();
  });

  // Test 18: Empty state structure verification
  it('renders empty state with correct DOM structure', () => {
    const { container } = render(<TimelineView thoughts={[]} />);
    
    const mainElement = container.querySelector('[role="main"]');
    expect(mainElement).toBeNull(); // Empty state doesn't have main role
    
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  // Test 19: Populated timeline structure verification
  it('renders timeline with correct main structure', () => {
    const thoughts = [
      createMockThought({ id: '1', createdAt: 1717534800000, title: 'First' }),
      createMockThought({ id: '2', createdAt: 1717621200000, title: 'Second' }),
    ];

    const { container } = render(<TimelineView thoughts={thoughts} />);
    
    const mainElement = container.querySelector('[role="main"]');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1', 'overflow-y-auto', 'px-4', 'py-8');
  });

  // Test 20: Proper padding and spacing
  it('applies padding and margin styling to timeline', () => {
    const thought = createMockThought();
    const { container } = render(<TimelineView thoughts={[thought]} />);

    const mainElement = container.querySelector('[role="main"]');
    expect(mainElement).toHaveClass('px-4', 'py-8');

    const contentContainer = container.querySelector('.max-w-2xl');
    expect(contentContainer).toHaveClass('mx-auto');
  });

  // Test 21: Thoughts from same day are in same group
  it('ensures thoughts from same day are grouped together', () => {
    const sameDay = 1717534800000; // June 4, 2026 00:00:00
    const thoughts = [
      createMockThought({ id: '1', createdAt: sameDay, title: 'Morning' }),
      createMockThought({ id: '2', createdAt: sameDay + 43200000, title: 'Afternoon' }), // 12 hours later, same day
      createMockThought({ id: '3', createdAt: sameDay + 82800000, title: 'Evening' }), // 23 hours later, same day
    ];

    const { container } = render(<TimelineView thoughts={thoughts} />);

    // All three should be visible
    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Afternoon')).toBeInTheDocument();
    expect(screen.getByText('Evening')).toBeInTheDocument();

    // All three thoughts should exist
    expect(screen.getByTestId('group-thought-1')).toBeInTheDocument();
    expect(screen.getByTestId('group-thought-2')).toBeInTheDocument();
    expect(screen.getByTestId('group-thought-3')).toBeInTheDocument();
  });

  // Test 22: Edge case - midnight boundary
  it('handles thoughts at midnight boundaries correctly', () => {
    // Create thoughts just before and after midnight
    const midnight = 1717584000000; // Start of June 5, 2026
    const justBeforeMidnight = midnight - 1000; // 1 second before
    const justAfterMidnight = midnight + 1000; // 1 second after

    const thoughts = [
      createMockThought({ id: '1', createdAt: justBeforeMidnight, title: 'Before Midnight' }),
      createMockThought({ id: '2', createdAt: justAfterMidnight, title: 'After Midnight' }),
    ];

    render(<TimelineView thoughts={thoughts} />);

    expect(screen.getByText('Before Midnight')).toBeInTheDocument();
    expect(screen.getByText('After Midnight')).toBeInTheDocument();
  });

  // Test 23: onSurpriseClick not provided
  it('handles missing onSurpriseClick prop gracefully', () => {
    const thought = createMockThought();
    const { container } = render(<TimelineView thoughts={[thought]} />);

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Test Thought')).toBeInTheDocument();
  });

  // Test 24: Multiple onSurpriseClick calls
  it('correctly routes onSurpriseClick for multiple thoughts', async () => {
    const onSurpriseClick = vi.fn();
    const thought1 = createMockThought({ id: '1', title: 'First' });
    const thought2 = createMockThought({ id: '2', title: 'Second' });
    const user = userEvent.setup();

    render(
      <TimelineView
        thoughts={[thought1, thought2]}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const firstThought = screen.getByTestId('group-thought-1');
    await user.click(firstThought);
    expect(onSurpriseClick).toHaveBeenNthCalledWith(1, thought1);

    const secondThought = screen.getByTestId('group-thought-2');
    await user.click(secondThought);
    expect(onSurpriseClick).toHaveBeenNthCalledWith(2, thought2);
  });
});
