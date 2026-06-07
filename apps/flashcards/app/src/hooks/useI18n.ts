import { useState, useCallback } from 'react';
import { translations, type Language, type Translations } from '@/i18n/translations';

const STORAGE_KEY = 'flashcards-language';

const DEFAULT_LANGUAGE: Language = 'en';

interface UseI18nReturn {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

/**
 * Hook for managing app language.
 * Persists selected language to localStorage.
 * Defaults to English.
 */
export function useI18n(): UseI18nReturn {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'fr') return stored;
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  return {
    language,
    t: translations[language],
    setLanguage,
  };
}
