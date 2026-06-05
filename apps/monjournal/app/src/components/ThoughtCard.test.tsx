import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThoughtCard } from './ThoughtCard';
import { Thought } from '../models/types';
import * as dateFormatModule from '../utils/dateFormat';
import * as tagModelModule from '../models/tagModel';

// Mock dependencies
vi.mock('../utils/dateFormat', () => ({
  formatDate: vi.fn((timestamp: number, format: string) => {
    if (format === 'relative') {
      return '2 hours ago';
    }
    return 'June 4, 2026';
  }),
}));

vi.mock('../models/tagModel', () => ({
  getTagColor: vi.fn((tagName: string) => {
    const colors: { [key: string]: string } = {
      personal: '#FF6B6B',
      morning: '#4ECDC4',
      work: '#45B7D1',
    };
    return colors[tagName] || '#888888';
  }),
}));

// Mock TagDisplay component
vi.mock('./TagDisplay', () => ({
  TagDisplay: ({ tags, compact }: { tags: readonly string[]; compact?: boolean }) => (
    <div data-testid="tag-display" data-compact={compact}>
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  ),
}));

describe('ThoughtCard', () => {
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

  // Test 1: Basic rendering
  it('renders thought title, content, date, and tags', () => {
    const thought = createMockThought();
    render(<ThoughtCard thought={thought} />);

    expect(screen.getByText('Test Thought')).toBeInTheDocument();
    expect(screen.getByText('This is the content of the thought')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByTestId('tag-display')).toBeInTheDocument();
  });

  // Test 2: Content truncation - no ellipsis for short content
  it('does not truncate content less than 100 characters', () => {
    const shortContent = 'Short content';
    const thought = createMockThought({ content: shortContent });
    render(<ThoughtCard thought={thought} />);

    expect(screen.getByText(shortContent)).toBeInTheDocument();
  });

  // Test 3: Content truncation - ellipsis for long content
  it('truncates content longer than 100 characters with ellipsis', () => {
    const longContent = 'This is a very long content that will definitely exceed the 100 character limit and should be truncated with an ellipsis indicator for better readability in the card layout';
    const thought = createMockThought({ content: longContent });
    render(<ThoughtCard thought={thought} />);

    const contentElement = screen.getByText(/This is a very long content/);
    const displayedText = contentElement.textContent || '';
    
    // Check that it's truncated and has ellipsis
    expect(displayedText.length).toBeLessThan(longContent.length);
    expect(displayedText).toContain('…');
  });

  // Test 4: Content exactly at boundary
  it('handles content exactly at 100 character boundary', () => {
    const exactContent = 'a'.repeat(100);
    const thought = createMockThought({ content: exactContent });
    render(<ThoughtCard thought={thought} />);

    expect(screen.getByText(exactContent)).toBeInTheDocument();
  });

  // Test 5: Date formatting uses relative format
  it('formats date using relative format', () => {
    const thought = createMockThought();
    render(<ThoughtCard thought={thought} />);

    expect(dateFormatModule.formatDate).toHaveBeenCalledWith(thought.createdAt, 'relative');
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  // Test 6: Tags rendering with compact mode
  it('renders tags using TagDisplay component with compact=true', () => {
    const thought = createMockThought({ tags: ['personal', 'morning'] });
    render(<ThoughtCard thought={thought} />);

    const tagDisplay = screen.getByTestId('tag-display');
    expect(tagDisplay).toBeInTheDocument();
    expect(tagDisplay).toHaveAttribute('data-compact', 'true');
  });

  // Test 7: No tags renders without TagDisplay
  it('does not render TagDisplay when thought has no tags', () => {
    const thought = createMockThought({ tags: [] });
    const { container } = render(<ThoughtCard thought={thought} />);

    expect(screen.queryByTestId('tag-display')).not.toBeInTheDocument();
  });

  // Test 8: onHighlight callback
  it('calls onHighlight callback when card is clicked', async () => {
    const onHighlight = vi.fn();
    const thought = createMockThought();
    const user = userEvent.setup();
    
    render(<ThoughtCard thought={thought} onHighlight={onHighlight} />);
    
    const cardElement = screen.getByRole('article');
    await user.click(cardElement);

    expect(onHighlight).toHaveBeenCalledTimes(1);
  });

  // Test 9: onHighlight not called when callback is not provided
  it('does not crash when onHighlight callback is not provided', async () => {
    const thought = createMockThought();
    const user = userEvent.setup();
    
    render(<ThoughtCard thought={thought} />);
    
    const cardElement = screen.getByRole('article');
    await user.click(cardElement);

    // Should not throw an error
    expect(cardElement).toBeInTheDocument();
  });

  // Test 10: Highlight state styling
  it('applies highlight styling when isHighlighted is true', () => {
    const thought = createMockThought();
    const { rerender } = render(
      <ThoughtCard thought={thought} isHighlighted={false} />
    );
    
    let cardElement = screen.getByRole('article');
    expect(cardElement).toHaveClass('border-gray-200', 'bg-white');

    rerender(<ThoughtCard thought={thought} isHighlighted={true} />);
    cardElement = screen.getByRole('article');
    expect(cardElement).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  // Test 11: Hover state
  it('applies hover shadow transition classes', () => {
    const thought = createMockThought();
    render(<ThoughtCard thought={thought} />);

    const cardElement = screen.getByRole('article');
    expect(cardElement).toHaveClass('hover:shadow-md', 'transition-shadow', 'duration-150');
  });

  // Test 12: Title truncation for very long titles
  it('handles very long titles with line-clamp styling', () => {
    const longTitle = 'A'.repeat(200);
    const thought = createMockThought({ title: longTitle });
    render(<ThoughtCard thought={thought} />);

    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveClass('line-clamp-2');
  });

  // Test 13: Semantic HTML with role
  it('renders article element with proper semantic HTML', () => {
    const thought = createMockThought();
    render(<ThoughtCard thought={thought} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  // Test 14: Empty title and content
  it('renders card with empty title and content', () => {
    const thought = createMockThought({ title: '', content: '' });
    render(<ThoughtCard thought={thought} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  // Test 15: Multiple tags
  it('renders multiple tags correctly', () => {
    const thought = createMockThought({ tags: ['personal', 'morning', 'work', 'urgent'] });
    render(<ThoughtCard thought={thought} />);

    const tagDisplay = screen.getByTestId('tag-display');
    expect(tagDisplay).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('morning')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  // Test 16: Snapshot test
  it('renders card layout correctly (snapshot)', () => {
    const thought = createMockThought();
    const { container } = render(<ThoughtCard thought={thought} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  // Test 17: Special characters in content
  it('handles special characters in content correctly', () => {
    const specialContent = 'Content with <script>, &amp;, and "quotes" should work';
    const thought = createMockThought({ content: specialContent });
    render(<ThoughtCard thought={thought} />);

    expect(screen.getByText(specialContent)).toBeInTheDocument();
  });

  // Test 18: Keyboard accessibility
  it('card is clickable with keyboard (cursor-pointer)', () => {
    const thought = createMockThought();
    render(<ThoughtCard thought={thought} />);

    const cardElement = screen.getByRole('article');
    expect(cardElement).toHaveClass('cursor-pointer');
  });
});
