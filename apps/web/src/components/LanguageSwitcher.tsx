import { LANGUAGES } from '@canadex/shared';
import { dictionaries } from '../i18n';
import { useLocale } from '../i18n/useLocale';
import styles from './LanguageSwitcher.module.css';

const SHORT = { ar: 'ع', fr: 'FR', en: 'EN' } as const;

export function LanguageSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { t, language, setLanguage } = useLocale();

  return (
    <div
      className={`${styles.switcher} ${tone === 'dark' ? styles.dark : ''}`}
      role="group"
      aria-label={t('common.language')}
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={styles.option}
          aria-pressed={language === code}
          title={dictionaries[code].common.languageName}
          onClick={() => void setLanguage(code)}
        >
          <span aria-hidden="true">{SHORT[code]}</span>
          <span className="visually-hidden">{dictionaries[code].common.languageName}</span>
        </button>
      ))}
    </div>
  );
}
