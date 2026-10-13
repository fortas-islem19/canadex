import { existsSync } from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { adminBookingRoutes, publicBookingRoutes } from './bookings/routes';
import type { BookingService } from './bookings/service';
import { requireAdmin } from './http/adminAuth';
import { apiNotFound, errorHandler } from './http/errors';

export interface AppOptions {
  bookings: BookingService;
  adminToken?: string;
  corsOrigins?: string[];
  trustProxy?: number;
  /** Built website to serve next to the API (single-process deployment). */
  webDist?: string;
  maxBookingsPer15Min?: number;
  logError?: (error: unknown) => void;
}

export function createApp(options: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', options.trustProxy ?? 0);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
          'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
          // HTTPS is the reverse proxy's job; upgrading here breaks plain-HTTP local runs.
          'upgrade-insecure-requests': null,
        },
      },
    }),
  );

  const api = express.Router();
  if (options.corsOrigins?.length) api.use(cors({ origin: options.corsOrigins }));
  api.use(express.json({ limit: '16kb' }));

  api.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
  api.use(
    publicBookingRoutes(options.bookings, {
      maxBookingsPer15Min: options.maxBookingsPer15Min ?? 10,
    }),
  );
  api.use('/admin', requireAdmin(options.adminToken), adminBookingRoutes(options.bookings));
  api.use(apiNotFound);

  app.use('/api', api);

  const webDist = options.webDist;
  if (webDist && existsSync(path.join(webDist, 'index.html'))) {
    app.use(
      '/assets',
      express.static(path.join(webDist, 'assets'), { immutable: true, maxAge: '1y' }),
    );
    app.use(express.static(webDist, { index: false, maxAge: '1h' }));
    // Single-page app: every other GET renders index.html and the client router takes over.
    app.get('/{*path}', (_req, res) => {
      res.set('cache-control', 'no-cache').sendFile(path.join(webDist, 'index.html'));
    });
  }

  app.use(errorHandler(options.logError ?? ((error) => console.error(error))));
  return app;
}
