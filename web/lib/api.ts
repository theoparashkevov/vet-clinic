import { clearSession, getApiBaseUrl, getStoredToken } from './auth';

export class AuthError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

function emitAuthError(message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vet-clinic-auth-error', { detail: { message } }),
    );
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
    const message = 'Your session has expired. Please sign in again.';
    clearSession();
    emitAuthError(message);
    throw new AuthError(message);
  }

  if (response.status === 403) {
    // Treat forbidden as an auth boundary for Phase 1.
    // This keeps UX consistent by redirecting to /login.
    const message = "You don't have access to this resource. Please sign in with an authorized account.";
    clearSession();
    emitAuthError(message);
    throw new AuthError(message);
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
