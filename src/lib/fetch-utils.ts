// Utility functions for consistent fetch calls across the app

export interface FetchOptions extends RequestInit {
  retryOn401?: boolean;
  retryCount?: number;
}

export async function apiFetch(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const { retryOn401 = true, retryCount = 0, ...fetchOptions } = options;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...fetchOptions,
  });

  // Retry once on 401 if enabled and not already retried
  if (response.status === 401 && retryOn401 && retryCount === 0) {
    console.log('Retrying fetch after 401...');
    return apiFetch(url, { ...options, retryCount: 1 });
  }

  return response;
}

export async function apiGet(url: string, options: FetchOptions = {}) {
  return apiFetch(url, { ...options, method: 'GET' });
}

export async function apiPost(url: string, data?: any, options: FetchOptions = {}) {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPut(url: string, data?: any, options: FetchOptions = {}) {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiDelete(url: string, options: FetchOptions = {}) {
  return apiFetch(url, { ...options, method: 'DELETE' });
}
