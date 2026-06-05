import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimelineGroup } from './TimelineGroup';
import { Thought } from '../models/types';
import * as dateFormatModule from '../utils/dateFormat';

// Mock dependencies
vi.mock('../utils/dateFormat', () => ({
  formatDate: vi.fn((timestamp: number, format: string) => {
    if (format === 'absolute') {
      return 'June 4, 2026';
    }
    return '2 hours ago';
  }),
}));

vi.mock('./ThoughtCard', () => ({
  ThoughtCard: ({
    thought,
    onHighlight,
  }: {
    thought: Thought;
    onHighlight?: () => void;
  }) => (
    <div
      data-testid={`thought-card-${thought.id}`}
      onClick={onHighlight}
      role="article"
    >
      <h3>{thought.title}</h3>
      <p>{thought.content}</p>
    </div>
  ),
}));

describe('TimelineGroup', () => {
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

  // Test 1: Basic rendering with date separator
  it('renders day separator with formatted date', () => {
    const date = 1717534800000;
    const thoughts = [createMockThought()];
    render(
      <TimelineGroup date={date} thoughts={thoughts} />
    );

    expect(screen.getByText('June 4, 2026')).toBeInTheDocument();
    expect(dateFormatModule.formatDate).toHaveBeenCalledWith(date, 'absolute');
  });

  // Test 2: Render multiple thoughts for the day
  it('renders all thoughts for the day', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'First Thought' }),
      createMockThought({ id: '2', title: 'Second Thought' }),
      createMockThought({ id: '3', title: 'Third Thought' }),
    ];

    render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    expect(screen.getByText('First Thought')).toBeInTheDocument();
    expect(screen.getByText('Second Thought')).toBeInTheDocument();
    expect(screen.getByText('Third Thought')).toBeInTheDocument();
  });

  // Test 3: Render with single thought
  it('renders single thought for the day', () => {
    const thought = createMockThought({ id: '1', title: 'Single Thought' });
    render(
      <TimelineGroup date={1717534800000} thoughts={[thought]} />
    );

    expect(screen.getByText('Single Thought')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-1')).toBeInTheDocument();
  });

  // Test 4: Render with empty thoughts array
  it('renders with empty thoughts array', () => {
    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={[]} />
    );

    // Should still render the separator header
    expect(screen.getByText('June 4, 2026')).toBeInTheDocument();
    // But no thought cards
    expect(container.querySelectorAll('[data-testid^="thought-card-"]')).toHaveLength(0);
  });

  // Test 5: Horizontal line separator styling
  it('renders horizontal lines around date separator', () => {
    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={[createMockThought()]} />
    );

    // Look for the flex container with horizontal lines
    const separatorDiv = container.querySelector('.flex.items-center.gap-4');
    expect(separatorDiv).toBeInTheDocument();

    // Check for horizontal lines (h-px bg-gray-300)
    const lines = separatorDiv?.querySelectorAll('.h-px.bg-gray-300');
    expect(lines).toHaveLength(2);
  });

  // Test 6: Date label is centered with proper styling
  it('renders date label with centered styling', () => {
    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={[createMockThought()]} />
    );

    const dateLabel = screen.getByText('June 4, 2026');
    expect(dateLabel).toHaveClass('text-sm', 'font-semibold', 'text-gray-600', 'px-2', 'whitespace-nowrap');
  });

  // Test 7: onSurpriseClick callback is called
  it('calls onSurpriseClick callback when thought is clicked', async () => {
    const onSurpriseClick = vi.fn();
    const thought = createMockThought({ id: '1', title: 'Surprise Thought' });
    const user = userEvent.setup();

    render(
      <TimelineGroup
        date={1717534800000}
        thoughts={[thought]}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const thoughtCard = screen.getByTestId('thought-card-1');
    await user.click(thoughtCard);

    expect(onSurpriseClick).toHaveBeenCalledWith(thought);
  });

  // Test 8: onSurpriseClick not called when callback not provided
  it('does not crash when onSurpriseClick callback is not provided', async () => {
    const thought = createMockThought({ id: '1', title: 'No Surprise Thought' });
    const user = userEvent.setup();

    render(
      <TimelineGroup
        date={1717534800000}
        thoughts={[thought]}
      />
    );

    const thoughtCard = screen.getByTestId('thought-card-1');
    await user.click(thoughtCard);

    // Should not throw an error
    expect(thoughtCard).toBeInTheDocument();
  });

  // Test 9: Multiple thoughts with same day
  it('renders multiple thoughts in order', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'First' }),
      createMockThought({ id: '2', title: 'Second' }),
      createMockThought({ id: '3', title: 'Third' }),
    ];

    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    const thoughtCards = container.querySelectorAll('[data-testid^="thought-card-"]');
    expect(thoughtCards).toHaveLength(3);
  });

  // Test 10: Different dates format correctly
  it('formats different dates with absolute format', () => {
    const date1 = 1717534800000; // Some timestamp
    const date2 = 1717621200000; // Different timestamp

    const { rerender } = render(
      <TimelineGroup date={date1} thoughts={[createMockThought()]} />
    );

    expect(dateFormatModule.formatDate).toHaveBeenCalledWith(date1, 'absolute');

    rerender(
      <TimelineGroup date={date2} thoughts={[createMockThought()]} />
    );

    expect(dateFormatModule.formatDate).toHaveBeenCalledWith(date2, 'absolute');
  });

  // Test 11: Space between thoughts (responsive spacing)
  it('applies spacing between thought cards', () => {
    const thoughts = [
      createMockThought({ id: '1' }),
      createMockThought({ id: '2' }),
    ];

    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    // Look for the container with space-y-3 class
    const spacingContainer = container.querySelector('.space-y-3');
    expect(spacingContainer).toBeInTheDocument();
  });

  // Test 12: Container margin bottom
  it('applies margin bottom to container', () => {
    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={[createMockThought()]} />
    );

    // The outer div should have mb-8
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass('mb-8');
  });

  // Test 13: Multiple onSurpriseClick callbacks for different thoughts
  it('calls onSurpriseClick with correct thought when multiple thoughts present', async () => {
    const onSurpriseClick = vi.fn();
    const thought1 = createMockThought({ id: '1', title: 'First' });
    const thought2 = createMockThought({ id: '2', title: 'Second' });
    const user = userEvent.setup();

    render(
      <TimelineGroup
        date={1717534800000}
        thoughts={[thought1, thought2]}
        onSurpriseClick={onSurpriseClick}
      />
    );

    // Click first card
    const firstCard = screen.getByTestId('thought-card-1');
    await user.click(firstCard);
    expect(onSurpriseClick).toHaveBeenNthCalledWith(1, thought1);

    // Click second card
    const secondCard = screen.getByTestId('thought-card-2');
    await user.click(secondCard);
    expect(onSurpriseClick).toHaveBeenNthCalledWith(2, thought2);
  });

  // Test 14: Render with thoughts with different IDs
  it('uses thought ID as unique key for rendering', () => {
    const thoughts = [
      createMockThought({ id: 'unique-1', title: 'Thought 1' }),
      createMockThought({ id: 'unique-2', title: 'Thought 2' }),
      createMockThought({ id: 'unique-3', title: 'Thought 3' }),
    ];

    render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    expect(screen.getByTestId('thought-card-unique-1')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-unique-2')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-unique-3')).toBeInTheDocument();
  });

  // Test 15: Padding and responsive styling
  it('applies responsive padding to thoughts container', () => {
    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={[createMockThought()]} />
    );

    const thoughtsContainer = container.querySelector('.space-y-3');
    expect(thoughtsContainer).toHaveClass('px-2');
  });

  // Test 16: Container structure verification
  it('renders TimelineGroup with correct container structure', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'Thought 1' }),
      createMockThought({ id: '2', title: 'Thought 2' }),
    ];

    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    // Check outer container has mb-8 class
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('mb-8');
    expect(outerDiv.children.length).toBeGreaterThan(0);
  });

  // Test 17: Thoughts are rendered in the correct order
  it('maintains thought order from input array', () => {
    const thoughts = [
      createMockThought({ id: '3', title: 'Third' }),
      createMockThought({ id: '1', title: 'First' }),
      createMockThought({ id: '2', title: 'Second' }),
    ];

    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    const thoughtCards = container.querySelectorAll('[data-testid^="thought-card-"]');
    // Order should be 3, 1, 2 as passed in
    expect(thoughtCards[0]).toHaveAttribute('data-testid', 'thought-card-3');
    expect(thoughtCards[1]).toHaveAttribute('data-testid', 'thought-card-1');
    expect(thoughtCards[2]).toHaveAttribute('data-testid', 'thought-card-2');
  });

  // Test 18: Empty thoughts don't render thought cards
  it('renders separator but no thought cards when thoughts array is empty', () => {
    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={[]} />
    );

    // Separator should exist
    expect(screen.getByText('June 4, 2026')).toBeInTheDocument();

    // But no thought cards
    const thoughtCards = container.querySelectorAll('[data-testid^="thought-card-"]');
    expect(thoughtCards).toHaveLength(0);
  });

  // Test 19: Large number of thoughts
  it('renders a large number of thoughts without issues', () => {
    const thoughts = Array.from({ length: 50 }, (_, i) =>
      createMockThought({ id: `${i}`, title: `Thought ${i}` })
    );

    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    const thoughtCards = container.querySelectorAll('[data-testid^="thought-card-"]');
    expect(thoughtCards).toHaveLength(50);
  });

  // Test 20: Semantic HTML structure
  it('maintains proper semantic HTML with article role on thoughts', () => {
    const thoughts = [createMockThought({ id: '1' })];
    const { container } = render(
      <TimelineGroup date={1717534800000} thoughts={thoughts} />
    );

    const thoughtCard = container.querySelector('[role="article"]');
    expect(thoughtCard).toBeInTheDocument();
  });
});
