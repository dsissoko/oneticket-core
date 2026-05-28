import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { ThemeSelector } from './components/ThemeSelector';
import './styles/globals.css';

/**
 * App Component
 * 
 * Root component that demonstrates:
 * 1. useTheme hook initialization
 * 2. ThemeSelector integration
 * 3. Theme-aware styling via CSS variables
 */
export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <h1>Journal Personnel</h1>
        <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />
      </div>

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

      <section style={{ marginTop: '32px' }}>
        <h2>Features:</h2>
        <ul>
          <li>☀️ Light/Dark theme toggle</li>
          <li>⌨️ Keyboard accessible (Tab, Enter, Space)</li>
          <li>♿ WCAG 2.1 AA compliant</li>
          <li>⚡ Instant theme changes (&lt; 50ms)</li>
          <li>💾 Persistent user preference (localStorage)</li>
          <li>🎨 GitHub Primer design system</li>
        </ul>
      </section>
    </div>
  );
};

export default App;
