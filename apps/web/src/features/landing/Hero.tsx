import type { CSSProperties } from 'react';
import { Button, ButtonLink } from '../../components/Button';
import { AlgeriaFlag, CanadaFlag, MapleLeaf } from '../../components/Flags';
import { Icon } from '../../components/Icon';
import { useLocale } from '../../i18n/useLocale';
import { openDaysRange, openHoursRange } from '../../lib/format';
import { useBookingIntent } from '../booking/bookingIntentContext';
import { BoardingPass } from './BoardingPass';
import styles from './Hero.module.css';

/** Stagger index for the entrance animation. */
const step = (index: number) => ({ '--step': index }) as CSSProperties;

export function Hero() {
  const { t, intlLocale } = useLocale();
  const { requestBooking } = useBookingIntent();

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.backdrop} aria-hidden="true">
        <MapleLeaf className={styles.leaf} />
        <div className={styles.grid} />
      </div>

      <div className={`container ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.enter}`} style={step(0)}>
            <span className={styles.flags}>
              <AlgeriaFlag className={styles.flag} />
              <CanadaFlag className={styles.flag} />
            </span>
            {t('hero.eyebrow')}
          </p>

          <h1 id="hero-title" className={`${styles.title} ${styles.enter}`} style={step(1)}>
            {t('hero.titleLead')}{' '}
            <span className={`${styles.accent} ${styles.enter}`} style={step(3)}>
              {t('hero.titleAccent')}
            </span>
          </h1>

          <p className={`${styles.lead} ${styles.enter}`} style={step(3)}>
            {t('hero.lead')}
          </p>

          <div className={`${styles.ctas} ${styles.enter}`} style={step(4)}>
            <Button size="lg" arrow onClick={() => requestBooking()}>
              {t('hero.ctaPrimary')}
            </Button>
            <ButtonLink href="#pathfinder" size="lg" variant="secondary" icon="orientation">
              {t('hero.ctaSecondary')}
            </ButtonLink>
          </div>

          <ul className={`${styles.trust} ${styles.enter}`} style={step(5)}>
            <li>
              <Icon name="sparkle" size={18} />
              {t('hero.trustServices')}
            </li>
            <li>
              <Icon name="globe" size={18} />
              {t('hero.trustLanguages')}
            </li>
            <li>
              <Icon name="clock" size={18} />
              {t('hero.trustHours', { days: openDaysRange(intlLocale), hours: openHoursRange() })}
            </li>
          </ul>
        </div>

        <div className={`${styles.visual} ${styles.enterPass}`}>
          <BoardingPass />
        </div>
      </div>
    </section>
  );
}
