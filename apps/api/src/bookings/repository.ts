import type { Booking, BookingListQuery, BookingStatus } from '@canadex/shared';

export type NewBooking = Omit<Booking, 'status' | 'createdAt' | 'updatedAt'>;

/** Thrown when a generated reference already exists, so the caller can retry with a new one. */
export class DuplicateReferenceError extends Error {
  constructor() {
    super('Duplicate booking reference');
  }
}

/**
 * Storage port for appointments. The app ships with SQLite; a PostgreSQL (or any other)
 * implementation only has to honour this contract — in particular `insertIfSlotAvailable`
 * must check capacity and insert atomically.
 */
export interface BookingRepository {
  /** Slot-holding bookings per slot (`YYYY-MM-DDTHH:MM`) between two dates, inclusive. */
  countSlotHolding(from: string, to: string): Promise<Map<string, number>>;
  /** Inserts the booking unless its slot already holds `capacity` bookings; returns `null` then. */
  insertIfSlotAvailable(booking: NewBooking, capacity: number): Promise<Booking | null>;
  list(query: BookingListQuery): Promise<Booking[]>;
  updateStatus(reference: string, status: BookingStatus): Promise<Booking | null>;
}
