/**
 * i18n translations for Flashcards app.
 * Add new languages by extending the `translations` object.
 */

export type Language = 'en' | 'fr';

export const translations = {
  en: {
    // Header
    nav: {
      home: 'Home',
      about: 'About',
    },
    // HomeScreen
    home: {
      theme: 'Theme',
      mode: 'Mode',
      start: 'Start',
    },
    // ScoreButtons
    score: {
      knew: 'I knew it',
      didntKnow: "I didn't know",
    },
    // ResultsScreen
    results: {
      title: 'Session Complete',
      youKnew: 'You knew',
      replay: 'Replay',
      backToHome: 'Back to Home',
    },
  },
  fr: {
    // Header
    nav: {
      home: 'Accueil',
      about: 'À propos',
    },
    // HomeScreen
    home: {
      theme: 'Thème',
      mode: 'Mode',
      start: 'Commencer',
    },
    // ScoreButtons
    score: {
      knew: 'Je savais',
      didntKnow: 'Je ne savais pas',
    },
    // ResultsScreen
    results: {
      title: 'Session terminée',
      youKnew: 'Vous avez su',
      replay: 'Rejouer',
      backToHome: 'Retour à l\'accueil',
    },
  },
} as const;

export type Translations = typeof translations['en'];
