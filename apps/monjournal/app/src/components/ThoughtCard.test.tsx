import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThoughtCard } from './ThoughtCard';
import { Thought } from '../models/thoughtModel';

describe('ThoughtCard with Tags', () => {
  const mockThought: Thought = {
    id: '1',
    title: 'Test Thought',
    content: 'This is a test thought with some content to display.',
    createdAt: Date.now(),
    tags: ['work', 'important', 'personal'],
  };

  it('renders thought card with all tag labels', () => {
    render(<ThoughtCard thought={mockThought} />);
    
    expect(screen.getByText('Test Thought')).toBeInTheDocument();
    expect(screen.getByText('This is a test thought with some content to display.')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
  });

  it('renders tags as colored badges', () => {
    const { container } = render(<ThoughtCard thought={mockThought} />);
    const tagChips = container.querySelectorAll('.tag-chip');
    
    expect(tagChips).toHaveLength(3);
    tagChips.forEach((chip) => {
      const style = window.getComputedStyle(chip);
      expect(style.backgroundColor).toBeTruthy();
      expect(style.color).toBeTruthy();
    });
  });

  it('does not render tags section when thought has no tags', () => {
    const thoughtWithoutTags: Thought = {
      ...mockThought,
      tags: [],
    };
    
    const { container } = render(<ThoughtCard thought={thoughtWithoutTags} />);
    const tagDisplay = container.querySelector('.thought-card-tags');
    
    expect(tagDisplay).not.toBeInTheDocument();
  });

  it('truncates long content', () => {
    const longContent = 'A'.repeat(150);
    const thoughtWithLongContent: Thought = {
      ...mockThought,
      content: longContent,
    };
    
    render(<ThoughtCard thought={thoughtWithLongContent} />);
    const truncatedContent = screen.getByText(/^A+…$/);
    
    expect(truncatedContent).toBeInTheDocument();
    expect(truncatedContent.textContent?.length).toBeLessThan(longContent.length);
  });
});
