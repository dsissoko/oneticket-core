/**
 * Component: Timeline
 *
 * Main timeline component that displays all journal entries chronologically
 * with date anchors and grouping. Handles sorting, filtering, and navigation.
 *
 * Features:
 * - Chronological display with date anchors
 * - Sort order toggle (newest/oldest first)
 * - Date filtering with visual indicator
 * - Responsive mobile layout (vertical timeline)
 * - Keyboard navigation (Tab, Arrow keys, Enter, Escape)
 * - Performance optimized for 1000+ entries
 *
 * Accessibility: WCAG 2.1 AA
 */

import React, { useRef, useCallback, useMemo } from 'react';
import type { JournalEntry } from '../domain/Entry';
import { useTimelineSort, type SortOrder } from '../hooks/useTimelineSort';
import { TimelineAnchor } from './TimelineAnchor';
import { TimelineItem } from './TimelineItem';
import { SortToggle } from './SortToggle';
import '../styles/timeline.css';

export interface TimelineProps {
  entries: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
  onDateClick?: (date: string) => void;
  sortOrder?: SortOrder;
  onSortChange?: (order: SortOrder) => void;
  isLoading?: boolean;
}

/**
 * Helper to group entries by date for display
 */
function groupEntriesByDate(entries: JournalEntry[]): Map<string, JournalEntry[]> {
  const grouped = new Map<string, JournalEntry[]>();

  for (const entry of entries) {
    const date = entry.date;
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(entry);
  }

  return grouped;
}

/**
 * Get sorted date keys from grouped entries
 */
function getSortedDateKeys(grouped: Map<string, JournalEntry[]>, sortOrder: SortOrder): string[] {
  const dates = Array.from(grouped.keys()).sort();
  return sortOrder === 'desc' ? dates.reverse() : dates;
}

/**
 * Format date from YYYY-MM-DD to localized string
 */
function formatDateLocalized(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00Z');
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function Timeline({
  entries,
  onEntryClick,
  onDateClick,
  sortOrder: externalSortOrder,
  onSortChange: onExternalSortChange,
  isLoading = false,
}: TimelineProps): JSX.Element {
  // Use internal timeline sort for grouping and filtering
  const {
    displayEntries,
    sortOrder: internalSortOrder,
    setSortOrder,
    filterByDate,
    clearDateFilter,
    dateFilter,
  } = useTimelineSort(entries);

  // Use external sort order if provided, otherwise use internal
  const sortOrder = externalSortOrder ?? internalSortOrder;
  const handleSortChange = useCallback(
    (order: SortOrder) => {
      if (onExternalSortChange) {
        onExternalSortChange(order);
      } else {
        setSortOrder(order);
      }
    },
    [onExternalSortChange, setSortOrder],
  );

  // Reference for keyboard navigation
  const timelineRef = useRef<HTMLDivElement>(null);

  // Group display entries by date for rendering with anchors
  const groupedEntries = useMemo(() => {
    const grouped = groupEntriesByDate(displayEntries);
    const sortedDates = getSortedDateKeys(grouped, sortOrder);
    return { grouped, sortedDates };
  }, [displayEntries, sortOrder]);

  // Handle keyboard navigation
  const handleTimelineKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const focusedElement = document.activeElement;
    if (!(focusedElement instanceof HTMLElement)) return;

    // Handle Escape to close date filter
    if (event.key === 'Escape' && dateFilter) {
      event.preventDefault();
      clearDateFilter();
      return;
    }

    // Handle Arrow keys for navigation between items
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      // Find all focusable elements within the timeline
      const focusables = Array.from(
        timelineRef.current.querySelectorAll(
          'button[class*="timeline-item-button"], button[class*="timeline-anchor-button"]',
        ),
      ) as HTMLButtonElement[];

      const currentIndex = focusables.indexOf(focusedElement as HTMLButtonElement);
      if (currentIndex === -1) return;

      let nextIndex: number;
      if (event.key === 'ArrowDown') {
        nextIndex = Math.min(currentIndex + 1, focusables.length - 1);
      } else {
        nextIndex = Math.max(currentIndex - 1, 0);
      }

      focusables[nextIndex]?.focus();
    }
  };

  // Render empty state
  if (entries.length === 0) {
    return (
      <div className="timeline timeline--empty">
        <div className="timeline-empty-state">
          <p>Aucune entrée</p>
          <p className="timeline-empty-help">Commencez par créer votre première entrée.</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="timeline timeline--loading">
        <div className="timeline-loading-state">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline" ref={timelineRef} onKeyDown={handleTimelineKeyDown}>
      {/* Header with sort toggle and filter indicator */}
      <div className="timeline-header">
        <div className="timeline-header-controls">
          <SortToggle sortOrder={sortOrder} onSortChange={handleSortChange} />

          {dateFilter && (
            <div className="timeline-filter-indicator">
              <span className="timeline-filter-label">Filtrée : {formatDateLocalized(dateFilter)}</span>
              <button
                className="timeline-filter-clear"
                onClick={clearDateFilter}
                aria-label="Voir toutes les entrées"
              >
                Voir tout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline entries with date anchors */}
      <div className="timeline-content">
        {displayEntries.length === 0 ? (
          <div className="timeline-empty-state">
            <p>Aucune entrée pour cette période</p>
          </div>
        ) : (
          groupedEntries.sortedDates.map((date) => {
            const dateEntries = groupedEntries.grouped.get(date) ?? [];

            return (
              <div key={date} className="timeline-date-group">
                {/* Date anchor (clickable to filter) */}
                <TimelineAnchor
                  date={date}
                  entryCount={dateEntries.length}
                  onClick={() => {
                    filterByDate(date);
                    onDateClick?.(date);
                  }}
                />

                {/* Entries for this date */}
                <div className="timeline-items">
                  {dateEntries.map((entry) => (
                    <TimelineItem
                      key={entry.id}
                      entry={entry}
                      onEntryClick={onEntryClick}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
