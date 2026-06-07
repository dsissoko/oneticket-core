import React, { createContext, useContext } from 'react';
import { useI18n } from '@/hooks/useI18n';
import type { Language, Translations } from '@/i18n/translations';

interface I18nContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const i18n = useI18n();
  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used inside I18nProvider');
  return ctx;
}
