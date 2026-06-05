import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders two date input fields with labels', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker dateStart={null} dateEnd={null} onChange={onChange} />
    );

    expect(screen.getByLabelText('From:')).toBeInTheDocument();
    expect(screen.getByLabelText('To:')).toBeInTheDocument();
    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();
  });

  it('renders with empty fields when both dates are null', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker dateStart={null} dateEnd={null} onChange={onChange} />
    );

    const startInput = screen.getByLabelText('From:') as HTMLInputElement;
    const endInput = screen.getByLabelText('To:') as HTMLInputElement;

    expect(startInput.value).toBe('');
    expect(endInput.value).toBe('');
  });

  it('converts timestamp to date string in input fields', () => {
    const onChange = vi.fn();
    // June 5, 2026 00:00:00 UTC = 1809580800000 ms
    const timestamp = new Date('2026-06-05T00:00:00Z').getTime();
    
    render(
      <DateRangePicker dateStart={timestamp} dateEnd={timestamp} onChange={onChange} />
    );

    const startInput = screen.getByLabelText('From:') as HTMLInputElement;
    const endInput = screen.getByLabelText('To:') as HTMLInputElement;

    expect(startInput.value).toBe('2026-06-05');
    expect(endInput.value).toBe('2026-06-05');
  });

  it('calls onChange when start date is changed', async () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker dateStart={null} dateEnd={null} onChange={onChange} />
    );

    const startInput = screen.getByLabelText('From:');
    await userEvent.type(startInput, '2026-06-01');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(call[0]).toBe(new Date('2026-06-01T00:00:00Z').getTime()); // start timestamp
    expect(call[1]).toBeNull(); // end timestamp
  });

  it('calls onChange when end date is changed', async () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker dateStart={null} dateEnd={null} onChange={onChange} />
    );

    const endInput = screen.getByLabelText('To:');
    await userEvent.type(endInput, '2026-06-30');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(call[0]).toBeNull(); // start timestamp
    expect(call[1]).toBe(new Date('2026-06-30T00:00:00Z').getTime()); // end timestamp
  });

  it('allows clearing dates (empty field = null)', async () => {
    const onChange = vi.fn();
    const timestamp = new Date('2026-06-05T00:00:00Z').getTime();
    const { rerender } = render(
      <DateRangePicker dateStart={timestamp} dateEnd={timestamp} onChange={onChange} />
    );

    const startInput = screen.getByLabelText('From:') as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(null, timestamp);
  });

  it('validates start > end and shows warning', () => {
    const onChange = vi.fn();
    const start = new Date('2026-06-30T00:00:00Z').getTime();
    const end = new Date('2026-06-01T00:00:00Z').getTime();

    render(
      <DateRangePicker dateStart={start} dateEnd={end} onChange={onChange} />
    );

    expect(
      screen.getByText('Start date must be before end date')
    ).toBeInTheDocument();
  });

  it('applies red border when dates are invalid', () => {
    const onChange = vi.fn();
    const start = new Date('2026-06-30T00:00:00Z').getTime();
    const end = new Date('2026-06-01T00:00:00Z').getTime();

    render(
      <DateRangePicker dateStart={start} dateEnd={end} onChange={onChange} />
    );

    const startInput = screen.getByLabelText('From:');
    const endInput = screen.getByLabelText('To:');

    expect(startInput).toHaveClass('border-red-500', 'bg-red-50');
    expect(endInput).toHaveClass('border-red-500', 'bg-red-50');
  });

  it('applies normal border when dates are valid', () => {
    const onChange = vi.fn();
    const start = new Date('2026-06-01T00:00:00Z').getTime();
    const end = new Date('2026-06-30T00:00:00Z').getTime();

    render(
      <DateRangePicker dateStart={start} dateEnd={end} onChange={onChange} />
    );

    const startInput = screen.getByLabelText('From:');
    const endInput = screen.getByLabelText('To:');

    expect(startInput).toHaveClass('border-gray-300');
    expect(endInput).toHaveClass('border-gray-300');
    expect(startInput).not.toHaveClass('border-red-500');
    expect(endInput).not.toHaveClass('border-red-500');
  });

  it('does not show validation warning when only start date is set', () => {
    const onChange = vi.fn();
    const start = new Date('2026-06-05T00:00:00Z').getTime();

    render(
      <DateRangePicker dateStart={start} dateEnd={null} onChange={onChange} />
    );

    expect(
      screen.queryByText('Start date must be before end date')
    ).not.toBeInTheDocument();
  });

  it('does not show validation warning when only end date is set', () => {
    const onChange = vi.fn();
    const end = new Date('2026-06-05T00:00:00Z').getTime();

    render(
      <DateRangePicker dateStart={null} dateEnd={end} onChange={onChange} />
    );

    expect(
      screen.queryByText('Start date must be before end date')
    ).not.toBeInTheDocument();
  });

  it('handles equal start and end dates without warning', () => {
    const onChange = vi.fn();
    const timestamp = new Date('2026-06-05T00:00:00Z').getTime();

    render(
      <DateRangePicker dateStart={timestamp} dateEnd={timestamp} onChange={onChange} />
    );

    expect(
      screen.queryByText('Start date must be before end date')
    ).not.toBeInTheDocument();
  });

  it('syncs local state when dateStart prop changes', () => {
    const onChange = vi.fn();
    const start1 = new Date('2026-06-01T00:00:00Z').getTime();
    const start2 = new Date('2026-06-15T00:00:00Z').getTime();

    const { rerender } = render(
      <DateRangePicker dateStart={start1} dateEnd={null} onChange={onChange} />
    );

    const startInput = screen.getByLabelText('From:') as HTMLInputElement;
    expect(startInput.value).toBe('2026-06-01');

    rerender(
      <DateRangePicker dateStart={start2} dateEnd={null} onChange={onChange} />
    );

    expect(startInput.value).toBe('2026-06-15');
  });

  it('syncs local state when dateEnd prop changes', () => {
    const onChange = vi.fn();
    const end1 = new Date('2026-06-01T00:00:00Z').getTime();
    const end2 = new Date('2026-06-30T00:00:00Z').getTime();

    const { rerender } = render(
      <DateRangePicker dateStart={null} dateEnd={end1} onChange={onChange} />
    );

    const endInput = screen.getByLabelText('To:') as HTMLInputElement;
    expect(endInput.value).toBe('2026-06-01');

    rerender(
      <DateRangePicker dateStart={null} dateEnd={end2} onChange={onChange} />
    );

    expect(endInput.value).toBe('2026-06-30');
  });
});
