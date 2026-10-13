import type { ServiceId } from '@canadex/shared';
import { Icon } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { SectionHeader } from '../../components/Section';
import { useLocale } from '../../i18n/useLocale';
import { useBookingIntent } from '../booking/bookingIntentContext';
import styles from './Services.module.css';

export function Services() {
  const { t, dict } = useLocale();
  const { requestBooking } = useBookingIntent();

  return (
    <section id="services" className={styles.section} aria-labelledby="services-title">
      <div className="container">
        <SectionHeader
          id="services-title"
          number="01"
          kicker={t('services.kicker')}
          title={t('services.title')}
          lead={t('services.lead')}
        />

        <div className={styles.grid}>
          {dict.services.items.map((item, index) => {
            const id = item.id as ServiceId;
            return (
              <Reveal as="article" key={id} delay={index % 3} className={styles.card}>
                <div className={styles.top}>
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.icon}>
                    <Icon name={id} size={24} />
                  </span>
                </div>
                <h3 className={styles.title}>{dict.services.names[id]}</h3>
                <p className={styles.summary}>{item.summary}</p>
                <ul className={styles.points}>
                  {item.points.map((point) => (
                    <li key={point}>
                      <Icon name="check" size={16} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className={styles.book} onClick={() => requestBooking(id)}>
                  {t('services.book')}
                  <Icon name="arrow" size={18} directional />
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
