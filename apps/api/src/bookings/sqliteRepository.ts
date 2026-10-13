import {
  SLOT_HOLDING_STATUSES,
  slotKey,
  type Booking,
  type BookingListQuery,
  type BookingStatus,
  type Language,
  type MeetingMode,
  type ServiceId,
} from '@canadex/shared';
import type { SqliteDatabase } from '../db/sqlite';
import { DuplicateReferenceError, type BookingRepository, type NewBooking } from './repository';

interface BookingRow {
  reference: string;
  service: string;
  mode: string;
  date: string;
  time: string;
  full_name: string;
  phone: string;
  email: string | null;
  wilaya: string;
  language: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const HOLDING = SLOT_HOLDING_STATUSES.map((status) => `'${status}'`).join(', ');

const toBooking = (row: BookingRow): Booking => ({
  reference: row.reference,
  service: row.service as ServiceId,
  mode: row.mode as MeetingMode,
  date: row.date,
  time: row.time,
  fullName: row.full_name,
  phone: row.phone,
  email: row.email,
  wilaya: row.wilaya,
  language: row.language as Language,
  notes: row.notes,
  status: row.status as BookingStatus,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class SqliteBookingRepository implements BookingRepository {
  private readonly statements;

  constructor(private readonly db: SqliteDatabase) {
    this.statements = {
      countRange: db.prepare<[string, string], { date: string; time: string; total: number }>(
        `SELECT date, time, COUNT(*) AS total FROM bookings
          WHERE date BETWEEN ? AND ? AND status IN (${HOLDING})
          GROUP BY date, time`,
      ),
      countSlot: db.prepare<[string, string], { total: number }>(
        `SELECT COUNT(*) AS total FROM bookings
          WHERE date = ? AND time = ? AND status IN (${HOLDING})`,
      ),
      insert: db.prepare(
        `INSERT INTO bookings (reference, service, mode, date, time, full_name, phone, email,
                               wilaya, language, notes, status, created_at, updated_at)
         VALUES (@reference, @service, @mode, @date, @time, @fullName, @phone, @email,
                 @wilaya, @language, @notes, 'new', @now, @now)`,
      ),
      byReference: db.prepare<[string], BookingRow>(`SELECT * FROM bookings WHERE reference = ?`),
      updateStatus: db.prepare<[string, string, string]>(
        `UPDATE bookings SET status = ?, updated_at = ? WHERE reference = ?`,
      ),
    };
  }

  async countSlotHolding(from: string, to: string) {
    const counts = new Map<string, number>();
    for (const row of this.statements.countRange.all(from, to)) {
      counts.set(slotKey(row.date, row.time), row.total);
    }
    return counts;
  }

  async insertIfSlotAvailable(booking: NewBooking, capacity: number) {
    // IMMEDIATE takes the write lock up front: two requests cannot both see a free slot.
    const insert = this.db.transaction((): Booking | null => {
      const taken = this.statements.countSlot.get(booking.date, booking.time)?.total ?? 0;
      if (taken >= capacity) return null;
      try {
        this.statements.insert.run({ ...booking, now: new Date().toISOString() });
      } catch (error) {
        if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw new DuplicateReferenceError();
        }
        throw error;
      }
      const row = this.statements.byReference.get(booking.reference);
      return row ? toBooking(row) : null;
    });
    return insert.immediate();
  }

  async list(query: BookingListQuery) {
    const where: string[] = [];
    const params: Record<string, string> = {};
    if (query.status) {
      where.push('status = @status');
      params.status = query.status;
    }
    if (query.from) {
      where.push('date >= @from');
      params.from = query.from;
    }
    if (query.to) {
      where.push('date <= @to');
      params.to = query.to;
    }
    if (query.q) {
      where.push(
        `(reference LIKE @q OR full_name LIKE @q OR phone LIKE @q OR email LIKE @q OR wilaya LIKE @q)`,
      );
      params.q = `%${query.q.replace(/[%_]/g, '')}%`;
    }
    const sql = `SELECT * FROM bookings ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                 ORDER BY date, time, created_at LIMIT 1000`;
    return this.db.prepare<Record<string, string>, BookingRow>(sql).all(params).map(toBooking);
  }

  async updateStatus(reference: string, status: BookingStatus) {
    const result = this.statements.updateStatus.run(status, new Date().toISOString(), reference);
    if (result.changes === 0) return null;
    const row = this.statements.byReference.get(reference);
    return row ? toBooking(row) : null;
  }
}
