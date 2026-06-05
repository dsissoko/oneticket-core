/**
 * ViewModeToggle Component
 *
 * Segmented control for switching between list and timeline view modes.
 *
 * @component
 * @example
 * const [mode, setMode] = useState<'list' | 'timeline'>('list');
 * return <ViewModeToggle currentMode={mode} onChange={setMode} />
 */
export interface ViewModeToggleProps {
  /** Current active view mode */
  currentMode: 'list' | 'timeline';
  /** Callback when mode changes */
  onChange: (mode: 'list' | 'timeline') => void;
}

export function ViewModeToggle({ currentMode, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex gap-1 rounded-md bg-muted p-1"
      role="tablist"
      aria-label="View mode toggle"
    >
      <button
        onClick={() => onChange('list')}
        aria-selected={currentMode === 'list'}
        aria-label="List view"
        role="tab"
        className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          currentMode === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        List
      </button>
      <button
        onClick={() => onChange('timeline')}
        aria-selected={currentMode === 'timeline'}
        aria-label="Timeline view"
        role="tab"
        className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          currentMode === 'timeline'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Timeline
      </button>
    </div>
  );
}

ViewModeToggle.displayName = 'ViewModeToggle';
