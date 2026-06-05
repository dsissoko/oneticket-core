/**
 * DateRangePicker component — renders two date input fields for filtering
 * Allows selection of a date range with optional start and end dates
 * Handles null values (empty fields) gracefully
 */

import React, { useState, useEffect } from 'react';

export interface DateRangePickerProps {
  /** Start date as timestamp in milliseconds, or null */
  dateStart: number | null;
  /** End date as timestamp in milliseconds, or null */
  dateEnd: number | null;
  /** Callback when date range changes (called with timestamps in ms or null) */
  onChange: (start: number | null, end: number | null) => void;
}

/**
 * Convert timestamp (ms) to ISO date string for input[type="date"]
 * Returns empty string for null/undefined
 */
function timestampToDateString(ts: number | null | undefined): string {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toISOString().split('T')[0];
}

/**
 * Convert ISO date string from input[type="date"] to timestamp in ms
 * Returns null for empty string
 */
function dateStringToTimestamp(dateStr: string): number | null {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.getTime();
}

/**
 * DateRangePicker component
 * Renders two date input fields with From/To labels
 * Validates that start <= end, shows visual warning if violated
 *
 * @example
 * <DateRangePicker
 *   dateStart={null}
 *   dateEnd={null}
 *   onChange={(start, end) => setFilterState({ ...filterState, dateStart: start, dateEnd: end })}
 * />
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateStart,
  dateEnd,
  onChange,
}) => {
  const [startStr, setStartStr] = useState<string>(timestampToDateString(dateStart));
  const [endStr, setEndStr] = useState<string>(timestampToDateString(dateEnd));

  // Sync local state when props change (for external updates)
  useEffect(() => {
    setStartStr(timestampToDateString(dateStart));
  }, [dateStart]);

  useEffect(() => {
    setEndStr(timestampToDateString(dateEnd));
  }, [dateEnd]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newStartStr = e.target.value;
    setStartStr(newStartStr);
    const newStart = dateStringToTimestamp(newStartStr);
    onChange(newStart, dateStringToTimestamp(endStr));
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newEndStr = e.target.value;
    setEndStr(newEndStr);
    const newEnd = dateStringToTimestamp(newEndStr);
    onChange(dateStringToTimestamp(startStr), newEnd);
  };

  // Check if start > end for visual warning
  const startTs = dateStringToTimestamp(startStr);
  const endTs = dateStringToTimestamp(endStr);
  const isInvalid = startTs !== null && endTs !== null && startTs > endTs;

  return (
    <div className="flex gap-4 items-end flex-wrap">
      <div className="flex flex-col gap-2">
        <label htmlFor="date-start" className="text-sm font-medium">
          From:
        </label>
        <input
          id="date-start"
          type="date"
          value={startStr}
          onChange={handleStartChange}
          className={`px-3 py-2 border rounded-md text-sm ${
            isInvalid ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          title="Start date (click to clear)"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="date-end" className="text-sm font-medium">
          To:
        </label>
        <input
          id="date-end"
          type="date"
          value={endStr}
          onChange={handleEndChange}
          className={`px-3 py-2 border rounded-md text-sm ${
            isInvalid ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          title="End date (click to clear)"
        />
      </div>

      {isInvalid && (
        <div className="text-xs text-red-600 font-medium flex-shrink-0">
          Start date must be before end date
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
