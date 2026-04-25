const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false,
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('provider_access_token')
      : null;

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const isAuthEndpoint = endpoint.startsWith('/provider/auth/');

  if (response.status === 401 && !_isRetry && !isAuthEndpoint) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request<T>(endpoint, options, true);
    }
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Session expired');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = Array.isArray(data?.message)
      ? data.message.join('. ')
      : data?.message || response.statusText;
    throw new ApiError(response.status, message, data);
  }

  return response.json();
}

// Dedup concurrent refresh calls — only the first caller hits the endpoint,
// others wait for the same promise to resolve.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = doRefreshToken();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function doRefreshToken(): Promise<boolean> {
  const refreshToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('provider_refresh_token')
      : null;

  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/provider/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('provider_access_token', data.access_token);
    localStorage.setItem('provider_refresh_token', data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('provider_access_token');
  localStorage.removeItem('provider_refresh_token');
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

// SWR fetcher — used as global fetcher in SWRConfig
export const swrFetcher = <T>(endpoint: string) => api.get<T>(endpoint);

export { ApiError, clearAuth };
