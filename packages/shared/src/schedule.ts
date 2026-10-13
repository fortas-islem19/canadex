/**
 * Office opening hours and the slot engine.
 *
 * Both the API (source of truth) and the web app (offline fallback, calendar rendering)
 * use these functions, so the agenda is computed exactly the same way everywhere.
 * Dates are plain `YYYY-MM-DD` strings and times `HH:MM`, always in the office time zone.
 */

export interface OfficeSchedule {
  /** IANA time zone of the office. */
  timeZone: string;
  /** Fixed UTC offset of the office in minutes (Algeria does not observe DST). Used for calendar exports. */
  utcOffsetMinutes: number;
  /** Open weekdays: 0 = Sunday … 6 = Saturday. */
  openDays: readonly number[];
  openTime: string;
  closeTime: string;
  /** Periods without appointments, e.g. lunch: [['12:00', '13:00']]. */
  breaks: readonly (readonly [string, string])[];
  /** Length of one consultation. */
  slotMinutes: number;
  /** How many clients can be booked on the same slot (= number of consultants). */
  slotCapacity: number;
  /** How far ahead clients can book. */
  bookingWindowDays: number;
  /** Minimum delay between now and a same-day appointment. */
  minNoticeMinutes: number;
  /** One-off closures (`YYYY-MM-DD`), e.g. Islamic holidays whose date changes every year. */
  closedDates: readonly string[];
  /** Closures repeated every year (`MM-DD`). */
  closedMonthDays: readonly string[];
}

export const OFFICE_SCHEDULE: OfficeSchedule = {
  timeZone: 'Africa/Algiers',
  utcOffsetMinutes: 60,
  openDays: [0, 1, 2, 3, 4], // Sunday → Thursday
  openTime: '09:00',
  closeTime: '17:00',
  breaks: [['12:00', '13:00']],
  slotMinutes: 45,
  slotCapacity: 1,
  bookingWindowDays: 45,
  minNoticeMinutes: 120,
  // Add moving holidays here each year (Eid al-Fitr, Eid al-Adha, Awal Muharram, Achoura, Mawlid…).
  closedDates: [],
  // Fixed public holidays in Algeria: New Year, Yennayer, Labour Day, Independence Day, Revolution Day.
  closedMonthDays: ['01-01', '01-12', '05-01', '07-05', '11-01'],
};

export interface SlotAvailability {
  time: string;
  /** Places left on this slot (0 = fully booked). */
  remaining: number;
}

export interface DayAvailability {
  date: string;
  slots: SlotAvailability[];
}

export interface Availability {
  timeZone: string;
  today: string;
  lastDate: string;
  slotMinutes: number;
  /** Open days within the booking window that still have upcoming slots. */
  days: DayAvailability[];
}

/** Number of slot-holding bookings per slot, keyed by {@link slotKey}. */
export type SlotCounts = ReadonlyMap<string, number>;

export type SlotCheck = 'ok' | 'invalid' | 'closed' | 'past' | 'out_of_window';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const slotKey = (date: string, time: string): string => `${date}T${time}`;

export function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function toTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isIsoDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Current date and minute-of-day in the given time zone. */
export function zonedNow(
  timeZone: string,
  now: Date = new Date(),
): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? '00';
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    minutes: Number(part('hour')) * 60 + Number(part('minute')),
  };
}

export function isOfficeOpenOn(schedule: OfficeSchedule, date: string): boolean {
  return (
    schedule.openDays.includes(weekdayOf(date)) &&
    !schedule.closedDates.includes(date) &&
    !schedule.closedMonthDays.includes(date.slice(5))
  );
}

/** Start times of every consultation in a regular day, breaks excluded. */
export function dailySlotTimes(schedule: OfficeSchedule): string[] {
  const close = toMinutes(schedule.closeTime);
  const breaks = schedule.breaks.map(([start, end]) => [toMinutes(start), toMinutes(end)] as const);
  const times: string[] = [];
  let cursor = toMinutes(schedule.openTime);

  while (cursor + schedule.slotMinutes <= close) {
    const end = cursor + schedule.slotMinutes;
    const overlapping = breaks.find(([start, stop]) => cursor < stop && end > start);
    if (overlapping) {
      cursor = overlapping[1];
      continue;
    }
    times.push(toTime(cursor));
    cursor = end;
  }
  return times;
}

export function bookingWindow(schedule: OfficeSchedule, now: Date = new Date()) {
  const today = zonedNow(schedule.timeZone, now);
  return { today, from: today.date, to: addDays(today.date, schedule.bookingWindowDays) };
}

export function checkSlot(
  schedule: OfficeSchedule,
  date: string,
  time: string,
  now: Date = new Date(),
): SlotCheck {
  if (!isIsoDate(date) || !TIME_RE.test(time) || !dailySlotTimes(schedule).includes(time)) {
    return 'invalid';
  }
  const { today, to } = bookingWindow(schedule, now);
  if (date < today.date) return 'past';
  if (date > to) return 'out_of_window';
  if (!isOfficeOpenOn(schedule, date)) return 'closed';
  if (date === today.date && toMinutes(time) < today.minutes + schedule.minNoticeMinutes) {
    return 'past';
  }
  return 'ok';
}

export function buildAvailability(
  schedule: OfficeSchedule,
  counts: SlotCounts = new Map(),
  now: Date = new Date(),
): Availability {
  const { today, to } = bookingWindow(schedule, now);
  const times = dailySlotTimes(schedule);
  const days: DayAvailability[] = [];

  for (let offset = 0; offset <= schedule.bookingWindowDays; offset += 1) {
    const date = addDays(today.date, offset);
    if (!isOfficeOpenOn(schedule, date)) continue;

    const slots = times
      .filter((time) => checkSlot(schedule, date, time, now) === 'ok')
      .map((time) => ({
        time,
        remaining: Math.max(0, schedule.slotCapacity - (counts.get(slotKey(date, time)) ?? 0)),
      }));

    if (slots.length > 0) days.push({ date, slots });
  }

  return {
    timeZone: schedule.timeZone,
    today: today.date,
    lastDate: to,
    slotMinutes: schedule.slotMinutes,
    days,
  };
}
