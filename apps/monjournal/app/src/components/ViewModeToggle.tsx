import React from 'react';

interface ViewModeToggleProps {
  currentMode: 'list' | 'timeline';
  onChange: (mode: 'list' | 'timeline') => void;
}

/**
 * Control to switch between list and timeline view modes.
 * Displays two toggle buttons with active state styling.
 */
export function ViewModeToggle({
  currentMode,
  onChange,
}: ViewModeToggleProps): React.ReactElement {
  return (
    <div className="view-mode-toggle">
      <button
        className={`toggle-button ${currentMode === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
      >
        List
      </button>
      <button
        className={`toggle-button ${currentMode === 'timeline' ? 'active' : ''}`}
        onClick={() => onChange('timeline')}
      >
        Timeline
      </button>
    </div>
  );
}
