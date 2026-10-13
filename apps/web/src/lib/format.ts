import { OFFICE_SCHEDULE, toMinutes } from '@canadex/shared';

const utcNoon = (date: string) => new Date(`${date}T12:00:00Z`);

export function formatDate(
  date: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' },
) {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(utcNoon(date));
}

export function formatMonth(year: number, month: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 15)));
}

/** Weekday name for 0 = Sunday … 6 = Saturday. */
export function weekdayName(
  day: number,
  locale: string,
  style: 'long' | 'short' | 'narrow' = 'long',
) {
  // 4 January 2026 is a Sunday.
  return new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(
    new Date(Date.UTC(2026, 0, 4 + day)),
  );
}

export function formatTime(time: string) {
  return time; // 24-hour clock is the norm in Algeria in every language.
}

export function endTime(time: string, minutes = OFFICE_SCHEDULE.slotMinutes) {
  const total = toMinutes(time) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** "Sunday – Thursday" built from the schedule, so the copy follows the configuration. */
export function openDaysRange(locale: string) {
  const days = OFFICE_SCHEDULE.openDays;
  const first = days[0] ?? 0;
  const last = days[days.length - 1] ?? 4;
  return `${weekdayName(first, locale)} – ${weekdayName(last, locale)}`;
}

export function closedDaysList(locale: string) {
  return [0, 1, 2, 3, 4, 5, 6]
    .filter((day) => !OFFICE_SCHEDULE.openDays.includes(day))
    .map((day) => weekdayName(day, locale))
    .join(' & ');
}

export function openHoursRange() {
  return `${OFFICE_SCHEDULE.openTime} – ${OFFICE_SCHEDULE.closeTime}`;
}
