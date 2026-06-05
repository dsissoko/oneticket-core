import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThoughtCard } from './ThoughtCard';
import { createThought } from '../models/thoughtModel';

describe('ThoughtCard', () => {
  let mockThought = createThought(
    'Test Thought',
    'This is a test thought content that should be displayed in the card.',
    ['work', 'urgent']
  );

  beforeEach(() => {
    // Create a fresh thought for each test with a stable timestamp
    const stableTimestamp = new Date('2026-06-04T12:00:00Z').getTime();
    mockThought = {
      id: 'test-id-123',
      title: 'Test Thought',
      content:
        'This is a test thought content that should be displayed in the card.',
      createdAt: stableTimestamp,
      tags: ['work', 'urgent'],
    };
  });

  describe('rendering', () => {
    it('renders the thought card with correct title', () => {
      render(<ThoughtCard thought={mockThought} />);

      const title = screen.getByText('Test Thought');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
    });

    it('renders the thought content', () => {
      render(<ThoughtCard thought={mockThought} />);

      const content = screen.getByText(
        'This is a test thought content that should be displayed in the card.'
      );
      expect(content).toBeInTheDocument();
    });

    it('renders the thought card with data-testid', () => {
      render(<ThoughtCard thought={mockThought} />);

      const card = screen.getByTestId('thought-card');
      expect(card).toBeInTheDocument();
    });

    it('renders as article role for semantic HTML', () => {
      render(<ThoughtCard thought={mockThought} />);

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });
  });

  describe('content truncation', () => {
    it('does not truncate content shorter than 100 characters', () => {
      const shortContent = 'Short content';
      const thought = {
        ...mockThought,
        content: shortContent,
      };

      render(<ThoughtCard thought={thought} />);

      expect(screen.getByText(shortContent)).toBeInTheDocument();
    });

    it('truncates content longer than 100 characters with ellipsis', () => {
      const longContent =
        'This is a very long thought content that definitely exceeds one hundred characters and should be truncated with an ellipsis';
      const thought = {
        ...mockThought,
        content: longContent,
      };

      render(<ThoughtCard thought={thought} />);

      // Should render truncated content (first 100 chars + '...')
      const truncated = longContent.substring(0, 100) + '...';
      expect(screen.getByText(truncated)).toBeInTheDocument();
    });

    it('truncates at exactly 100 characters', () => {
      // Create exactly 101 characters
      const content = 'a'.repeat(101);
      const thought = {
        ...mockThought,
        content,
      };

      render(<ThoughtCard thought={thought} />);

      const expectedTruncated = 'a'.repeat(100) + '...';
      expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
    });

    it('handles content with 100 characters exactly', () => {
      const content = 'a'.repeat(100);
      const thought = {
        ...mockThought,
        content,
      };

      render(<ThoughtCard thought={thought} />);

      // Should not add ellipsis for exactly 100 characters
      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  describe('date formatting', () => {
    it('displays formatted date in relative format', () => {
      render(<ThoughtCard thought={mockThought} />);

      // Should contain relative date text (exact format depends on current time)
      const article = screen.getByTestId('thought-card');
      expect(article.textContent).toMatch(/ago|yesterday/);
    });
  });

  describe('tags rendering', () => {
    it('renders tags when present', () => {
      render(<ThoughtCard thought={mockThought} />);

      const tagDisplay = screen.getByTestId('tag-display');
      expect(tagDisplay).toBeInTheDocument();
    });

    it('renders each tag as a chip', () => {
      render(<ThoughtCard thought={mockThought} />);

      const workTag = screen.getByTestId('tag-chip-work');
      const urgentTag = screen.getByTestId('tag-chip-urgent');

      expect(workTag).toBeInTheDocument();
      expect(urgentTag).toBeInTheDocument();
    });

    it('does not render tag display when no tags present', () => {
      const thoughtNoTags = {
        ...mockThought,
        tags: [],
      };

      const { queryByTestId } = render(
        <ThoughtCard thought={thoughtNoTags} />
      );

      expect(queryByTestId('tag-display')).not.toBeInTheDocument();
    });

    it('passes compact mode to TagDisplay', () => {
      render(<ThoughtCard thought={mockThought} />);

      // TagDisplay should be rendered with compact=true
      const tagDisplay = screen.getByTestId('tag-display');
      expect(tagDisplay).toBeInTheDocument();
      // Check that it's rendering (compact prop is internal to TagDisplay)
    });
  });

  describe('callback handling', () => {
    it('calls onHighlight when clicked', async () => {
      const onHighlight = vi.fn();
      const user = await userEvent.setup();

      render(<ThoughtCard thought={mockThought} onHighlight={onHighlight} />);

      const card = screen.getByTestId('thought-card');
      await user.click(card);

      expect(onHighlight).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onHighlight is not provided and card is clicked', async () => {
      const user = await userEvent.setup();

      render(<ThoughtCard thought={mockThought} />);

      const card = screen.getByTestId('thought-card');
      await expect(user.click(card)).resolves.not.toThrow();
    });

    it('calls onHighlight only once per click', async () => {
      const onHighlight = vi.fn();
      const user = await userEvent.setup();

      render(<ThoughtCard thought={mockThought} onHighlight={onHighlight} />);

      const card = screen.getByTestId('thought-card');
      await user.click(card);
      await user.click(card);

      expect(onHighlight).toHaveBeenCalledTimes(2);
    });
  });

  describe('hover state', () => {
    it('responds to mouse enter and leave events', () => {
      render(<ThoughtCard thought={mockThought} />);

      const card = screen.getByTestId('thought-card');
      const cardElement = card as HTMLElement;

      // Initial styles should be set
      expect(cardElement).toBeInTheDocument();

      // Simulate hover
      fireEvent.mouseEnter(card);
      // Styles are applied internally, just verify no errors

      fireEvent.mouseLeave(card);
      // Styles are applied internally, just verify no errors
    });
  });

  describe('className prop', () => {
    it('applies custom className to card', () => {
      const customClass = 'custom-card-class';
      render(
        <ThoughtCard thought={mockThought} className={customClass} />
      );

      const card = screen.getByTestId('thought-card');
      expect(card).toHaveClass(customClass);
    });

    it('defaults to empty className', () => {
      render(<ThoughtCard thought={mockThought} />);

      const card = screen.getByTestId('thought-card');
      expect(card.className).toBe('');
    });
  });

  describe('snapshot tests', () => {
    it('matches snapshot for basic thought card', () => {
      const { container } = render(<ThoughtCard thought={mockThought} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for thought with no tags', () => {
      const thoughtNoTags = {
        ...mockThought,
        tags: [],
      };

      const { container } = render(
        <ThoughtCard thought={thoughtNoTags} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for thought with many tags', () => {
      const thoughtManyTags = {
        ...mockThought,
        tags: ['work', 'urgent', 'personal', 'ideas', 'reflection'],
      };

      const { container } = render(
        <ThoughtCard thought={thoughtManyTags} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for thought with very long content', () => {
      const longContent =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
      const thoughtLongContent = {
        ...mockThought,
        content: longContent,
      };

      const { container } = render(
        <ThoughtCard thought={thoughtLongContent} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with onHighlight callback', () => {
      const onHighlight = vi.fn();
      const { container } = render(
        <ThoughtCard thought={mockThought} onHighlight={onHighlight} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(
        <ThoughtCard
          thought={mockThought}
          className="custom-class highlight"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('has proper heading hierarchy with h3 for title', () => {
      render(<ThoughtCard thought={mockThought} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Thought');
    });

    it('maintains proper semantic structure', () => {
      const { container } = render(
        <ThoughtCard thought={mockThought} />
      );

      const article = container.querySelector('[role="article"]');
      expect(article).toBeInTheDocument();

      // Check for h3 inside article
      const h3 = article?.querySelector('h3');
      expect(h3).toBeInTheDocument();

      // Check for p inside article
      const p = article?.querySelector('p');
      expect(p).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles thought with empty title', () => {
      const emptyTitleThought = {
        ...mockThought,
        title: '',
      };

      render(<ThoughtCard thought={emptyTitleThought} />);

      const card = screen.getByTestId('thought-card');
      expect(card).toBeInTheDocument();
    });

    it('handles thought with empty content', () => {
      const emptyContentThought = {
        ...mockThought,
        content: '',
      };

      render(<ThoughtCard thought={emptyContentThought} />);

      const card = screen.getByTestId('thought-card');
      expect(card).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialCharThought = {
        ...mockThought,
        title: 'Test & <Thought> "with" special chars',
      };

      render(<ThoughtCard thought={specialCharThought} />);

      expect(
        screen.getByText('Test & <Thought> "with" special chars')
      ).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      const specialCharThought = {
        ...mockThought,
        content: 'Content with & < > " special chars',
      };

      render(<ThoughtCard thought={specialCharThought} />);

      expect(
        screen.getByText('Content with & < > " special chars')
      ).toBeInTheDocument();
    });

    it('handles emoji in title and content', () => {
      const emojiThought = {
        ...mockThought,
        title: '🎉 Celebration Thought',
        content: '🚀 This is exciting 🎊',
      };

      render(<ThoughtCard thought={emojiThought} />);

      expect(screen.getByText('🎉 Celebration Thought')).toBeInTheDocument();
      expect(screen.getByText('🚀 This is exciting 🎊')).toBeInTheDocument();
    });
  });
});
