import type { BookingRequestInput } from '@canadex/shared';
import { useFormContext, useWatch } from 'react-hook-form';
import { Icon } from '../../../components/Icon';
import { dictionaries } from '../../../i18n';
import { useLocale } from '../../../i18n/useLocale';
import { endTime, formatDate } from '../../../lib/format';
import styles from '../Booking.module.css';

export function ReviewStep({ onEdit }: { onEdit: (step: number) => void }) {
  const { t, dict, intlLocale } = useLocale();
  const { control } = useFormContext<BookingRequestInput>();
  const values = useWatch({ control });

  const groups = [
    {
      step: 0,
      rows: [
        [t('booking.ticket.service'), values.service ? dict.services.names[values.service] : ''],
        [t('booking.ticket.mode'), values.mode ? dict.booking.service.modes[values.mode] : ''],
      ],
    },
    {
      step: 1,
      rows: [
        [t('booking.ticket.date'), values.date ? formatDate(values.date, intlLocale) : ''],
        [t('booking.ticket.time'), values.time ? `${values.time} – ${endTime(values.time)}` : ''],
      ],
    },
    {
      step: 2,
      rows: [
        [t('booking.details.fullName'), values.fullName],
        [t('booking.details.phone'), values.phone],
        [t('booking.details.email'), values.email],
        [t('booking.details.wilaya'), values.wilaya],
        [
          t('booking.details.language'),
          values.language ? dictionaries[values.language].common.languageName : '',
        ],
        [t('booking.review.notes'), values.notes],
      ],
    },
  ];

  return (
    <div className={styles.review}>
      {groups.map((group) => (
        <div key={group.step} className={styles.reviewGroup}>
          <dl>
            {group.rows
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className={styles.reviewRow}>
                  <dt>{label}</dt>
                  <dd dir="auto">{value}</dd>
                </div>
              ))}
          </dl>
          <button type="button" className={styles.edit} onClick={() => onEdit(group.step)}>
            <Icon name="review" size={16} />
            {t('booking.review.edit')}
          </button>
        </div>
      ))}
    </div>
  );
}
