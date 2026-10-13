import { OFFICE_SCHEDULE, toMinutes } from '@canadex/shared';

interface CalendarEvent {
  uid: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  location: string;
  description: string;
}

const escape = (value: string) =>
  value.replace(/[\\,;]/g, (match) => `\\${match}`).replace(/\n/g, '\\n');

function toUtcStamp(date: string, minutesOfDay: number) {
  const local = Date.parse(`${date}T00:00:00Z`) + minutesOfDay * 60_000;
  const utc = new Date(local - OFFICE_SCHEDULE.utcOffsetMinutes * 60_000);
  return utc
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** Builds an RFC 5545 calendar file that every calendar app can import. */
export function buildIcs(event: CalendarEvent): string {
  const start = toMinutes(event.time);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Canadex//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}@canadex`,
    `DTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')}`,
    `DTSTART:${toUtcStamp(event.date, start)}`,
    `DTEND:${toUtcStamp(event.date, start + event.durationMinutes)}`,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.location)}`,
    `DESCRIPTION:${escape(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.join('\r\n')}\r\n`;
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
