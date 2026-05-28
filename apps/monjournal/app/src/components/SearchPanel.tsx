/**
 * Component: SearchPanel
 *
 * Presentational component for date range search with input fields and search button.
 * Displays validation errors and loading state during search operations.
 *
 * Features:
 * - Date range inputs (start and end dates)
 * - Calendar-style date picker or native HTML5 date input
 * - Search button with loading state indicator
 * - Validation error display
 * - Accessible labels and keyboard navigation (Tab, Enter)
 *
 * Accessibility: WCAG 2.1 AA
 */

import React, { useState, useCallback } from 'react';
import type { SearchCriteria } from '../domain/SearchService';
import '../styles/search-panel.css';

export interface SearchPanelProps {
  onSearch: (criteria: SearchCriteria) => Promise<void>;
  isSearching: boolean;
  error?: string | null;
}

export function SearchPanel({
  onSearch,
  isSearching,
  error,
}: SearchPanelProps): JSX.Element {
  // Local form state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Handle form submission
   * Validates dates and triggers the search
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLocalError(null);

      // Validate inputs are not empty
      if (!startDate.trim()) {
        setLocalError('La date de début est requise');
        return;
      }
      if (!endDate.trim()) {
        setLocalError('La date de fin est requise');
        return;
      }

      try {
        // Submit to parent hook
        await onSearch({
          startDate: startDate.trim(),
          endDate: endDate.trim(),
        });
      } catch (err) {
        // Error handling is done by parent component
        // but we can log it here if needed
        console.error('[SearchPanel] Search error:', err);
      }
    },
    [startDate, endDate, onSearch],
  );

  /**
   * Handle reset button click
   * Clears the form and any error messages
   */
  const handleReset = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setLocalError(null);
  }, []);

  // Display either local validation error or parent error
  const displayError = localError || error;

  return (
    <div className="search-panel">
      <form className="search-panel-form" onSubmit={handleSubmit}>
        {/* Form title */}
        <h2 className="search-panel-title">Rechercher par période</h2>

        {/* Error message display */}
        {displayError && (
          <div className="search-panel-error" role="alert" aria-live="polite">
            <span className="search-panel-error-icon">⚠️</span>
            <span className="search-panel-error-text">{displayError}</span>
          </div>
        )}

        {/* Date inputs container */}
        <div className="search-panel-inputs">
          {/* Start date input */}
          <div className="search-panel-field">
            <label htmlFor="search-start-date" className="search-panel-label">
              Date de début
            </label>
            <input
              id="search-start-date"
              type="date"
              className="search-panel-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSearching}
              aria-label="Date de début (YYYY-MM-DD)"
            />
          </div>

          {/* End date input */}
          <div className="search-panel-field">
            <label htmlFor="search-end-date" className="search-panel-label">
              Date de fin
            </label>
            <input
              id="search-end-date"
              type="date"
              className="search-panel-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSearching}
              aria-label="Date de fin (YYYY-MM-DD)"
            />
          </div>
        </div>

        {/* Form buttons */}
        <div className="search-panel-buttons">
          <button
            type="submit"
            className="search-panel-button search-panel-button--primary"
            disabled={isSearching}
            aria-busy={isSearching}
          >
            {isSearching ? (
              <>
                <span className="search-panel-spinner" aria-hidden="true">
                  ⏳
                </span>
                <span>Recherche en cours...</span>
              </>
            ) : (
              <>
                <span className="search-panel-icon" aria-hidden="true">
                  🔍
                </span>
                <span>Rechercher</span>
              </>
            )}
          </button>

          <button
            type="reset"
            className="search-panel-button search-panel-button--secondary"
            onClick={handleReset}
            disabled={isSearching}
            aria-label="Réinitialiser le formulaire"
          >
            <span className="search-panel-icon" aria-hidden="true">
              ↺
            </span>
            <span>Réinitialiser</span>
          </button>
        </div>

        {/* Help text */}
        <p className="search-panel-help">
          Sélectionnez une plage de dates pour filtrer vos entrées. Les deux dates sont incluses.
        </p>
      </form>
    </div>
  );
}
