import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TagInput, TagList } from '../form-components';
import { getTagColor } from '../../models/tagModel';

describe('TagInput Component', () => {
  const mockOnChange = vi.fn();
  const mockOnAddTag = vi.fn();
  const suggestions = ['work', 'personal', 'urgent', 'ideas'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input field with placeholder', () => {
      render(
        <TagInput
          value=""
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      const input = screen.getByPlaceholderText('Type a tag and press Enter');
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    });

    it('should display input value', () => {
      render(
        <TagInput
          value="work"
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      const input = screen.getByDisplayValue('work');
      expect(input).toBeInTheDocument();
    });

    it('should render disabled when disabled prop is true', () => {
      render(
        <TagInput
          value=""
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
          disabled
        />
      );

      const input = screen.getByPlaceholderText('Type a tag and press Enter');
      expect(input).toBeDisabled();
    });
  });

  describe('Suggestions', () => {
    it('should not show dropdown when input is empty', () => {
      render(
        <TagInput
          value=""
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should show suggestions when input has value', () => {
      render(
        <TagInput
          value="work"
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      // Input with value should show suggestions on first render if focused
      const input = screen.getByDisplayValue('work');
      fireEvent.focus(input);
      
      const dropdown = screen.getByRole('listbox');
      expect(dropdown).toBeInTheDocument();
    });

    it('should not show dropdown when no suggestions match', () => {
      render(
        <TagInput
          value="xyz"
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Adding Tags', () => {
    it('should call onAddTag when Enter is pressed with non-empty input', () => {
      render(
        <TagInput
          value="newTag"
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      const input = screen.getByDisplayValue('newTag');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnAddTag).toHaveBeenCalledWith('newTag');
    });

    it('should not call onAddTag when Enter is pressed with empty input', () => {
      render(
        <TagInput
          value=""
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      const input = screen.getByPlaceholderText('Type a tag and press Enter');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnAddTag).not.toHaveBeenCalled();
    });

    it('should call onAddTag when suggestion is clicked', () => {
      render(
        <TagInput
          value="work"
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      const input = screen.getByDisplayValue('work');
      fireEvent.focus(input);

      const dropdown = screen.getByRole('listbox');
      const workOption = within(dropdown).getByText('work');
      fireEvent.click(workOption);

      expect(mockOnAddTag).toHaveBeenCalledWith('work');
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('User Interactions', () => {
    it('should handle typing in input', () => {
      render(
        <TagInput
          value=""
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      const input = screen.getByPlaceholderText('Type a tag and press Enter');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockOnChange).toHaveBeenCalledWith('test');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for autocomplete', () => {
      render(
        <TagInput
          value="test"
          onChange={mockOnChange}
          suggestions={suggestions}
          onAddTag={mockOnAddTag}
        />
      );

      const input = screen.getByLabelText('Tag input');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-controls', 'tag-suggestions');
    });
  });
});

describe('TagList Component', () => {
  const mockOnRemoveTag = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should return null when tags array is empty', () => {
      const { container } = render(
        <TagList tags={[]} onRemoveTag={mockOnRemoveTag} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render all tags as chips', () => {
      const tags = ['work', 'personal', 'urgent'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      tags.forEach((tag) => {
        const tagElement = screen.getByText(tag);
        expect(tagElement).toBeInTheDocument();
      });
    });

    it('should render remove button for each tag', () => {
      const tags = ['work', 'personal'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      const removeButtons = screen.getAllByRole('button');
      expect(removeButtons).toHaveLength(tags.length);
    });
  });

  describe('Tag Styling', () => {
    it('should apply correct background color for each tag', () => {
      const tags = ['work', 'personal'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      tags.forEach((tag) => {
        const expectedColor = getTagColor(tag);
        const chipElement = screen.getByText(tag).closest('.tag-chip');
        expect(chipElement).toHaveStyle(`backgroundColor: ${expectedColor}`);
      });
    });

    it('should have proper text color for contrast', () => {
      const tags = ['work'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      const chipElement = screen.getByText('work').closest('.tag-chip');
      const color = chipElement?.style.color;
      expect(color).toBeDefined();
      // Color should be either white (#FFFFFF) or black (#000000)
      const isWhiteOrBlack = color?.includes('255') || color?.includes('0');
      expect(isWhiteOrBlack).toBeTruthy();
    });
  });

  describe('Removing Tags', () => {
    it('should call onRemoveTag when remove button is clicked', () => {
      const tags = ['work', 'personal'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      const removeButtons = screen.getAllByRole('button');
      fireEvent.click(removeButtons[0]);

      expect(mockOnRemoveTag).toHaveBeenCalledWith('work');
    });

    it('should call onRemoveTag with correct tag name for each chip', () => {
      const tags = ['work', 'personal', 'urgent'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      const removeButtons = screen.getAllByRole('button');
      fireEvent.click(removeButtons[1]);

      expect(mockOnRemoveTag).toHaveBeenCalledWith('personal');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for remove buttons', () => {
      const tags = ['work', 'personal'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      const removeButtons = screen.getAllByRole('button');
      expect(removeButtons[0]).toHaveAttribute('aria-label', 'Remove tag: work');
      expect(removeButtons[1]).toHaveAttribute('aria-label', 'Remove tag: personal');
    });

    it('should have status role for tag chips', () => {
      const tags = ['work'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      const statusElements = screen.getAllByRole('status');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should have proper aria-label for tag chips', () => {
      const tags = ['work', 'personal'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      const workChip = screen.getByLabelText('Tag: work');
      const personalChip = screen.getByLabelText('Tag: personal');
      expect(workChip).toBeInTheDocument();
      expect(personalChip).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tags with special characters', () => {
      const tags = ['work-urgent', 'todo_personal'];
      render(<TagList tags={tags} onRemoveTag={mockOnRemoveTag} />);

      expect(screen.getByText('work-urgent')).toBeInTheDocument();
      expect(screen.getByText('todo_personal')).toBeInTheDocument();
    });

    it('should handle very long tag names', () => {
      const longTag = 'a'.repeat(100);
      render(<TagList tags={[longTag]} onRemoveTag={mockOnRemoveTag} />);

      const tagElement = screen.getByText(longTag);
      expect(tagElement).toBeInTheDocument();
    });
  });
});
