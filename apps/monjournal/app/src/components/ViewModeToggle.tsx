import React from 'react';

interface ViewModeToggleProps {
  currentMode: 'list' | 'timeline';
  onChange: (mode: 'list' | 'timeline') => void;
}

/**
 * ViewModeToggle Component
 * 
 * Control to switch between list and timeline views of thoughts.
 * Displays two toggle buttons with visual highlighting for the active mode.
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  currentMode,
  onChange,
}) => {
  const handleListClick = () => {
    if (currentMode !== 'list') {
      onChange('list');
    }
  };

  const handleTimelineClick = () => {
    if (currentMode !== 'timeline') {
      onChange('timeline');
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="inline-flex rounded-md border border-border bg-background p-1">
        {/* List Button */}
        <button
          onClick={handleListClick}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            currentMode === 'list'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted'
          }`}
          aria-pressed={currentMode === 'list'}
          aria-label="List view"
        >
          List
        </button>

        {/* Timeline Button */}
        <button
          onClick={handleTimelineClick}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            currentMode === 'timeline'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted'
          }`}
          aria-pressed={currentMode === 'timeline'}
          aria-label="Timeline view"
        >
          Timeline
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;
