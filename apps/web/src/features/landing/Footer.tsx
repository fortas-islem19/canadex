import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { Logo } from '../../components/Logo';
import { SITE } from '../../config/site';
import { useLocale } from '../../i18n/useLocale';
import { whatsappLink } from '../../lib/whatsapp';
import styles from './Footer.module.css';

const EXPLORE = [
  ['services', '#services'],
  ['path', '#pathfinder'],
  ['how', '#how'],
  ['index', '#index'],
  ['faq', '#faq'],
  ['book', '#booking'],
] as const;

export function Footer() {
  const { t, language } = useLocale();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <Logo variant="light" className={styles.logo} />
          <p className={styles.tagline}>{t('footer.tagline')}</p>
          <LanguageSwitcher tone="dark" />
        </div>

        <nav className={styles.column} aria-label={t('footer.explore')}>
          <h2 className={styles.heading}>{t('footer.explore')}</h2>
          {EXPLORE.map(([key, href]) => (
            <a key={key} href={href}>
              {t(`nav.${key}`)}
            </a>
          ))}
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>{t('footer.contact')}</h2>
          <span>{SITE.address[language]}</span>
          <a href={`tel:${SITE.phoneHref}`} dir="ltr">
            {SITE.phoneDisplay}
          </a>
          <a href={whatsappLink()} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>

        <div className={styles.column}>
          <h2 className={styles.heading}>{t('footer.official')}</h2>
          <a href={t('footer.officialIrccUrl')} target="_blank" rel="noreferrer">
            {t('footer.officialIrcc')}
          </a>
          <a href={t('footer.officialQuebecUrl')} target="_blank" rel="noreferrer">
            {t('footer.officialQuebec')}
          </a>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className={styles.disclaimer}>{t('footer.disclaimer')}</p>
        <p className={styles.rights}>{t('footer.rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
