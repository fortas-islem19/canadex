import type { ReactNode } from 'react';
import { ButtonLink } from '../../components/Button';
import { Icon, type IconName } from '../../components/Icon';
import { SectionHeader } from '../../components/Section';
import { SITE } from '../../config/site';
import { useLocale } from '../../i18n/useLocale';
import { closedDaysList, openDaysRange, openHoursRange } from '../../lib/format';
import { mapsLink, whatsappLink } from '../../lib/whatsapp';
import styles from './Contact.module.css';

function Row({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowIcon}>
        <Icon name={icon} size={20} />
      </span>
      <div>
        <dt className={styles.rowLabel}>{label}</dt>
        <dd className={styles.rowValue}>{children}</dd>
      </div>
    </div>
  );
}

export function Contact() {
  const { t, language, intlLocale } = useLocale();

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className="container">
        <SectionHeader
          id="contact-title"
          number="07"
          kicker={t('contact.kicker')}
          title={t('contact.title')}
          lead={t('contact.lead')}
        />

        <div className={styles.layout}>
          <dl className={styles.card}>
            <Row icon="pin" label={t('contact.address')}>
              {SITE.address[language]}
            </Row>
            <Row icon="clock" label={t('contact.hours')}>
              {openDaysRange(intlLocale)} · <span dir="ltr">{openHoursRange()}</span>
              <span className={styles.muted}>
                {t('contact.closed', { days: closedDaysList(intlLocale) })}
              </span>
            </Row>
            <Row icon="phone" label={t('contact.phone')}>
              <a href={`tel:${SITE.phoneHref}`} dir="ltr">
                {SITE.phoneDisplay}
              </a>
            </Row>
            <Row icon="chat" label={t('contact.whatsapp')}>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" dir="ltr">
                {SITE.whatsappDisplay}
              </a>
            </Row>
            <Row icon="mail" label={t('contact.email')}>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </Row>
          </dl>

          <div className={styles.map}>
            <div className={styles.mapGrid} aria-hidden="true" />
            <svg
              className={styles.roads}
              viewBox="0 0 400 300"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <path d="M-10 210 C 90 190, 140 120, 230 130 S 360 70, 420 60" />
              <path d="M60 -10 C 80 80, 150 160, 170 310" />
              <path d="M-10 90 C 120 110, 260 200, 420 230" />
            </svg>
            <div className={styles.pin}>
              <span className={styles.pulse} aria-hidden="true" />
              <Icon name="pin" size={28} />
            </div>
            <div className={styles.mapCard}>
              <strong>Canadex</strong>
              <span>{SITE.address[language]}</span>
              <p className={styles.note}>{t('contact.byAppointment')}</p>
              <div className={styles.mapActions}>
                <ButtonLink
                  href={mapsLink()}
                  target="_blank"
                  rel="noreferrer"
                  size="sm"
                  variant="secondary"
                  icon="pin"
                >
                  {t('contact.directions')}
                </ButtonLink>
                <ButtonLink href="#booking" size="sm" arrow>
                  {t('nav.bookShort')}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
