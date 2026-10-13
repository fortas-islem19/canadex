import { z } from 'zod';
import { BOOKING_STATUSES, LANGUAGES, MEETING_MODES, SERVICE_IDS } from './catalog';
import type { BookingStatus, Language, MeetingMode, ServiceId } from './catalog';
import { normalizePhone } from './phone';
import { TIME_RE, isIsoDate } from './schedule';

/**
 * Validation error codes. The web app translates them (`booking.errors.<code>`)
 * and the API returns them per field, so both sides speak the same language.
 */
export type ValidationCode =
  'required' | 'service' | 'slot' | 'name' | 'phone' | 'email' | 'tooLong' | 'consent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const bookingRequestSchema = z.object({
  service: z.enum(SERVICE_IDS, { error: 'service' }),
  mode: z.enum(MEETING_MODES, { error: 'required' }),
  date: z.string({ error: 'slot' }).refine(isIsoDate, { error: 'slot' }),
  time: z.string({ error: 'slot' }).regex(TIME_RE, { error: 'slot' }),
  fullName: z
    .string({ error: 'name' })
    .trim()
    .min(2, { error: 'name' })
    .max(80, { error: 'tooLong' }),
  phone: z
    .string({ error: 'phone' })
    .trim()
    .refine((value) => normalizePhone(value) !== null, { error: 'phone' }),
  email: z
    .string()
    .trim()
    .max(120, { error: 'tooLong' })
    .refine((value) => value === '' || EMAIL_RE.test(value), { error: 'email' })
    .default(''),
  wilaya: z
    .string({ error: 'required' })
    .trim()
    .min(2, { error: 'required' })
    .max(60, { error: 'tooLong' }),
  language: z.enum(LANGUAGES, { error: 'required' }),
  notes: z.string().trim().max(1000, { error: 'tooLong' }).default(''),
  consent: z.boolean({ error: 'consent' }).refine((value) => value, { error: 'consent' }),
});

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequest = z.output<typeof bookingRequestSchema>;
export type BookingField = keyof BookingRequest;

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
});

export const bookingListQuerySchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  from: z.string().refine(isIsoDate).optional(),
  to: z.string().refine(isIsoDate).optional(),
  q: z.string().trim().max(80).optional(),
});
export type BookingListQuery = z.output<typeof bookingListQuerySchema>;

/** A stored appointment, as seen by the office. */
export interface Booking {
  reference: string;
  service: ServiceId;
  mode: MeetingMode;
  date: string;
  time: string;
  fullName: string;
  /** E.164 format. */
  phone: string;
  email: string | null;
  wilaya: string;
  language: Language;
  notes: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

/** What the client gets back after booking — no contact details echoed. */
export type BookingConfirmation = Pick<
  Booking,
  'reference' | 'service' | 'mode' | 'date' | 'time' | 'fullName' | 'language' | 'status'
>;

export type ApiErrorCode =
  | 'validation'
  | 'slot_unavailable'
  | 'rate_limited'
  | 'unauthorized'
  | 'admin_disabled'
  | 'not_found'
  | 'internal';

export interface ApiErrorBody {
  error: ApiErrorCode;
  /** Present when `error` is `validation`: field name → {@link ValidationCode}. */
  fields?: Partial<Record<string, ValidationCode | string>>;
}

/** Flattens zod issues into `{ field: code }`, keeping the first issue per field. */
export function issuesToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    fields[field] ??= issue.message;
  }
  return fields;
}
