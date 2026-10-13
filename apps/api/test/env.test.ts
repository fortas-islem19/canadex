import { describe, expect, it } from 'vitest';
import { loadEnv } from '../src/env';

describe('loadEnv', () => {
  it('keeps the SQLite file inside the app and trusts no proxy by default', () => {
    const env = loadEnv({});
    expect(env.ON_VERCEL).toBe(false);
    expect(env.DATABASE_PATH).toMatch(/apps\/api\/data\/canadex\.db$/);
    expect(env.TRUST_PROXY).toBe(0);
  });

  it('uses /tmp and trusts the platform proxy on Vercel', () => {
    const env = loadEnv({ VERCEL: '1' });
    expect(env.ON_VERCEL).toBe(true);
    expect(env.DATABASE_PATH).toBe('/tmp/canadex.db');
    expect(env.TRUST_PROXY).toBe(1);
  });

  it('lets explicit settings win on Vercel', () => {
    const env = loadEnv({ VERCEL: '1', DATABASE_PATH: '/mnt/data/bookings.db', TRUST_PROXY: '2' });
    expect(env.DATABASE_PATH).toBe('/mnt/data/bookings.db');
    expect(env.TRUST_PROXY).toBe(2);
  });
});
