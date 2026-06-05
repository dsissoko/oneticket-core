import React from 'react';

interface ControlZoneProps {
  viewMode: 'list' | 'timeline';
  onViewModeChange: (mode: 'list' | 'timeline') => void;
  onSurpriseClick: () => void;
  disableSurprise?: boolean;
}

/**
 * Control zone that groups view mode toggle (List, Timeline) and Surprise action together.
 * These controls are grouped because they are all view-related controls:
 * - List/Timeline are persistent toggle modes
 * - Surprise is a one-shot action that highlights a random thought in the current view
 */
export function ControlZone({
  viewMode,
  onViewModeChange,
  onSurpriseClick,
  disableSurprise = false,
}: ControlZoneProps): React.ReactElement {
  return (
    <div className="control-zone">
      <div className="view-mode-toggle">
        <button
          className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => onViewModeChange('list')}
        >
          List
        </button>
        <button
          className={`toggle-button ${viewMode === 'timeline' ? 'active' : ''}`}
          onClick={() => onViewModeChange('timeline')}
        >
          Timeline
        </button>
      </div>

      <button
        className="surprise-button"
        onClick={onSurpriseClick}
        disabled={disableSurprise}
        title={disableSurprise ? 'No thoughts match current filters' : 'Select random thought'}
      >
        Surprise!
      </button>
    </div>
  );
}
