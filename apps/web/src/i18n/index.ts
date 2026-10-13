import { LANGUAGES, isLanguage, type Language } from '@canadex/shared';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export type Dictionary = typeof en;

export const dictionaries: Record<Language, Dictionary> = { ar, fr, en };

/** BCP 47 locales used for dates and numbers. `ar-DZ` gives Maghreb month names and Latin digits. */
export const intlLocales: Record<Language, string> = { ar: 'ar-DZ', fr: 'fr-DZ', en: 'en-GB' };

export const directionOf = (language: Language) => (language === 'ar' ? 'rtl' : 'ltr');

export function currentLanguage(): Language {
  const resolved = i18n.resolvedLanguage;
  return isLanguage(resolved) ? resolved : 'fr';
}

function syncDocument(language: string) {
  if (!isLanguage(language) || typeof document === 'undefined') return;
  const root = document.documentElement;
  root.lang = language;
  root.dir = directionOf(language);
  document.title = dictionaries[language].meta.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', dictionaries[language].meta.description);
}

i18n.on('languageChanged', syncDocument);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: Object.fromEntries(
      LANGUAGES.map((language) => [language, { translation: dictionaries[language] }]),
    ),
    supportedLngs: [...LANGUAGES],
    nonExplicitSupportedLngs: true,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'canadex.lang',
      caches: ['localStorage'],
    },
    returnNull: false,
  });

export default i18n;
