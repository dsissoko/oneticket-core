import React from 'react';
import { useTranslation } from '@/i18n/I18nContext';
import type { Language } from '@/i18n/translations';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
];

/**
 * LanguageSwitcher Component
 * Renders EN / FR toggle buttons in the header.
 */
export function LanguageSwitcher(): React.ReactElement {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.value}
          onClick={() => setLanguage(lang.value)}
          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
            language === lang.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

LanguageSwitcher.displayName = 'LanguageSwitcher';
