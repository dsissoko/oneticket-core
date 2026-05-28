/**
 * Component: SearchResults
 *
 * Displays filtered journal entries from a search operation.
 * Shows result count, empty state message, and entry list.
 * Provides reset button to return to viewing all entries.
 *
 * Features:
 * - Result count display ("N entrée(s) trouvée(s)")
 * - Entry list with timeline items
 * - Empty state message when no results
 * - Reset/clear search button
 * - Loading state indicator
 * - Accessible headings and aria labels
 *
 * Accessibility: WCAG 2.1 AA
 */

import React from 'react';
import type { JournalEntry } from '../domain/Entry';
import { TimelineItem } from './TimelineItem';
import '../styles/search-results.css';

export interface SearchResultsProps {
  results: JournalEntry[];
  totalCount: number;
  onEntryClick: (entry: JournalEntry) => void;
  onClearSearch: () => void;
  isLoading: boolean;
}

/**
 * Format result count in French
 * Returns "1 entrée trouvée" or "N entrées trouvées"
 */
function formatResultCount(count: number): string {
  return count === 1 ? '1 entrée trouvée' : `${count} entrées trouvées`;
}

export function SearchResults({
  results,
  totalCount,
  onEntryClick,
  onClearSearch,
  isLoading,
}: SearchResultsProps): JSX.Element {
  // Show loading state
  if (isLoading) {
    return (
      <div className="search-results search-results--loading">
        <div className="search-results-loading">
          <span className="search-results-spinner" aria-hidden="true">
            ⏳
          </span>
          <p>Recherche en cours...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no results found
  if (results.length === 0) {
    return (
      <div className="search-results search-results--empty">
        <div className="search-results-empty-state">
          <span className="search-results-empty-icon" aria-hidden="true">
            🔍
          </span>
          <h3 className="search-results-empty-title">Aucune entrée trouvée</h3>
          <p className="search-results-empty-description">
            Aucune entrée ne correspond à votre période de recherche.
          </p>
          <button
            className="search-results-reset-button"
            onClick={onClearSearch}
            aria-label="Voir toutes les entrées"
          >
            <span className="search-results-reset-icon" aria-hidden="true">
              ↺
            </span>
            <span>Voir tout</span>
          </button>
        </div>
      </div>
    );
  }

  // Show results with count and list
  return (
    <div className="search-results search-results--with-results">
      {/* Results header with count */}
      <div className="search-results-header">
        <h3 className="search-results-count" aria-live="polite" aria-atomic="true">
          {formatResultCount(results.length)}
        </h3>
        <button
          className="search-results-reset-button"
          onClick={onClearSearch}
          aria-label="Voir toutes les entrées"
          title="Voir toutes les entrées"
        >
          <span className="search-results-reset-icon" aria-hidden="true">
            ↺
          </span>
          <span>Voir tout</span>
        </button>
      </div>

      {/* Results list with timeline items */}
      <div className="search-results-list">
        {results.map((entry) => (
          <div key={entry.id} className="search-results-item">
            <TimelineItem
              entry={entry}
              onEntryClick={onEntryClick}
            />
          </div>
        ))}
      </div>

      {/* Info about total results vs displayed */}
      {totalCount > 0 && totalCount !== results.length && (
        <div className="search-results-info" aria-live="polite">
          <p className="search-results-info-text">
            Affichage de {results.length} sur {totalCount} entrées
          </p>
        </div>
      )}
    </div>
  );
}
