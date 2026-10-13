import {
  bookingListQuerySchema,
  bookingRequestSchema,
  bookingStatusUpdateSchema,
  issuesToFields,
  type ApiErrorBody,
} from '@canadex/shared';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../http/errors';
import { BookingNotFoundError, SlotUnavailableError, type BookingService } from './service';

/** Hidden form field only bots fill in. */
export const HONEYPOT_FIELD = 'cdx_hp';

export function publicBookingRoutes(
  service: BookingService,
  options: { maxBookingsPer15Min: number },
) {
  const router = Router();

  router.get('/availability', async (_req, res) => {
    res.set('cache-control', 'no-store').json(await service.availability());
  });

  const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: options.maxBookingsPer15Min,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: 'rate_limited' } satisfies ApiErrorBody);
    },
  });

  router.post('/bookings', bookingLimiter, async (req, res) => {
    const body: unknown = req.body;
    if (body && typeof body === 'object' && (body as Record<string, unknown>)[HONEYPOT_FIELD]) {
      // Pretend it worked so bots do not adapt; nothing is stored.
      res.status(202).json({ ok: true });
      return;
    }

    const parsed = bookingRequestSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, 'validation', issuesToFields(parsed.error));

    try {
      res.status(201).json({ booking: await service.create(parsed.data) });
    } catch (error) {
      if (error instanceof SlotUnavailableError) throw new HttpError(409, 'slot_unavailable');
      throw error;
    }
  });

  return router;
}

export function adminBookingRoutes(service: BookingService) {
  const router = Router();

  router.get('/bookings', async (req, res) => {
    const query = bookingListQuerySchema.safeParse(req.query);
    if (!query.success) throw new HttpError(400, 'validation', issuesToFields(query.error));
    res.set('cache-control', 'no-store').json({ bookings: await service.list(query.data) });
  });

  router.patch('/bookings/:reference', async (req, res) => {
    const update = bookingStatusUpdateSchema.safeParse(req.body);
    if (!update.success) throw new HttpError(400, 'validation', issuesToFields(update.error));
    try {
      res.json({ booking: await service.updateStatus(req.params.reference, update.data.status) });
    } catch (error) {
      if (error instanceof BookingNotFoundError) throw new HttpError(404, 'not_found');
      throw error;
    }
  });

  return router;
}
