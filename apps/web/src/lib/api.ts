import type { ApiErrorBody, ApiErrorCode } from '@canadex/shared';
import { API_URL } from '../config/site';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | 'network',
    readonly fields: ApiErrorBody['fields'] = {},
  ) {
    super(code);
  }
}

/** JSON fetch against the Canadex API; throws {@link ApiError} with the API's error code. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: {
        accept: 'application/json',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'network');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body: unknown = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const error = (body ?? {}) as Partial<ApiErrorBody>;
    throw new ApiError(response.status, error.error ?? 'network', error.fields);
  }
  // A non-JSON 200 means a static host answered instead of the API.
  if (!isJson) throw new ApiError(response.status, 'network');
  return body as T;
}
