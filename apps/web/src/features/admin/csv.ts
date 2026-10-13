import type { Booking } from '@canadex/shared';

const COLUMNS: (keyof Booking)[] = [
  'reference',
  'date',
  'time',
  'service',
  'mode',
  'fullName',
  'phone',
  'email',
  'wilaya',
  'language',
  'notes',
  'status',
  'createdAt',
];

function cell(value: unknown) {
  const text = value == null ? '' : String(value);
  // Neutralise spreadsheet formulas and quote everything.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** CSV with a BOM so Excel opens Arabic and accented names correctly. */
export function bookingsToCsv(bookings: Booking[]) {
  const lines = [
    COLUMNS.join(','),
    ...bookings.map((booking) => COLUMNS.map((key) => cell(booking[key])).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}
