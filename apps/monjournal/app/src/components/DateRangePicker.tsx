import React from 'react';

interface DateRangePickerProps {
  dateStart: number | null;
  dateEnd: number | null;
  onChange: (start: number | null, end: number | null) => void;
}

/**
 * Converts a timestamp (milliseconds) to an ISO date string (YYYY-MM-DD)
 * @param timestamp - Timestamp in milliseconds
 * @returns ISO date string or empty string if timestamp is null
 */
function timestampToDateString(timestamp: number | null): string {
  if (timestamp === null) {
    return '';
  }
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * Converts an ISO date string (YYYY-MM-DD) to a timestamp (milliseconds at start of day UTC)
 * @param dateString - ISO date string or empty string
 * @returns Timestamp in milliseconds or null if empty
 */
function dateStringToTimestamp(dateString: string): number | null {
  if (!dateString) {
    return null;
  }
  const date = new Date(`${dateString}T00:00:00Z`);
  return date.getTime();
}

/**
 * DateRangePicker component provides two date input fields for selecting a date range.
 * Validates that start date is not greater than end date.
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
    // Validate that start date is not greater than end date
    if (newStart !== null && dateEnd !== null && newStart > dateEnd) {
      // Don't update if validation fails; user needs to adjust end date
      return;
    }
    onChange(newStart, dateEnd);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = dateStringToTimestamp(e.target.value);
    // Validate that start date is not greater than end date
    if (dateStart !== null && newEnd !== null && dateStart > newEnd) {
      // Don't update if validation fails; user needs to adjust start date
      return;
    }
    onChange(dateStart, newEnd);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor="date-start"
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          From:
        </label>
        <input
          id="date-start"
          type="date"
          value={startDateString}
          onChange={handleStartChange}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor="date-end"
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          To:
        </label>
        <input
          id="date-end"
          type="date"
          value={endDateString}
          onChange={handleEndChange}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
