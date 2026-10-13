import { bootstrap } from './bootstrap';

/** Long-running server for local development and self-hosting (`npm run dev` / `npm start`). */
const { app, db, env } = bootstrap();

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`[canadex] API listening on http://localhost:${env.PORT}`);
  console.log(`[canadex] database: ${env.DATABASE_PATH}`);
  if (!env.ADMIN_TOKEN) {
    console.log('[canadex] ADMIN_TOKEN not set — the /admin back-office is disabled');
  }
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
