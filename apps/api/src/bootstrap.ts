import { OFFICE_SCHEDULE } from '@canadex/shared';
import { createApp } from './createApp';
import { BookingService } from './bookings/service';
import { SqliteBookingRepository } from './bookings/sqliteRepository';
import { openDatabase } from './db/sqlite';
import { loadEnv, type Env } from './env';
import { WebhookNotifier } from './notifications/notifier';

/** Wires configuration, storage and HTTP together. Shared by every entrypoint. */
export function bootstrap(env: Env = loadEnv()) {
  if (env.ON_VERCEL && env.DATABASE_PATH.startsWith('/tmp/')) {
    console.warn(
      `[canadex] SQLite is at ${env.DATABASE_PATH} — Vercel's /tmp is per instance and wiped on cold starts, so bookings are NOT kept. Configure a hosted database before going live.`,
    );
  }

  const db = openDatabase(env.DATABASE_PATH);
  const bookings = new BookingService(new SqliteBookingRepository(db), {
    schedule: OFFICE_SCHEDULE,
    notifiers: env.NOTIFY_WEBHOOK_URL ? [new WebhookNotifier(env.NOTIFY_WEBHOOK_URL)] : [],
    onNotifyError: (error) => console.error('[notify] failed:', error),
  });

  const app = createApp({
    bookings,
    adminToken: env.ADMIN_TOKEN,
    corsOrigins: env.CORS_ORIGINS,
    trustProxy: env.TRUST_PROXY,
    webDist: env.WEB_DIST,
  });

  return { app, db, env };
}
