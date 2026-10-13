import type {
  BookingConfirmation,
  BookingField,
  BookingRequest,
  BookingRequestInput,
  Language,
} from '@canadex/shared';
import type { DefaultValues } from 'react-hook-form';

export const STEP_FIELDS: BookingField[][] = [
  ['service', 'mode'],
  ['date', 'time'],
  ['fullName', 'phone', 'email', 'wilaya', 'language', 'notes', 'consent'],
  [],
];

export const LAST_STEP = STEP_FIELDS.length - 1;

export function stepOfField(field: string) {
  const index = STEP_FIELDS.findIndex((fields) => (fields as string[]).includes(field));
  return index === -1 ? 0 : index;
}

export function emptyBooking(language: Language): DefaultValues<BookingRequestInput> {
  return {
    service: undefined,
    mode: 'office',
    date: '',
    time: '',
    fullName: '',
    phone: '',
    email: '',
    wilaya: '',
    language,
    notes: '',
    consent: false,
  };
}

export interface BookingOutcome {
  /** `false` when the request still has to be sent over WhatsApp (API unreachable). */
  live: boolean;
  confirmation: BookingConfirmation;
  request: BookingRequest;
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Request number for the WhatsApp fallback, distinct from server references (CDX-…). */
export function localReference() {
  const random = crypto.getRandomValues(new Uint32Array(6));
  return `WEB-${Array.from(random, (value) => ALPHABET[value % ALPHABET.length]).join('')}`;
}
