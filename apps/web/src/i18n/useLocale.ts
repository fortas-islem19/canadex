import type { Language } from '@canadex/shared';
import { useTranslation } from 'react-i18next';
import { dictionaries, directionOf, intlLocales } from '.';

/**
 * Everything a component needs to render in the active language:
 * `t` for strings, `dict` for structured content (lists, cards), and Intl helpers.
 */
export function useLocale() {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? 'fr') as Language;
  return {
    t,
    i18n,
    language,
    dict: dictionaries[language] ?? dictionaries.fr,
    intlLocale: intlLocales[language] ?? 'fr-DZ',
    dir: directionOf(language),
    setLanguage: (next: Language) => i18n.changeLanguage(next),
  };
}
