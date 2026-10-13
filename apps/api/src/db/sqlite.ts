import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type SqliteDatabase = Database.Database;

/**
 * Ordered schema migrations. Never edit a shipped migration — append a new one.
 * The index + 1 is stored in `PRAGMA user_version`.
 */
const MIGRATIONS: string[] = [
  `CREATE TABLE bookings (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     reference   TEXT NOT NULL UNIQUE,
     service     TEXT NOT NULL,
     mode        TEXT NOT NULL,
     date        TEXT NOT NULL,
     time        TEXT NOT NULL,
     full_name   TEXT NOT NULL,
     phone       TEXT NOT NULL,
     email       TEXT,
     wilaya      TEXT NOT NULL,
     language    TEXT NOT NULL,
     notes       TEXT NOT NULL DEFAULT '',
     status      TEXT NOT NULL DEFAULT 'new',
     created_at  TEXT NOT NULL,
     updated_at  TEXT NOT NULL
   );
   CREATE INDEX bookings_slot_idx ON bookings (date, time);
   CREATE INDEX bookings_status_idx ON bookings (status);`,
];

export function openDatabase(file: string): SqliteDatabase {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(db: SqliteDatabase) {
  const current = db.pragma('user_version', { simple: true }) as number;
  MIGRATIONS.slice(current).forEach((sql, offset) => {
    db.transaction(() => {
      db.exec(sql);
      db.pragma(`user_version = ${current + offset + 1}`);
    })();
  });
}
