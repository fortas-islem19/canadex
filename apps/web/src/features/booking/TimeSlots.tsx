import type { DayAvailability } from '@canadex/shared';
import { Icon } from '../../components/Icon';
import { useLocale } from '../../i18n/useLocale';
import { formatDate } from '../../lib/format';
import styles from './Calendar.module.css';
import slotStyles from './TimeSlots.module.css';

interface TimeSlotsProps {
  day: DayAvailability | undefined;
  value: string;
  onChange: (time: string) => void;
}

export function TimeSlots({ day, value, onChange }: TimeSlotsProps) {
  const { t, intlLocale } = useLocale();

  if (!day) {
    return (
      <div className={slotStyles.placeholder}>
        <Icon name="calendar" size={28} />
        <p>{t('booking.schedule.pickDay')}</p>
      </div>
    );
  }

  const groups = [
    ['morning', day.slots.filter((slot) => slot.time < '12:00')],
    ['afternoon', day.slots.filter((slot) => slot.time >= '12:00')],
  ] as const;
  const anyLeft = day.slots.some((slot) => slot.remaining > 0);

  return (
    <div className={slotStyles.slots}>
      <p className={`${styles.month} ${slotStyles.date}`}>{formatDate(day.date, intlLocale)}</p>
      {!anyLeft && <p className={slotStyles.none}>{t('booking.schedule.noSlots')}</p>}
      {groups.map(
        ([key, slots]) =>
          slots.length > 0 && (
            <div key={key} role="group" aria-label={t(`booking.schedule.${key}`)}>
              <p className={slotStyles.label}>{t(`booking.schedule.${key}`)}</p>
              <div className={slotStyles.grid}>
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    dir="ltr"
                    className={slotStyles.slot}
                    aria-pressed={slot.time === value}
                    disabled={slot.remaining === 0}
                    onClick={() => onChange(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ),
      )}
    </div>
  );
}
