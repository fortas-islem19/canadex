import type { ApiErrorBody, ApiErrorCode } from '@canadex/shared';
import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    readonly fields?: ApiErrorBody['fields'],
  ) {
    super(code);
  }
}

export const apiNotFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not_found' } satisfies ApiErrorBody);
};

export function errorHandler(log: (error: unknown) => void): ErrorRequestHandler {
  return (error, _req, res, _next) => {
    if (error instanceof HttpError) {
      res
        .status(error.status)
        .json({ error: error.code, fields: error.fields } satisfies ApiErrorBody);
      return;
    }
    // Malformed JSON or an oversized body, raised by express.json().
    const status = (error as { status?: number }).status;
    if (status === 400 || status === 413) {
      res.status(status).json({ error: 'validation' } satisfies ApiErrorBody);
      return;
    }
    log(error);
    res.status(500).json({ error: 'internal' } satisfies ApiErrorBody);
  };
}
