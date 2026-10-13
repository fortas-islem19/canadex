import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

/** apps/api — same depth from `src/` (dev) and `dist/` (build). */
export const API_ROOT = path.resolve(import.meta.dirname, '..');

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_PATH: z.string().default('data/canadex.db'),
  ADMIN_TOKEN: optionalString.refine((value) => !value || value.length >= 16, {
    error: 'ADMIN_TOKEN must be at least 16 characters long',
  }),
  CORS_ORIGIN: optionalString,
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  WEB_DIST: optionalString,
  NOTIFY_WEBHOOK_URL: optionalString.pipe(z.url().optional()),
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
  return {
    ...env,
    DATABASE_PATH:
      env.DATABASE_PATH === ':memory:'
        ? env.DATABASE_PATH
        : path.resolve(API_ROOT, env.DATABASE_PATH),
    WEB_DIST: path.resolve(API_ROOT, env.WEB_DIST ?? '../web/dist'),
    CORS_ORIGINS: env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [],
  };
}
