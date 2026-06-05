import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TagMultiSelect from './TagMultiSelect';
import { Tag } from '../models/types';

describe('TagMultiSelect', () => {
  const mockTags: Tag[] = [
    { name: 'personal', color: '#FF6B6B' },
    { name: 'work', color: '#45B7D1' },
    { name: 'morning', color: '#4ECDC4' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all available tags', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Toggle personal tag')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle work tag')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle morning tag')).toBeInTheDocument();
  });

  it('renders tag names correctly', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('morning')).toBeInTheDocument();
  });

  it('shows "No tags available" message when availableTags is empty', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={[]}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('No tags available')).toBeInTheDocument();
  });

  it('indicates selected tags with checked checkboxes', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={['personal', 'work']}
        onChange={onChange}
      />
    );

    const personalCheckbox = screen.getByLabelText(
      'Toggle personal tag'
    ) as HTMLInputElement;
    const workCheckbox = screen.getByLabelText(
      'Toggle work tag'
    ) as HTMLInputElement;
    const morningCheckbox = screen.getByLabelText(
      'Toggle morning tag'
    ) as HTMLInputElement;

    expect(personalCheckbox.checked).toBe(true);
    expect(workCheckbox.checked).toBe(true);
    expect(morningCheckbox.checked).toBe(false);
  });

  it('applies visual highlighting to selected tags', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={['personal']}
        onChange={onChange}
      />
    );

    const personalLabel = screen
      .getByLabelText('Toggle personal tag')
      .closest('label');
    const workLabel = screen.getByLabelText('Toggle work tag').closest('label');

    expect(personalLabel).toHaveClass('border-blue-500', 'bg-blue-50');
    expect(workLabel).toHaveClass('border-gray-200');
    expect(workLabel).not.toHaveClass('border-blue-500');
  });

  it('toggles a tag on when clicked', async () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    await userEvent.click(personalCheckbox);

    expect(onChange).toHaveBeenCalledWith(['personal']);
  });

  it('toggles a tag off when clicked', async () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={['personal']}
        onChange={onChange}
      />
    );

    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    await userEvent.click(personalCheckbox);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('handles multiple selections correctly', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    const workCheckbox = screen.getByLabelText('Toggle work tag');

    await userEvent.click(personalCheckbox);
    expect(onChange).toHaveBeenLastCalledWith(['personal']);

    // Rerender with updated selection
    rerender(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={['personal']}
        onChange={onChange}
      />
    );

    await userEvent.click(workCheckbox);
    expect(onChange).toHaveBeenLastCalledWith(['personal', 'work']);
  });

  it('renders color indicators for tags', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    const personalLabel = screen
      .getByLabelText('Toggle personal tag')
      .closest('label');
    // Color indicator div with title attribute
    const colorDot = personalLabel?.querySelector('[title="personal"]');

    expect(colorDot).toBeInTheDocument();
    expect(colorDot).toHaveStyle({ backgroundColor: 'rgb(255, 107, 107)' });
  });

  it('renders checkboxes for each tag', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('applies flex-wrap layout to handle many tags', () => {
    const onChange = vi.fn();
    const manyTags: Tag[] = Array.from({ length: 20 }, (_, i) => ({
      name: `tag${i}`,
      color: '#FF6B6B',
    }));

    const { container } = render(
      <TagMultiSelect
        availableTags={manyTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    const wrapper = container.querySelector('.flex.flex-wrap');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('gap-2');
  });

  it('preserves selection order when toggling', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    // Select in order: personal, morning, work
    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    await userEvent.click(personalCheckbox);
    expect(onChange).toHaveBeenLastCalledWith(['personal']);

    rerender(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={['personal']}
        onChange={onChange}
      />
    );

    const morningCheckbox = screen.getByLabelText('Toggle morning tag');
    await userEvent.click(morningCheckbox);
    expect(onChange).toHaveBeenLastCalledWith(['personal', 'morning']);

    rerender(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={['personal', 'morning']}
        onChange={onChange}
      />
    );

    const workCheckbox = screen.getByLabelText('Toggle work tag');
    await userEvent.click(workCheckbox);
    expect(onChange).toHaveBeenLastCalledWith(['personal', 'morning', 'work']);
  });

  it('handles rapid tag toggling', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    const personalCheckbox = screen.getByLabelText('Toggle personal tag');

    // Toggle on
    await userEvent.click(personalCheckbox);
    expect(onChange).toHaveBeenLastCalledWith(['personal']);

    rerender(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={['personal']}
        onChange={onChange}
      />
    );

    // Toggle off immediately
    await userEvent.click(personalCheckbox);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('handles undefined availableTags gracefully', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={undefined as any}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('No tags available')).toBeInTheDocument();
  });

  it('applies title attribute for accessibility', () => {
    const onChange = vi.fn();
    render(
      <TagMultiSelect
        availableTags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    // Color dot should have title attribute matching tag name
    const colorDot = screen.getByTitle('personal');
    expect(colorDot).toBeInTheDocument();
  });
});
