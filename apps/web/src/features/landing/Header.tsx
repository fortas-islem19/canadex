import { useEffect, useState } from 'react';
import { ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { Logo } from '../../components/Logo';
import { useLocale } from '../../i18n/useLocale';
import styles from './Header.module.css';

const LINKS = [
  ['services', '#services'],
  ['path', '#pathfinder'],
  ['how', '#how'],
  ['index', '#index'],
  ['faq', '#faq'],
  ['contact', '#contact'],
] as const;

export function Header() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`${styles.header} ${scrolled || open ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.brand} onClick={close}>
          <Logo />
        </a>

        <nav className={styles.nav} aria-label="Canadex">
          {LINKS.map(([key, href]) => (
            <a key={key} href={href} className={styles.link}>
              {t(`nav.${key}`)}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <ButtonLink href="#booking" size="sm" className={styles.cta}>
            {t('nav.book')}
          </ButtonLink>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('common.close') : t('common.menu')}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className={styles.mobileMenu} aria-label="Canadex">
          <div className="container">
            {LINKS.map(([key, href], index) => (
              <a key={key} href={href} className={styles.mobileLink} onClick={close}>
                <span className={styles.mobileIndex}>{String(index + 1).padStart(2, '0')}</span>
                {t(`nav.${key}`)}
              </a>
            ))}
            <ButtonLink href="#booking" block size="lg" arrow onClick={close}>
              {t('nav.book')}
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
