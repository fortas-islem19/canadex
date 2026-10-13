import { OFFICE_SCHEDULE, type Availability } from '@canadex/shared';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/createApp';
import { BookingService } from '../src/bookings/service';
import { SqliteBookingRepository } from '../src/bookings/sqliteRepository';
import { openDatabase } from '../src/db/sqlite';

const ADMIN_TOKEN = 'test-admin-token-1234567890';
// Tuesday 13 October 2026, 08:00 in Algiers.
const clock = () => new Date('2026-10-13T07:00:00Z');

const validBooking = {
  service: 'study',
  mode: 'office',
  date: '2026-10-14',
  time: '09:45',
  fullName: 'Amina Belkacem',
  phone: '0555 12 34 56',
  email: 'amina@example.com',
  wilaya: '16 · Alger',
  language: 'fr',
  notes: 'Admission in Montréal',
  consent: true,
};

function setup(options: { adminToken?: string; maxBookingsPer15Min?: number } = {}) {
  const repository = new SqliteBookingRepository(openDatabase(':memory:'));
  const bookings = new BookingService(repository, { schedule: OFFICE_SCHEDULE, clock });
  return createApp({ bookings, adminToken: ADMIN_TOKEN, logError: () => {}, ...options });
}

describe('public booking API', () => {
  let app: ReturnType<typeof setup>;
  beforeEach(() => {
    app = setup();
  });

  it('reports health', async () => {
    await request(app).get('/api/health').expect(200, { ok: true });
  });

  it('serves availability in the office time zone', async () => {
    const res = await request(app).get('/api/availability').expect(200);
    const availability = res.body as Availability;
    expect(availability.today).toBe('2026-10-13');
    expect(availability.days.map((day) => day.date)).not.toContain('2026-10-16'); // Friday
  });

  it('books a slot once, then refuses it', async () => {
    const created = await request(app).post('/api/bookings').send(validBooking).expect(201);
    expect(created.body.booking).toMatchObject({
      service: 'study',
      date: '2026-10-14',
      time: '09:45',
      status: 'new',
    });
    expect(created.body.booking.reference).toMatch(/^CDX-[A-Z2-9]{6}$/);
    expect(created.body.booking.phone).toBeUndefined(); // contact details are not echoed

    const availability = (await request(app).get('/api/availability')).body as Availability;
    const slot = availability.days
      .find((day) => day.date === '2026-10-14')
      ?.slots.find((entry) => entry.time === '09:45');
    expect(slot?.remaining).toBe(0);

    const again = await request(app).post('/api/bookings').send(validBooking).expect(409);
    expect(again.body).toEqual({ error: 'slot_unavailable' });
  });

  it('returns translatable validation codes per field', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...validBooking, phone: '12', consent: false })
      .expect(400);
    expect(res.body).toEqual({
      error: 'validation',
      fields: { phone: 'phone', consent: 'consent' },
    });
  });

  it('refuses closed days and slots off the grid', async () => {
    await request(app)
      .post('/api/bookings')
      .send({ ...validBooking, date: '2026-10-16' })
      .expect(409);
    await request(app)
      .post('/api/bookings')
      .send({ ...validBooking, time: '12:00' })
      .expect(409);
  });

  it('rejects malformed JSON', async () => {
    await request(app)
      .post('/api/bookings')
      .set('content-type', 'application/json')
      .send('{"service":')
      .expect(400, { error: 'validation' });
  });

  it('silently drops honeypot submissions', async () => {
    await request(app)
      .post('/api/bookings')
      .send({ ...validBooking, cdx_hp: 'https://spam.example' })
      .expect(202);
    const list = await request(app)
      .get('/api/admin/bookings')
      .set('authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(list.body.bookings).toHaveLength(0);
  });

  it('rate-limits booking attempts per client', async () => {
    const limited = setup({ maxBookingsPer15Min: 2 });
    await request(limited).post('/api/bookings').send({}).expect(400);
    await request(limited).post('/api/bookings').send({}).expect(400);
    await request(limited).post('/api/bookings').send({}).expect(429, { error: 'rate_limited' });
  });

  it('answers unknown API routes with JSON', async () => {
    await request(app).get('/api/nope').expect(404, { error: 'not_found' });
  });
});

describe('admin API', () => {
  it('is disabled without a configured token', async () => {
    const app = setup({ adminToken: undefined });
    await request(app).get('/api/admin/bookings').expect(503, { error: 'admin_disabled' });
  });

  it('requires the bearer token', async () => {
    const app = setup();
    await request(app).get('/api/admin/bookings').expect(401);
    await request(app)
      .get('/api/admin/bookings')
      .set('authorization', 'Bearer wrong-token')
      .expect(401, { error: 'unauthorized' });
  });

  it('lists, filters and updates bookings; cancelling frees the slot', async () => {
    const app = setup();
    const auth = { authorization: `Bearer ${ADMIN_TOKEN}` };
    const { body } = await request(app).post('/api/bookings').send(validBooking).expect(201);
    const reference: string = body.booking.reference;

    const list = await request(app).get('/api/admin/bookings').set(auth).expect(200);
    expect(list.body.bookings).toHaveLength(1);
    expect(list.body.bookings[0]).toMatchObject({
      reference,
      phone: '+213555123456',
      email: 'amina@example.com',
      status: 'new',
    });

    const search = await request(app).get('/api/admin/bookings?q=belkacem').set(auth);
    expect(search.body.bookings).toHaveLength(1);
    const none = await request(app).get('/api/admin/bookings?status=confirmed').set(auth);
    expect(none.body.bookings).toHaveLength(0);

    await request(app)
      .patch(`/api/admin/bookings/${reference}`)
      .set(auth)
      .send({ status: 'archived' })
      .expect(400);
    await request(app)
      .patch('/api/admin/bookings/CDX-NOPE00')
      .set(auth)
      .send({ status: 'confirmed' })
      .expect(404);

    const cancelled = await request(app)
      .patch(`/api/admin/bookings/${reference}`)
      .set(auth)
      .send({ status: 'cancelled' })
      .expect(200);
    expect(cancelled.body.booking.status).toBe('cancelled');

    // The slot is free again.
    await request(app).post('/api/bookings').send(validBooking).expect(201);
  });
});
