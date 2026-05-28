import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useJournalEntries } from './hooks/useJournalEntries';
import { useSurpriseEntry } from './hooks/useSurpriseEntry';
import { ThemeSelector } from './components/ThemeSelector';
import { SurpriseButton } from './components/SurpriseButton';
import { SurpriseView } from './components/SurpriseView';
import './styles/globals.css';

/**
 * App Component
 *
 * Root component that demonstrates:
 * 1. useTheme hook initialization
 * 2. useJournalEntries hook for managing entries
 * 3. useSurpriseEntry hook for surprise feature
 * 4. ThemeSelector integration
 * 5. SurpriseButton and SurpriseView integration
 * 6. Theme-aware styling via CSS variables
 */
export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { entries, isLoading: entriesLoading } = useJournalEntries();
  const {
    surpriseEntry,
    getSurprise,
    nextSurprise,
    goBack,
    error: surpriseError,
  } = useSurpriseEntry(entries);

  const [isSurpriseActive, setIsSurpriseActive] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleSurpriseClick = () => {
    setIsSurpriseActive(true);
    getSurprise();
  };

  const handleSurpriseBack = () => {
    setIsSurpriseActive(false);
    goBack();
  };

  const handleCreateEntry = () => {
    // TODO: Navigate to entry creation form
    console.log('Navigating to entry creation...');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header with navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ margin: 0 }}>Journal Personnel</h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <SurpriseButton
            onClick={handleSurpriseClick}
            disabled={entriesLoading || entries.length === 0}
            label="🎲 Surprise"
          />
          <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />
        </div>
      </div>

      {/* Main content area */}
      {isSurpriseActive ? (
        <div style={{ marginBottom: '24px' }}>
          <SurpriseView
            entry={surpriseEntry}
            onNext={nextSurprise}
            onBack={handleSurpriseBack}
            error={surpriseError}
            onCreateEntry={handleCreateEntry}
          />
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-fg)',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
          }}
        >
          <p>Current theme: <strong>{theme}</strong></p>
          <p>The colors of this panel should change based on the selected theme.</p>
          <p>Click the theme selector button above to toggle between light and dark modes.</p>
        </div>
      )}

      <section style={{ marginTop: '32px' }}>
        <h2>Features:</h2>
        <ul>
          <li>☀️ Light/Dark theme toggle</li>
          <li>🎲 Surprise feature — discover random past entries</li>
          <li>⌨️ Keyboard accessible (Tab, Enter, Space, Escape)</li>
          <li>♿ WCAG 2.1 AA compliant</li>
          <li>⚡ Instant random selection (&lt; 50ms)</li>
          <li>💾 Persistent user preference (localStorage)</li>
          <li>🎨 GitHub Primer design system</li>
        </ul>
      </section>
    </div>
  );
};

export default App;
