import type { BookingRequestInput } from '@canadex/shared';
import { useWatch } from 'react-hook-form';
import { MapleLeaf } from '../../components/Flags';
import { useLocale } from '../../i18n/useLocale';
import { endTime, formatDate } from '../../lib/format';
import type { BookingOutcome } from './model';
import styles from './Ticket.module.css';

/** Live "consultation pass" that fills in as the visitor completes the form. */
export function Ticket({ outcome }: { outcome: BookingOutcome | null }) {
  const { t, dict, intlLocale } = useLocale();
  const values = useWatch<BookingRequestInput>();
  const empty = '—';

  const rows = [
    [t('booking.ticket.service'), values.service ? dict.services.names[values.service] : empty],
    [
      t('booking.ticket.date'),
      values.date
        ? formatDate(values.date, intlLocale, { weekday: 'short', day: 'numeric', month: 'short' })
        : empty,
    ],
    [t('booking.ticket.time'), values.time ? `${values.time} – ${endTime(values.time)}` : empty],
    [t('booking.ticket.mode'), values.mode ? dict.booking.service.modes[values.mode] : empty],
    [t('booking.ticket.passenger'), values.fullName?.trim() || empty],
  ] as const;

  const booked = Boolean(outcome?.live);

  return (
    <div className={`${styles.ticket} ${booked ? styles.booked : ''}`} aria-live="polite">
      <div className={styles.band}>
        <MapleLeaf className={styles.leaf} />
        <span className={styles.title}>{t('booking.ticket.title')}</span>
        <span className={styles.status}>
          {booked ? t('booking.ticket.booked') : t('booking.ticket.draft')}
        </span>
      </div>
      <dl className={styles.rows}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd dir="auto" className={value === empty ? styles.empty : undefined}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className={styles.stub}>
        <span className={styles.reference} dir="ltr">
          {outcome?.confirmation.reference ?? 'CDX-······'}
        </span>
        <span className={styles.barcode} aria-hidden="true" />
      </div>
      {booked && (
        <span className={styles.stamp} aria-hidden="true">
          {t('booking.ticket.booked')}
        </span>
      )}
    </div>
  );
}
