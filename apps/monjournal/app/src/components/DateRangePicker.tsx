import React, { useState, useEffect } from 'react';

interface DateRangePickerProps {
  dateStart: number | null;
  dateEnd: number | null;
  onChange: (start: number | null, end: number | null) => void;
}

/**
 * Encapsulates date range selection with two date input fields.
 * Handles parsing and validation of start and end dates.
 */
export function DateRangePicker({
  dateStart,
  dateEnd,
  onChange,
}: DateRangePickerProps): React.ReactElement {
  // Convert timestamp to date string (YYYY-MM-DD format)
  const timestampToDateString = (timestamp: number | null): string => {
    if (timestamp === null) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert date string to timestamp (start of day in UTC)
  const dateStringToTimestamp = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    // Set to start of day in UTC
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).getTime();
  };

  const [startDateStr, setStartDateStr] = useState(timestampToDateString(dateStart));
  const [endDateStr, setEndDateStr] = useState(timestampToDateString(dateEnd));

  // Sync internal state with props when they change externally
  useEffect(() => {
    setStartDateStr(timestampToDateString(dateStart));
  }, [dateStart]);

  useEffect(() => {
    setEndDateStr(timestampToDateString(dateEnd));
  }, [dateEnd]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartStr = e.target.value;
    setStartDateStr(newStartStr);

    const newStart = dateStringToTimestamp(newStartStr);
    const currentEnd = dateStringToTimestamp(endDateStr);

    // If start date is after end date, clear end date
    if (newStart !== null && currentEnd !== null && newStart > currentEnd) {
      setEndDateStr('');
      onChange(newStart, null);
    } else {
      onChange(newStart, currentEnd);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndStr = e.target.value;
    setEndDateStr(newEndStr);

    const currentStart = dateStringToTimestamp(startDateStr);
    const newEnd = dateStringToTimestamp(newEndStr);

    // If end date is before start date, clear start date
    if (newEnd !== null && currentStart !== null && newEnd < currentStart) {
      setStartDateStr('');
      onChange(null, newEnd);
    } else {
      onChange(currentStart, newEnd);
    }
  };

  return (
    <div className="date-range-picker">
      <div className="date-input-group">
        <label htmlFor="start-date" className="date-label">
          From:
        </label>
        <input
          id="start-date"
          type="date"
          className="date-input"
          value={startDateStr}
          onChange={handleStartDateChange}
        />
      </div>
      <div className="date-input-group">
        <label htmlFor="end-date" className="date-label">
          To:
        </label>
        <input
          id="end-date"
          type="date"
          className="date-input"
          value={endDateStr}
          onChange={handleEndDateChange}
        />
      </div>
    </div>
  );
}
