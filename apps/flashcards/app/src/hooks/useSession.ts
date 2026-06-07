import { useState, useEffect, useCallback } from 'react';
import type { SessionResult, LearningMode } from '@/types';

const SESSION_STORAGE_KEY = 'flashcards-session';
const PREFERENCES_STORAGE_KEY = 'flashcards-preferences';

interface StoredSession {
  results: SessionResult[];
}

interface StoredPreferences {
  themeId: string;
  mode: LearningMode;
}

/**
 * Manages flashcard session state with localStorage persistence.
 * - Tracks current card index and results
 * - Records SessionResult (known/unknown) per card
 * - Persists theme and mode selection across sessions
 */
export function useSession() {
  // Session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);

  // Preferences (theme, mode)
  const [themeId, setThemeId] = useState<string | null>(null);
  const [mode, setMode] = useState<LearningMode | null>(null);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionRaw) {
        const stored: StoredSession = JSON.parse(sessionRaw);
        if (Array.isArray(stored.results)) {
          setResults(stored.results);
        }
      }

      const prefsRaw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (prefsRaw) {
        const prefs: StoredPreferences = JSON.parse(prefsRaw);
        setThemeId(prefs.themeId ?? null);
        setMode(prefs.mode ?? null);
      }
    } catch {
      // Ignore parse errors — treat as empty state
    }
  }, []);

  // Persist session results when they change
  useEffect(() => {
    const data: StoredSession = { results };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  }, [results]);

  // Persist preferences when they change
  useEffect(() => {
    if (themeId !== null && mode !== null) {
      const data: StoredPreferences = { themeId, mode };
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
    }
  }, [themeId, mode]);

  const recordResult = useCallback((cardId: string, known: boolean) => {
    const result: SessionResult = {
      cardId,
      known,
      timestamp: Date.now(),
    };
    setResults((prev) => [...prev, result]);
  }, []);

  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const previousCard = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
  }, []);

  const setPreferences = useCallback((newThemeId: string, newMode: LearningMode) => {
    setThemeId(newThemeId);
    setMode(newMode);
  }, []);

  return {
    currentIndex,
    results,
    recordResult,
    nextCard,
    previousCard,
    resetSession,
    themeId,
    mode,
    setPreferences,
  };
}

export type { StoredSession, StoredPreferences };