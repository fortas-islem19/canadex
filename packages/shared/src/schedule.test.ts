import { describe, expect, it } from 'vitest';
import {
  OFFICE_SCHEDULE,
  buildAvailability,
  checkSlot,
  dailySlotTimes,
  isIsoDate,
  isOfficeOpenOn,
  slotKey,
  zonedNow,
  type OfficeSchedule,
} from './schedule';

const schedule: OfficeSchedule = { ...OFFICE_SCHEDULE, closedDates: ['2026-10-20'] };
// Tuesday 13 October 2026, 08:00 in Algiers (07:00 UTC).
const now = new Date('2026-10-13T07:00:00Z');

describe('dailySlotTimes', () => {
  it('splits the day into consultations and skips the lunch break', () => {
    expect(dailySlotTimes(schedule)).toEqual([
      '09:00',
      '09:45',
      '10:30',
      '11:15',
      '13:00',
      '13:45',
      '14:30',
      '15:15',
      '16:00',
    ]);
  });

  it('never lets a consultation overlap a break', () => {
    const times = dailySlotTimes({ ...schedule, slotMinutes: 50 });
    expect(times).not.toContain('11:30');
    expect(times).toContain('13:00');
  });
});

describe('zonedNow', () => {
  it('uses the office time zone, not the machine one', () => {
    // 23:30 UTC on the 12th is already 00:30 on the 13th in Algiers.
    expect(zonedNow('Africa/Algiers', new Date('2026-10-12T23:30:00Z'))).toEqual({
      date: '2026-10-13',
      minutes: 30,
    });
  });
});

describe('isIsoDate', () => {
  it('rejects impossible dates', () => {
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-2-3')).toBe(false);
    expect(isIsoDate('2026-02-28')).toBe(true);
  });
});

describe('isOfficeOpenOn', () => {
  it('closes on the weekend, one-off closures and yearly holidays', () => {
    expect(isOfficeOpenOn(schedule, '2026-10-13')).toBe(true); // Tuesday
    expect(isOfficeOpenOn(schedule, '2026-10-16')).toBe(false); // Friday
    expect(isOfficeOpenOn(schedule, '2026-10-17')).toBe(false); // Saturday
    expect(isOfficeOpenOn(schedule, '2026-10-20')).toBe(false); // closedDates
    expect(isOfficeOpenOn(schedule, '2026-11-01')).toBe(false); // Revolution Day (a Sunday)
  });
});

describe('checkSlot', () => {
  it('accepts a regular future slot', () => {
    expect(checkSlot(schedule, '2026-10-14', '09:45', now)).toBe('ok');
  });

  it('rejects times that are not on the grid', () => {
    expect(checkSlot(schedule, '2026-10-14', '09:30', now)).toBe('invalid');
    expect(checkSlot(schedule, '2026-10-14', '12:00', now)).toBe('invalid');
  });

  it('enforces the minimum notice on the same day', () => {
    expect(checkSlot(schedule, '2026-10-13', '09:00', now)).toBe('past'); // only 1h notice
    expect(checkSlot(schedule, '2026-10-13', '10:30', now)).toBe('ok');
  });

  it('rejects closed days, the past and dates beyond the booking window', () => {
    expect(checkSlot(schedule, '2026-10-16', '09:00', now)).toBe('closed');
    expect(checkSlot(schedule, '2026-10-12', '09:00', now)).toBe('past');
    expect(checkSlot(schedule, '2026-12-31', '09:00', now)).toBe('out_of_window');
  });
});

describe('buildAvailability', () => {
  it('lists open days only, with remaining places per slot', () => {
    const counts = new Map([[slotKey('2026-10-14', '09:00'), 1]]);
    const availability = buildAvailability(schedule, counts, now);

    expect(availability.today).toBe('2026-10-13');
    expect(availability.lastDate).toBe('2026-11-27');
    const dates = availability.days.map((day) => day.date);
    expect(dates).not.toContain('2026-10-16');
    expect(dates).not.toContain('2026-10-20');

    const today = availability.days[0];
    expect(today?.date).toBe('2026-10-13');
    expect(today?.slots[0]?.time).toBe('10:30');

    const tomorrow = availability.days.find((day) => day.date === '2026-10-14');
    expect(tomorrow?.slots[0]).toEqual({ time: '09:00', remaining: 0 });
    expect(tomorrow?.slots[1]).toEqual({ time: '09:45', remaining: 1 });
  });

  it('drops today once the last slot is out of reach', () => {
    const evening = new Date('2026-10-13T16:00:00Z'); // 17:00 in Algiers
    expect(buildAvailability(schedule, new Map(), evening).days[0]?.date).toBe('2026-10-14');
  });
});
