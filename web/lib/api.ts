import { clearSession, getApiBaseUrl, getStoredToken } from './auth';

export class AuthError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // Ignore JSON parsing failures.
  }

  return `HTTP ${response.status}`;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
  options?: { auth?: boolean },
) {
  const headers = new Headers(init?.headers);

  if (options?.auth !== false) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearSession();
    throw new AuthError();
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response;
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
  options?: { auth?: boolean },
): Promise<T> {
  const response = await apiFetch(path, init, options);
  return (await response.json()) as T;
}
