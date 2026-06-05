import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { ViewModeToggle } from './ViewModeToggle';

describe('ViewModeToggle', () => {
  it('renders with both list and timeline tabs', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="list" onChange={onChange} />
    );
    expect(screen.getByRole('tab', { name: /list view/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /timeline view/i })).toBeInTheDocument();
  });

  it('highlights the active mode tab when currentMode is list', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="list" onChange={onChange} />
    );
    const listTab = screen.getByRole('tab', { name: /list view/i });
    const timelineTab = screen.getByRole('tab', { name: /timeline view/i });
    
    expect(listTab).toHaveAttribute('aria-selected', 'true');
    expect(timelineTab).toHaveAttribute('aria-selected', 'false');
  });

  it('highlights the active mode tab when currentMode is timeline', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="timeline" onChange={onChange} />
    );
    const listTab = screen.getByRole('tab', { name: /list view/i });
    const timelineTab = screen.getByRole('tab', { name: /timeline view/i });
    
    expect(listTab).toHaveAttribute('aria-selected', 'false');
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange with list when list tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="timeline" onChange={onChange} />
    );
    
    const listTab = screen.getByRole('tab', { name: /list view/i });
    await user.click(listTab);
    
    expect(onChange).toHaveBeenCalledWith('list');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with timeline when timeline tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="list" onChange={onChange} />
    );
    
    const timelineTab = screen.getByRole('tab', { name: /timeline view/i });
    await user.click(timelineTab);
    
    expect(onChange).toHaveBeenCalledWith('timeline');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('maintains keyboard navigation with Tab key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="list" onChange={onChange} />
    );
    
    const listTab = screen.getByRole('tab', { name: /list view/i });
    const timelineTab = screen.getByRole('tab', { name: /timeline view/i });
    
    // Tab to first tab, then to second
    await user.tab();
    expect(listTab).toHaveFocus();
    
    await user.tab();
    expect(timelineTab).toHaveFocus();
  });

  it('triggers onChange on Enter key press', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="list" onChange={onChange} />
    );
    
    const timelineTab = screen.getByRole('tab', { name: /timeline view/i });
    
    // Focus and press Enter
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    
    expect(onChange).toHaveBeenCalledWith('timeline');
  });

  it('has proper ARIA attributes for accessibility', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ViewModeToggle currentMode="list" onChange={onChange} />
    );
    
    const container = screen.getByRole('tablist', { name: /view mode toggle/i });
    expect(container).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('tab');
    expect(buttons).toHaveLength(2);
    
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-selected');
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
