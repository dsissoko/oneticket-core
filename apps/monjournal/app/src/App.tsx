import React, { useState, useCallback, useMemo } from 'react';
import type { JournalEntry } from './domain/Entry';
import { useTheme } from './hooks/useTheme';
import { useJournalEntries } from './hooks/useJournalEntries';
import { useCreateEntry } from './hooks/useCreateEntry';
import { useEditEntry } from './hooks/useEditEntry';
import { useDeleteEntry } from './hooks/useDeleteEntry';
import { useSurpriseEntry } from './hooks/useSurpriseEntry';
import { useSearchEntries } from './hooks/useSearchEntries';
import { ThemeSelector } from './components/ThemeSelector';
import { SurpriseButton } from './components/SurpriseButton';
import { SurpriseView } from './components/SurpriseView';
import { Timeline } from './components/Timeline';
import { SearchPanel } from './components/SearchPanel';
import { SearchResults } from './components/SearchResults';
import { EntryForm } from './components/EntryForm';
import { EntryDetail } from './components/EntryDetail';
import './styles/globals.css';

/**
 * Route types for navigation
 */
type RouteState = 'timeline' | 'search' | 'surprise' | 'form-new' | 'form-edit';

/**
 * Minimal error boundary for startup errors
 * Catches rendering failures and displays fallback UI
 */
interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AppErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#fff5f5',
            border: '1px solid #feb2b2',
            borderRadius: '6px',
            color: '#c53030',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Oops! Unexpected Error</h2>
          <p>The application encountered an unexpected error. Please reload the page.</p>
          <details style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff' }}>
            <summary style={{ cursor: 'pointer', color: '#744210', fontWeight: 'bold' }}>
              Technical Details
            </summary>
            <pre
              style={{
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f7fafc',
              }}
            >
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * App Component
 *
 * Root application component with complete integration of:
 * 1. useTheme & ThemeSelector (header)
 * 2. Navigation with SurpriseButton
 * 3. Main layout with conditional routing:
 *    - timeline: Main view with Timeline and optional date filter
 *    - search: SearchPanel with results
 *    - surprise: SurpriseView with random entry
 *    - form-new: EntryForm for creating new entry
 *    - form-edit: EntryForm for editing existing entry
 * 4. useJournalEntries for loading all entries
 * 5. useCreateEntry, useEditEntry, useDeleteEntry for CRUD operations
 * 6. useSearchEntries for period-based search
 * 7. useSurpriseEntry for random entry selection
 * 8. Minimal error boundary for unexpected errors
 */
export const App: React.FC = () => {
  // ============ Theme Management ============
  const { theme, setTheme } = useTheme();

  // ============ Data Loading ============
  const { entries, isLoading: entriesLoading, error: entriesError } = useJournalEntries();

  // ============ CRUD Operations ============
  const { createEntry, isCreating, error: createError } = useCreateEntry();
  const { editEntry, isEditing, error: editError } = useEditEntry();
  const { deleteEntry, isDeleting, confirmDelete, error: deleteError } = useDeleteEntry();

  // ============ Search Feature ============
  const { results: searchResults, search, isSearching, error: searchError, clearSearch } = useSearchEntries();

  // ============ Surprise Feature ============
  const {
    surpriseEntry,
    getSurprise,
    nextSurprise,
    goBack: goBackFromSurprise,
    error: surpriseError,
  } = useSurpriseEntry(entries);

  // ============ Local State Management ============
  const [currentRoute, setCurrentRoute] = useState<RouteState>('timeline');
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<JournalEntry | null>(null);
  const [selectedEntryForView, setSelectedEntryForView] = useState<JournalEntry | null>(null);

  // ============ Event Handlers ============

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  }, [setTheme]);

  const handleSurpriseClick = useCallback(() => {
    setCurrentRoute('surprise');
    getSurprise();
  }, [getSurprise]);

  const handleSurpriseNext = useCallback(() => {
    nextSurprise();
  }, [nextSurprise]);

  const handleSurpriseBack = useCallback(() => {
    goBackFromSurprise();
    setCurrentRoute('timeline');
  }, [goBackFromSurprise]);

  const handleNewEntry = useCallback(() => {
    setSelectedEntryForEdit(null);
    setCurrentRoute('form-new');
  }, []);

  const handleEntrySubmit = useCallback(
    async (data: { date: string; text: string }) => {
      try {
        if (selectedEntryForEdit) {
          // Edit mode
          await editEntry(selectedEntryForEdit.id, data);
        } else {
          // Create mode
          await createEntry(data);
        }
        setCurrentRoute('timeline');
        setSelectedEntryForEdit(null);
      } catch (err) {
        console.error('Entry submission error:', err);
      }
    },
    [selectedEntryForEdit, createEntry, editEntry]
  );

  const handleEntryCancel = useCallback(() => {
    setCurrentRoute('timeline');
    setSelectedEntryForEdit(null);
  }, []);

  const handleEntryClick = useCallback((entry: JournalEntry) => {
    setSelectedEntryForView(entry);
  }, []);

  const handleEditEntry = useCallback((entry: JournalEntry) => {
    setSelectedEntryForEdit(entry);
    setCurrentRoute('form-edit');
  }, []);

  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      try {
        await confirmDelete(entryId);
        setSelectedEntryForView(null);
        setCurrentRoute('timeline');
      } catch (err) {
        console.error('Delete error:', err);
      }
    },
    [confirmDelete]
  );

  const handleSearch = useCallback(
    async (criteria: { startDate: string; endDate: string }) => {
      try {
        await search(criteria);
        setCurrentRoute('search');
      } catch (err) {
        console.error('Search error:', err);
      }
    },
    [search]
  );

  const handleClearSearch = useCallback(() => {
    clearSearch();
    setCurrentRoute('timeline');
  }, [clearSearch]);

  const handleCloseEntryDetail = useCallback(() => {
    setSelectedEntryForView(null);
  }, []);

  // ============ Combined Entries Display ============
  // Use search results if searching, otherwise use all entries
  const displayEntries = useMemo(() => {
    return currentRoute === 'search' ? searchResults : entries;
  }, [currentRoute, searchResults, entries]);

  // ============ Main Render ============
  return (
    <AppErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* ============ HEADER ============ */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-fg)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Journal Personnel</h1>

          {/* ============ NAVIGATION ============ */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              onClick={handleNewEntry}
              disabled={entriesLoading}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              ➕ Nouvelle
            </button>

            <button
              onClick={() => setCurrentRoute('search')}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--color-fg)',
              }}
            >
              🔍 Recherche
            </button>

            <SurpriseButton
              onClick={handleSurpriseClick}
              disabled={entriesLoading || entries.length === 0}
              label="🎲 Surprise"
            />

            <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />
          </nav>
        </header>

        {/* ============ MAIN CONTENT ============ */}
        <main
          style={{
            flex: 1,
            padding: '24px',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-fg)',
            overflowY: 'auto',
          }}
        >
          {/* ============ TIMELINE VIEW (DEFAULT) ============ */}
          {currentRoute === 'timeline' && !selectedEntryForView && (
            <div>
              <Timeline
                entries={displayEntries}
                onEntryClick={handleEntryClick}
                isLoading={entriesLoading}
              />
            </div>
          )}

          {/* ============ ENTRY DETAIL VIEW ============ */}
          {selectedEntryForView && currentRoute === 'timeline' && (
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={handleCloseEntryDetail}
                style={{
                  padding: '8px 12px',
                  marginBottom: '16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'var(--color-fg)',
                }}
              >
                ← Retour
              </button>
              <EntryDetail
                entry={selectedEntryForView}
                onEdit={() => handleEditEntry(selectedEntryForView)}
                onDelete={() => handleDeleteEntry(selectedEntryForView.id)}
                isDeleting={isDeleting}
              />
            </div>
          )}

          {/* ============ SEARCH VIEW ============ */}
          {currentRoute === 'search' && !selectedEntryForView && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={handleClearSearch}
                  style={{
                    padding: '8px 12px',
                    marginBottom: '16px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--color-fg)',
                  }}
                >
                  ← Retour
                </button>
              </div>

              <SearchPanel
                onSearch={handleSearch}
                isSearching={isSearching}
                error={searchError?.message || null}
              />

              {searchResults.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <SearchResults
                    results={searchResults}
                    totalCount={searchResults.length}
                    onEntryClick={handleEntryClick}
                    onClearSearch={handleClearSearch}
                    isLoading={isSearching}
                  />
                </div>
              )}
            </div>
          )}

          {/* ============ SURPRISE VIEW ============ */}
          {currentRoute === 'surprise' && (
            <SurpriseView
              entry={surpriseEntry}
              onNext={handleSurpriseNext}
              onBack={handleSurpriseBack}
              isLoading={false}
              error={surpriseError}
              onCreateEntry={handleNewEntry}
            />
          )}

          {/* ============ CREATE/EDIT FORM VIEW ============ */}
          {(currentRoute === 'form-new' || currentRoute === 'form-edit') && (
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '24px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {currentRoute === 'form-new' ? 'Créer une nouvelle entrée' : 'Éditer l\'entrée'}
              </h2>
              <EntryForm
                entry={selectedEntryForEdit}
                onSubmit={handleEntrySubmit}
                onCancel={handleEntryCancel}
                isSubmitting={isCreating || isEditing}
                error={(createError || editError)?.message || null}
              />
            </div>
          )}

          {/* ============ ERROR MESSAGES ============ */}
          {entriesError && (
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fee5e5',
                border: '1px solid #fc8181',
                borderRadius: '6px',
                color: '#c53030',
                marginBottom: '16px',
              }}
            >
              <strong>Erreur:</strong> {entriesError.message}
            </div>
          )}

          {deleteError && (
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fee5e5',
                border: '1px solid #fc8181',
                borderRadius: '6px',
                color: '#c53030',
                marginBottom: '16px',
              }}
            >
              <strong>Erreur de suppression:</strong> {deleteError.message}
            </div>
          )}

          {/* ============ LOADING STATE ============ */}
          {entriesLoading && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              Chargement des entrées...
            </div>
          )}
        </main>
      </div>
    </AppErrorBoundary>
  );
};

export default App;
