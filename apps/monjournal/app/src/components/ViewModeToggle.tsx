/**
 * ViewModeToggle Component
 * Toggle control to switch between list and timeline views
 */

import React from 'react';

interface ViewModeToggleProps {
  /** Current view mode */
  currentMode: 'list' | 'timeline';
  /** Callback when mode changes */
  onChange: (mode: 'list' | 'timeline') => void;
}

/**
 * ViewModeToggle: Toggle buttons for switching between list and timeline views
 * - Displays two buttons: "List" and "Timeline"
 * - Active button is highlighted
 * - Calls onChange callback when clicked
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  currentMode,
  onChange,
}) => {
  return (
    <div
      className="flex gap-2 bg-muted rounded-lg p-1"
      data-testid="view-mode-toggle"
      role="group"
      aria-label="View mode toggle"
    >
      {/* List View Button */}
      <button
        onClick={() => onChange('list')}
        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
          currentMode === 'list'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        data-testid="view-mode-list"
        aria-pressed={currentMode === 'list'}
      >
        List
      </button>

      {/* Timeline View Button */}
      <button
        onClick={() => onChange('timeline')}
        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
          currentMode === 'timeline'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        data-testid="view-mode-timeline"
        aria-pressed={currentMode === 'timeline'}
      >
        Timeline
      </button>
    </div>
  );
};

export default ViewModeToggle;
