import { OFFICE_SCHEDULE } from '@canadex/shared';
import { createApp } from './app';
import { BookingService } from './bookings/service';
import { SqliteBookingRepository } from './bookings/sqliteRepository';
import { openDatabase } from './db/sqlite';
import { loadEnv } from './env';
import { WebhookNotifier } from './notifications/notifier';

const env = loadEnv();
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

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`[canadex] API listening on http://localhost:${env.PORT}`);
  console.log(`[canadex] database: ${env.DATABASE_PATH}`);
  if (!env.ADMIN_TOKEN)
    console.log('[canadex] ADMIN_TOKEN not set — the /admin back-office is disabled');
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
