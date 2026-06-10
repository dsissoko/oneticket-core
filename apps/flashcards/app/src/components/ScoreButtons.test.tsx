import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { ScoreButtons } from './ScoreButtons';

describe('ScoreButtons', () => {
  it('renders both score buttons', () => {
    renderWithProviders(<ScoreButtons onScore={vi.fn()} />);
    expect(screen.getByText('I knew it')).toBeInTheDocument();
    expect(screen.getByText("I didn't know")).toBeInTheDocument();
  });

  it('calls onScore(true) when "I knew it" is clicked', async () => {
    const user = userEvent.setup();
    const onScore = vi.fn();
    renderWithProviders(<ScoreButtons onScore={onScore} />);
    await user.click(screen.getByText('I knew it'));
    expect(onScore).toHaveBeenCalledWith(true);
  });

  it("calls onScore(false) when \"I didn't know\" is clicked", async () => {
    const user = userEvent.setup();
    const onScore = vi.fn();
    renderWithProviders(<ScoreButtons onScore={onScore} />);
    await user.click(screen.getByText("I didn't know"));
    expect(onScore).toHaveBeenCalledWith(false);
  });

  it('has correct aria-labels for accessibility', () => {
    renderWithProviders(<ScoreButtons onScore={vi.fn()} />);
    expect(screen.getByLabelText('I knew it')).toBeInTheDocument();
    expect(screen.getByLabelText("I didn't know")).toBeInTheDocument();
  });
});