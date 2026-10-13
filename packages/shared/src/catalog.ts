/**
 * Canonical identifiers shared by the web app, the API and the database.
 * Labels live in the web app's locale files; only stable IDs belong here.
 */

export const SERVICE_IDS = [
  'study',
  'work',
  'immigration',
  'visit',
  'family',
  'review',
  'orientation',
] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const MEETING_MODES = ['office', 'video'] as const;
export type MeetingMode = (typeof MEETING_MODES)[number];

export const LANGUAGES = ['ar', 'fr', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const BOOKING_STATUSES = ['new', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Statuses that keep occupying their slot in the agenda (everything except a cancellation). */
export const SLOT_HOLDING_STATUSES: readonly BookingStatus[] = BOOKING_STATUSES.filter(
  (status) => status !== 'cancelled',
);

export function isServiceId(value: unknown): value is ServiceId {
  return typeof value === 'string' && (SERVICE_IDS as readonly string[]).includes(value);
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}
