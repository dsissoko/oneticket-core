import React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * ProgressBar Component
 *
 * Displays the current position in a session as a simple fraction (e.g., '3/10').
 * Used to show session advancement through flashcard decks.
 *
 * @param current - The current card position (1-indexed)
 * @param total - The total number of cards in the session
 */
export function ProgressBar({ current, total }: ProgressBarProps): React.ReactElement {
  const displayCurrent = Math.min(Math.max(current, 0), total);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground">
        {displayCurrent}/{total}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${total > 0 ? (displayCurrent / total) * 100 : 0}%` }}
          role="progressbar"
          aria-valuenow={displayCurrent}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}