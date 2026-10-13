import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

/** apps/api — same depth from `src/` (dev) and `dist/` (build). */
export const API_ROOT = path.resolve(import.meta.dirname ?? process.cwd(), '..');

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_PATH: optionalString,
  ADMIN_TOKEN: optionalString.refine((value) => !value || value.length >= 16, {
    error: 'ADMIN_TOKEN must be at least 16 characters long',
  }),
  CORS_ORIGIN: optionalString,
  TRUST_PROXY: z.coerce.number().int().min(0).optional(),
  WEB_DIST: optionalString,
  NOTIFY_WEBHOOK_URL: optionalString.pipe(z.url().optional()),
  /** Set to "1" by Vercel at build and run time. */
  VERCEL: optionalString,
});

export type Env = ReturnType<typeof loadEnv>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env) {
  const envFile = path.join(API_ROOT, '.env');
  if (source === process.env && existsSync(envFile)) process.loadEnvFile(envFile);

  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map(
      (issue) => `  ${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(`Invalid environment:\n${details.join('\n')}`);
  }

  const env = parsed.data;
  const onVercel = env.VERCEL === '1';
  // Vercel functions have a read-only filesystem except /tmp, and sit behind one proxy hop.
  const databasePath = env.DATABASE_PATH ?? (onVercel ? '/tmp/canadex.db' : 'data/canadex.db');
  return {
    ...env,
    ON_VERCEL: onVercel,
    TRUST_PROXY: env.TRUST_PROXY ?? (onVercel ? 1 : 0),
    DATABASE_PATH:
      databasePath === ':memory:' ? databasePath : path.resolve(API_ROOT, databasePath),
    WEB_DIST: path.resolve(API_ROOT, env.WEB_DIST ?? '../web/dist'),
    CORS_ORIGINS: env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [],
  };
}
