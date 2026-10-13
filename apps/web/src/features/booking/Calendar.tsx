import { OFFICE_SCHEDULE, addDays, isOfficeOpenOn, weekdayOf } from '@canadex/shared';
import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useLocale } from '../../i18n/useLocale';
import { formatDate, formatMonth, weekdayName } from '../../lib/format';
import type { AvailabilityState } from './api';
import styles from './Calendar.module.css';

type DayStatus = 'available' | 'full' | 'closed' | 'out';

interface CalendarProps {
  availability: AvailabilityState;
  value: string;
  onChange: (date: string) => void;
}

const monthKey = (date: string) => date.slice(0, 7); // YYYY-MM

function shiftMonth(key: string, delta: number) {
  const [year = 2026, month = 1] = key.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return shifted.toISOString().slice(0, 7);
}

/** Month grid starting on Sunday — the first day of the Algerian working week. */
function monthCells(key: string): (string | null)[] {
  const first = `${key}-01`;
  const leading = weekdayOf(first);
  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let date = first; monthKey(date) === key; date = addDays(date, 1)) cells.push(date);
  return cells;
}

export function Calendar({ availability, value, onChange }: CalendarProps) {
  const { t, intlLocale, language } = useLocale();
  const firstMonth = monthKey(availability.today);
  const lastMonth = monthKey(availability.lastDate);
  const [view, setView] = useState(() =>
    monthKey(value || availability.days[0]?.date || availability.today),
  );

  const days = useMemo(
    () => new Map(availability.days.map((day) => [day.date, day])),
    [availability.days],
  );

  const statusOf = (date: string): DayStatus => {
    if (date < availability.today || date > availability.lastDate) return 'out';
    if (!isOfficeOpenOn(OFFICE_SCHEDULE, date)) return 'closed';
    const day = days.get(date);
    if (!day) return 'out';
    return day.slots.some((slot) => slot.remaining > 0) ? 'available' : 'full';
  };

  const statusLabel: Record<DayStatus, string> = {
    available: t('booking.schedule.available'),
    full: t('booking.schedule.full'),
    closed: t('booking.schedule.closed'),
    out: '',
  };

  const [year = 2026, month = 1] = view.split('-').map(Number);
  const monthLabel = formatMonth(year, month - 1, intlLocale);

  return (
    <div className={styles.calendar}>
      <div className={styles.head}>
        <button
          type="button"
          className={styles.nav}
          aria-label={t('booking.schedule.prevMonth')}
          disabled={view <= firstMonth}
          onClick={() => setView(shiftMonth(view, -1))}
        >
          <Icon name="chevronLeft" size={18} directional />
        </button>
        <p className={styles.month} aria-live="polite">
          {monthLabel}
        </p>
        <button
          type="button"
          className={styles.nav}
          aria-label={t('booking.schedule.nextMonth')}
          disabled={view >= lastMonth}
          onClick={() => setView(shiftMonth(view, 1))}
        >
          <Icon name="chevronRight" size={18} directional />
        </button>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <span key={day}>
            {weekdayName(day, intlLocale, language === 'ar' ? 'narrow' : 'short')}
          </span>
        ))}
      </div>

      <div className={styles.days} role="group" aria-label={monthLabel}>
        {monthCells(view).map((date, index) => {
          if (!date) return <span key={`blank-${index}`} />;
          const status = statusOf(date);
          const label = [formatDate(date, intlLocale), statusLabel[status]]
            .filter(Boolean)
            .join(' — ');
          return (
            <button
              key={date}
              type="button"
              className={styles.day}
              data-status={status}
              data-today={date === availability.today || undefined}
              aria-pressed={date === value}
              aria-label={label}
              disabled={status !== 'available'}
              onClick={() => onChange(date)}
            >
              {Number(date.slice(8))}
            </button>
          );
        })}
      </div>

      <ul className={styles.legend}>
        <li data-status="available">{t('booking.schedule.available')}</li>
        <li data-status="full">{t('booking.schedule.full')}</li>
        <li data-status="closed">{t('booking.schedule.closed')}</li>
      </ul>
    </div>
  );
}
