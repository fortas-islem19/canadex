import {
  buildAvailability,
  bookingWindow,
  checkSlot,
  normalizePhone,
  type Booking,
  type BookingConfirmation,
  type BookingListQuery,
  type BookingRequest,
  type BookingStatus,
  type OfficeSchedule,
} from '@canadex/shared';
import type { BookingNotifier } from '../notifications/notifier';
import { generateReference } from './reference';
import { DuplicateReferenceError, type BookingRepository } from './repository';

export class SlotUnavailableError extends Error {
  constructor(readonly reason: string) {
    super(`Slot unavailable: ${reason}`);
  }
}

export class BookingNotFoundError extends Error {}

export interface BookingServiceOptions {
  schedule: OfficeSchedule;
  notifiers?: BookingNotifier[];
  clock?: () => Date;
  onNotifyError?: (error: unknown) => void;
}

/** Booking use cases, independent from HTTP and from the storage engine. */
export class BookingService {
  private readonly clock: () => Date;

  constructor(
    private readonly repository: BookingRepository,
    private readonly options: BookingServiceOptions,
  ) {
    this.clock = options.clock ?? (() => new Date());
  }

  get schedule() {
    return this.options.schedule;
  }

  async availability() {
    const now = this.clock();
    const { from, to } = bookingWindow(this.schedule, now);
    const counts = await this.repository.countSlotHolding(from, to);
    return buildAvailability(this.schedule, counts, now);
  }

  async create(request: BookingRequest): Promise<BookingConfirmation> {
    const check = checkSlot(this.schedule, request.date, request.time, this.clock());
    if (check !== 'ok') throw new SlotUnavailableError(check);

    const booking = await this.insertWithUniqueReference(request);
    if (!booking) throw new SlotUnavailableError('full');

    this.notify(booking);
    return {
      reference: booking.reference,
      service: booking.service,
      mode: booking.mode,
      date: booking.date,
      time: booking.time,
      fullName: booking.fullName,
      language: booking.language,
      status: booking.status,
    };
  }

  list(query: BookingListQuery) {
    return this.repository.list(query);
  }

  async updateStatus(reference: string, status: BookingStatus) {
    const booking = await this.repository.updateStatus(reference, status);
    if (!booking) throw new BookingNotFoundError(reference);
    return booking;
  }

  private async insertWithUniqueReference(request: BookingRequest): Promise<Booking | null> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.repository.insertIfSlotAvailable(
          {
            reference: generateReference(),
            service: request.service,
            mode: request.mode,
            date: request.date,
            time: request.time,
            fullName: request.fullName,
            phone: normalizePhone(request.phone) ?? request.phone,
            email: request.email || null,
            wilaya: request.wilaya,
            language: request.language,
            notes: request.notes,
          },
          this.schedule.slotCapacity,
        );
      } catch (error) {
        if (!(error instanceof DuplicateReferenceError) || attempt >= 4) throw error;
      }
    }
  }

  /** Fire-and-forget: a failing notification must never fail the booking. */
  private notify(booking: Booking) {
    for (const notifier of this.options.notifiers ?? []) {
      notifier.bookingCreated(booking).catch((error) => this.options.onNotifyError?.(error));
    }
  }
}
