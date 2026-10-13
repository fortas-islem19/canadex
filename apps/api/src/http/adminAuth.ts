import { createHash, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { HttpError } from './errors';

const digest = (value: string) => createHash('sha256').update(value).digest();

/** Bearer-token guard for the back-office. Swap for real staff accounts when the team grows. */
export function requireAdmin(adminToken: string | undefined): RequestHandler {
  const expected = adminToken ? digest(adminToken) : null;

  return (req, _res, next) => {
    if (!expected) throw new HttpError(503, 'admin_disabled');
    const header = req.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token || !timingSafeEqual(digest(token), expected))
      throw new HttpError(401, 'unauthorized');
    next();
  };
}
