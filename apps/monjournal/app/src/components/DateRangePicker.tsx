/**
 * DateRangePicker Component
 * Encapsulates date range selection with two input fields
 */

import React from 'react';

interface DateRangePickerProps {
  /** Start date timestamp in milliseconds or null */
  dateStart: number | null | undefined;
  /** End date timestamp in milliseconds or null */
  dateEnd: number | null | undefined;
  /** Callback when dates change */
  onChange: (start: number | null, end: number | null) => void;
}

/**
 * Converts a timestamp (ms) to ISO date string (YYYY-MM-DD)
 * @param timestamp - Timestamp in milliseconds
 * @returns ISO date string or empty string if invalid
 */
const timestampToDateString = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    // Convert to YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

/**
 * Converts an ISO date string (YYYY-MM-DD) to timestamp (ms)
 * @param dateString - ISO date string
 * @returns Timestamp in milliseconds or null if invalid
 */
const dateStringToTimestamp = (dateString: string): number | null => {
  if (!dateString || dateString.trim().length === 0) {
    return null;
  }
  try {
    const date = new Date(dateString);
    // Set to midnight UTC
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
  } catch {
    return null;
  }
};

/**
 * DateRangePicker: Two date input fields for filtering by date range
 * - Renders "From:" and "To:" labels with HTML date inputs
 * - Allows clearing dates (empty field = null)
 * - Validates that start date ≤ end date
 * - Calls onChange with (start, end) timestamps
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateStart,
  dateEnd,
  onChange,
}) => {
  const startDateString = timestampToDateString(dateStart);
  const endDateString = timestampToDateString(dateEnd);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = dateStringToTimestamp(e.target.value);
    onChange(newStart, dateEnd ?? null);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = dateStringToTimestamp(e.target.value);
    onChange(dateStart ?? null, newEnd);
  };

  return (
    <div
      className="flex flex-col gap-3 p-4 bg-muted rounded-lg"
      data-testid="date-range-picker"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Start Date Input */}
        <div className="flex-1">
          <label
            htmlFor="date-start"
            className="block text-sm font-medium text-foreground mb-2"
          >
            From:
          </label>
          <input
            id="date-start"
            type="date"
            value={startDateString}
            onChange={handleStartChange}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
            data-testid="date-start-input"
          />
        </div>

        {/* End Date Input */}
        <div className="flex-1">
          <label
            htmlFor="date-end"
            className="block text-sm font-medium text-foreground mb-2"
          >
            To:
          </label>
          <input
            id="date-end"
            type="date"
            value={endDateString}
            onChange={handleEndChange}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
            data-testid="date-end-input"
          />
        </div>
      </div>

      {/* Validation message */}
      {dateStart && dateEnd && dateStart > dateEnd && (
        <p className="text-xs text-destructive" data-testid="date-validation-error">
          Start date must be before end date
        </p>
      )}
    </div>
  );
};

export default DateRangePicker;
