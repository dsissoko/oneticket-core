import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThoughtList } from './ThoughtList';
import { Thought } from '../models/types';

// Mock ThoughtCard component
vi.mock('./ThoughtCard', () => ({
  ThoughtCard: ({ thought, onHighlight }: { thought: Thought; onHighlight?: () => void }) => (
    <div data-testid={`thought-card-${thought.id}`} onClick={onHighlight}>
      <div className="title">{thought.title}</div>
      <div className="content">{thought.content}</div>
      <div className="date">{thought.createdAt}</div>
      <div className="tags">{thought.tags.join(', ')}</div>
    </div>
  ),
}));

describe('ThoughtList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockThought = (overrides: Partial<Thought> = {}): Thought => ({
    id: '1',
    title: 'Test Thought',
    content: 'This is the content of the thought',
    createdAt: 1717534800000, // June 4, 2026
    tags: ['personal', 'morning'],
    ...overrides,
  });

  // Test 1: Render with 0 thoughts (empty state)
  it('renders empty state message when no thoughts are provided', () => {
    render(<ThoughtList thoughts={[]} />);

    expect(screen.getByText('No thoughts yet. Start by adding a new thought!')).toBeInTheDocument();
  });

  // Test 2: Render with 1 thought
  it('renders a single ThoughtCard when one thought is provided', () => {
    const thought = createMockThought();
    render(<ThoughtList thoughts={[thought]} />);

    expect(screen.getByTestId('thought-card-1')).toBeInTheDocument();
    expect(screen.getByText('Test Thought')).toBeInTheDocument();
  });

  // Test 3: Render with 5+ thoughts
  it('renders multiple ThoughtCard components for 5+ thoughts', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'Thought 1', createdAt: 1717534800000 }),
      createMockThought({ id: '2', title: 'Thought 2', createdAt: 1717534700000 }),
      createMockThought({ id: '3', title: 'Thought 3', createdAt: 1717534600000 }),
      createMockThought({ id: '4', title: 'Thought 4', createdAt: 1717534500000 }),
      createMockThought({ id: '5', title: 'Thought 5', createdAt: 1717534400000 }),
    ];
    render(<ThoughtList thoughts={thoughts} />);

    expect(screen.getByTestId('thought-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-4')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-5')).toBeInTheDocument();

    expect(screen.getByText('Thought 1')).toBeInTheDocument();
    expect(screen.getByText('Thought 2')).toBeInTheDocument();
    expect(screen.getByText('Thought 3')).toBeInTheDocument();
    expect(screen.getByText('Thought 4')).toBeInTheDocument();
    expect(screen.getByText('Thought 5')).toBeInTheDocument();
  });

  // Test 4: Verify empty state when thoughts.length === 0
  it('shows empty state and does not render any cards when thoughts array is empty', () => {
    const { container } = render(<ThoughtList thoughts={[]} />);

    expect(screen.getByText('No thoughts yet. Start by adding a new thought!')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid^="thought-card-"]')).toHaveLength(0);
  });

  // Test 5: Sort order - descending by createdAt (most recent first)
  it('sorts thoughts by createdAt in descending order (most recent first)', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'Oldest', createdAt: 1717534400000 }),
      createMockThought({ id: '2', title: 'Middle', createdAt: 1717534600000 }),
      createMockThought({ id: '3', title: 'Newest', createdAt: 1717534800000 }),
    ];
    const { container } = render(<ThoughtList thoughts={thoughts} />);

    const cards = container.querySelectorAll('[data-testid^="thought-card-"]');
    expect(cards).toHaveLength(3);

    // Most recent (Newest) should be first in the DOM
    expect(cards[0]).toHaveAttribute('data-testid', 'thought-card-3');
    // Middle should be second
    expect(cards[1]).toHaveAttribute('data-testid', 'thought-card-2');
    // Oldest should be last
    expect(cards[2]).toHaveAttribute('data-testid', 'thought-card-1');
  });

  // Test 6: Verify ThoughtCard rendered for each thought
  it('renders a ThoughtCard component for each thought', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'Thought 1' }),
      createMockThought({ id: '2', title: 'Thought 2' }),
      createMockThought({ id: '3', title: 'Thought 3' }),
    ];
    render(<ThoughtList thoughts={thoughts} />);

    expect(screen.getByTestId('thought-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('thought-card-3')).toBeInTheDocument();
  });

  // Test 7: Verify onSurpriseClick passed to cards
  it('passes onSurpriseClick callback to ThoughtCard components', async () => {
    const onSurpriseClick = vi.fn();
    const thought = createMockThought({ id: '1' });
    const user = userEvent.setup();

    render(<ThoughtList thoughts={[thought]} onSurpriseClick={onSurpriseClick} />);

    const card = screen.getByTestId('thought-card-1');
    await user.click(card);

    expect(onSurpriseClick).toHaveBeenCalledWith(thought);
    expect(onSurpriseClick).toHaveBeenCalledTimes(1);
  });

  // Test 8: onSurpriseClick not called when callback not provided
  it('works without onSurpriseClick callback', () => {
    const thought = createMockThought();
    const { container } = render(<ThoughtList thoughts={[thought]} />);

    expect(screen.getByTestId('thought-card-1')).toBeInTheDocument();
    expect(container.querySelector('[role="list"]')).toBeInTheDocument();
  });

  // Test 9: Accessibility - ul with role="list"
  it('uses semantic HTML with ul and li elements for list accessibility', () => {
    const thoughts = [
      createMockThought({ id: '1' }),
      createMockThought({ id: '2' }),
    ];
    const { container } = render(<ThoughtList thoughts={thoughts} />);

    expect(container.querySelector('ul[role="list"]')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  // Test 10: Flex layout and responsive spacing
  it('applies flex layout and responsive spacing classes', () => {
    const thought = createMockThought();
    const { container } = render(<ThoughtList thoughts={[thought]} />);

    const ul = container.querySelector('ul');
    expect(ul).toHaveClass('space-y-4', 'p-4');
  });

  // Test 11: Multiple thoughts with onSurpriseClick
  it('passes correct thought data when onSurpriseClick is called for different thoughts', async () => {
    const onSurpriseClick = vi.fn();
    const thoughts = [
      createMockThought({ id: '1', title: 'First', createdAt: 1717534800000 }),
      createMockThought({ id: '2', title: 'Second', createdAt: 1717534700000 }),
    ];
    const user = userEvent.setup();

    render(<ThoughtList thoughts={thoughts} onSurpriseClick={onSurpriseClick} />);

    // Click first card (which should be the most recent one due to sorting)
    const card1 = screen.getByTestId('thought-card-1');
    await user.click(card1);
    expect(onSurpriseClick).toHaveBeenCalledWith(thoughts[0]);

    // Click second card
    const card2 = screen.getByTestId('thought-card-2');
    await user.click(card2);
    expect(onSurpriseClick).toHaveBeenCalledWith(thoughts[1]);
  });

  // Test 12: Empty state centering and styling
  it('centers empty state message with appropriate styling', () => {
    const { container } = render(<ThoughtList thoughts={[]} />);

    const emptyStateDiv = container.querySelector('.flex.items-center.justify-center');
    expect(emptyStateDiv).toBeInTheDocument();
    expect(emptyStateDiv).toHaveClass('py-12', 'px-4');

    const emptyStateText = screen.getByText('No thoughts yet. Start by adding a new thought!');
    expect(emptyStateText).toHaveClass('text-center', 'text-gray-500', 'text-lg');
  });

  // Test 13: Snapshot test with multiple thoughts
  it('renders list layout correctly (snapshot)', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'Thought 1', createdAt: 1717534800000 }),
      createMockThought({ id: '2', title: 'Thought 2', createdAt: 1717534700000 }),
    ];
    const { container } = render(<ThoughtList thoughts={thoughts} />);

    expect(container.querySelector('ul')).toMatchSnapshot();
  });

  // Test 14: List preserves order across re-renders
  it('maintains sort order when thoughts prop changes', () => {
    const thoughts1 = [
      createMockThought({ id: '1', title: 'Thought 1', createdAt: 1717534400000 }),
      createMockThought({ id: '2', title: 'Thought 2', createdAt: 1717534600000 }),
    ];
    const { rerender, container } = render(<ThoughtList thoughts={thoughts1} />);

    let cards = container.querySelectorAll('[data-testid^="thought-card-"]');
    expect(cards[0]).toHaveAttribute('data-testid', 'thought-card-2'); // Most recent first
    expect(cards[1]).toHaveAttribute('data-testid', 'thought-card-1');

    const thoughts2 = [
      createMockThought({ id: '1', title: 'Thought 1', createdAt: 1717534400000 }),
      createMockThought({ id: '2', title: 'Thought 2', createdAt: 1717534600000 }),
      createMockThought({ id: '3', title: 'Thought 3', createdAt: 1717534800000 }),
    ];
    rerender(<ThoughtList thoughts={thoughts2} />);

    cards = container.querySelectorAll('[data-testid^="thought-card-"]');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute('data-testid', 'thought-card-3'); // Newest
    expect(cards[1]).toHaveAttribute('data-testid', 'thought-card-2');
    expect(cards[2]).toHaveAttribute('data-testid', 'thought-card-1'); // Oldest
  });

  // Test 15: Thoughts don't mutate original array
  it('does not mutate the original thoughts array when sorting', () => {
    const thoughts = [
      createMockThought({ id: '1', title: 'Thought 1', createdAt: 1717534400000 }),
      createMockThought({ id: '2', title: 'Thought 2', createdAt: 1717534600000 }),
    ];
    const originalThoughts = [...thoughts];

    render(<ThoughtList thoughts={thoughts} />);

    // Verify original array structure is unchanged
    expect(thoughts[0].id).toBe('1');
    expect(thoughts[1].id).toBe('2');
    expect(thoughts).toEqual(originalThoughts);
  });
});
