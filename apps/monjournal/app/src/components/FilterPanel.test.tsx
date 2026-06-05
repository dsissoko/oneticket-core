import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FilterPanel from './FilterPanel';
import { Tag, FilterState } from '../models/types';

describe('FilterPanel', () => {
  const mockTags: Tag[] = [
    { name: 'personal', color: '#FF6B6B' },
    { name: 'work', color: '#45B7D1' },
    { name: 'morning', color: '#4ECDC4' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter controls', () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    // Check for text search
    expect(screen.getByPlaceholderText('Search title and content')).toBeInTheDocument();

    // Check for date range picker
    expect(screen.getByLabelText('From:')).toBeInTheDocument();
    expect(screen.getByLabelText('To:')).toBeInTheDocument();

    // Check for tag selector
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByText('Surprise!')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('calls onFilterChange when text search changes', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search title and content');
    await userEvent.type(searchInput, 'deadline');

    expect(onFilterChange).toHaveBeenCalled();
    const lastCall = onFilterChange.mock.calls[
      onFilterChange.mock.calls.length - 1
    ][0] as FilterState;
    expect(lastCall.text).toBe('deadline');
  });

  it('calls onFilterChange with empty FilterState when text is cleared', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    const { rerender } = render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search title and content'
    ) as HTMLInputElement;
    await userEvent.type(searchInput, 'test');
    await userEvent.clear(searchInput);

    const lastCall = onFilterChange.mock.calls[
      onFilterChange.mock.calls.length - 1
    ][0] as FilterState;
    expect(lastCall.text).toBeUndefined();
  });

  it('calls onFilterChange when date range changes', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const startInput = screen.getByLabelText('From:');
    await userEvent.type(startInput, '2026-06-01');

    expect(onFilterChange).toHaveBeenCalled();
    const lastCall = onFilterChange.mock.calls[
      onFilterChange.mock.calls.length - 1
    ][0] as FilterState;
    expect(lastCall.dateStart).toBe(new Date('2026-06-01T00:00:00Z').getTime());
  });

  it('calls onFilterChange when tag selection changes', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    await userEvent.click(personalCheckbox);

    expect(onFilterChange).toHaveBeenCalled();
    const lastCall = onFilterChange.mock.calls[
      onFilterChange.mock.calls.length - 1
    ][0] as FilterState;
    expect(lastCall.selectedTags).toEqual(['personal']);
  });

  it('calls onSurpriseClick when Surprise button is clicked', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const surpriseButton = screen.getByText('Surprise!');
    await userEvent.click(surpriseButton);

    expect(onSurpriseClick).toHaveBeenCalled();
  });

  it('disables Surprise button when surpriseDisabled prop is true', () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
        surpriseDisabled={true}
      />
    );

    const surpriseButton = screen.getByText('Surprise!') as HTMLButtonElement;
    expect(surpriseButton).toBeDisabled();
    expect(surpriseButton).toHaveClass('bg-gray-300', 'cursor-not-allowed');
  });

  it('enables Surprise button when surpriseDisabled prop is false', () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
        surpriseDisabled={false}
      />
    );

    const surpriseButton = screen.getByText('Surprise!') as HTMLButtonElement;
    expect(surpriseButton).not.toBeDisabled();
    expect(surpriseButton).toHaveClass('bg-blue-500');
  });

  it('clears all filters when Clear Filters button is clicked', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    // Set some filters
    const searchInput = screen.getByPlaceholderText('Search title and content');
    const personalCheckbox = screen.getByLabelText('Toggle personal tag');

    await userEvent.type(searchInput, 'test');
    await userEvent.click(personalCheckbox);

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    await userEvent.click(clearButton);

    // Should call onFilterChange with empty object
    const lastCall = onFilterChange.mock.calls[
      onFilterChange.mock.calls.length - 1
    ][0];
    expect(lastCall).toEqual({});
  });

  it('resets UI state when Clear Filters button is clicked', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    // Set some filters
    const searchInput = screen.getByPlaceholderText(
      'Search title and content'
    ) as HTMLInputElement;
    const personalCheckbox = screen.getByLabelText(
      'Toggle personal tag'
    ) as HTMLInputElement;

    await userEvent.type(searchInput, 'test');
    await userEvent.click(personalCheckbox);

    expect(searchInput.value).toBe('test');
    expect(personalCheckbox.checked).toBe(true);

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    await userEvent.click(clearButton);

    // UI should be reset
    expect(searchInput.value).toBe('');
    expect(personalCheckbox.checked).toBe(false);
  });

  it('shows filter summary when filters are active', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search title and content');
    await userEvent.type(searchInput, 'deadline');

    // Summary should show the active search
    expect(screen.getByText('"deadline"')).toBeInTheDocument();
  });

  it('shows summary for date range filter', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const startInput = screen.getByLabelText('From:');
    await userEvent.type(startInput, '2026-06-01');

    expect(screen.getByText(/Date range:/)).toBeInTheDocument();
  });

  it('shows summary for selected tags', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    await userEvent.click(personalCheckbox);

    // Check for the summary section that contains "Tags: personal"
    const summaryDiv = screen.queryAllByText((content, element) => {
      return element?.textContent?.includes('• Tags:') && element?.className?.includes('text-xs') || false;
    });
    expect(summaryDiv.length).toBeGreaterThan(0);
  });

  it('hides filter summary when no filters are active', () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    // Summary section should not be visible initially
    const summaryDiv = screen.queryByText((content, element) => {
      return element?.textContent?.includes('• Date range:') || false;
    });
    expect(summaryDiv).not.toBeInTheDocument();
  });

  it('composes all filters together with AND logic', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    // Apply text search
    const searchInput = screen.getByPlaceholderText('Search title and content');
    await userEvent.type(searchInput, 'test');

    // Apply date range
    const startInput = screen.getByLabelText('From:');
    await userEvent.type(startInput, '2026-06-01');

    // Apply tag selection
    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    await userEvent.click(personalCheckbox);

    // Last call should have all filters
    const lastCall = onFilterChange.mock.calls[
      onFilterChange.mock.calls.length - 1
    ][0] as FilterState;
    expect(lastCall.text).toBe('test');
    expect(lastCall.dateStart).toBeDefined();
    expect(lastCall.selectedTags).toEqual(['personal']);
  });

  it('renders header and description', () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    expect(screen.getByText('Filter Thoughts')).toBeInTheDocument();
    expect(
      screen.getByText('Search and refine your journal entries')
    ).toBeInTheDocument();
  });

  it('applies responsive styling classes', () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    const { container } = render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const panelDiv = container.querySelector('.bg-gray-50');
    expect(panelDiv).toHaveClass('rounded-lg', 'p-6', 'space-y-6');
  });

  it('emits correct filter state for multiple tag selections', async () => {
    const onFilterChange = vi.fn();
    const onSurpriseClick = vi.fn();

    render(
      <FilterPanel
        existingTags={mockTags}
        onFilterChange={onFilterChange}
        onSurpriseClick={onSurpriseClick}
      />
    );

    const personalCheckbox = screen.getByLabelText('Toggle personal tag');
    const workCheckbox = screen.getByLabelText('Toggle work tag');

    await userEvent.click(personalCheckbox);
    await userEvent.click(workCheckbox);

    const lastCall = onFilterChange.mock.calls[
      onFilterChange.mock.calls.length - 1
    ][0] as FilterState;
    expect(lastCall.selectedTags).toContain('personal');
    expect(lastCall.selectedTags).toContain('work');
  });
});
