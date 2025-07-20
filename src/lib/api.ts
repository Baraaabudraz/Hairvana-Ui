const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export async function apiFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  let headers: any = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  };

  // If body is FormData, do not set Content-Type (browser will set it)
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Prepend BASE_API_URL if url is relative (doesn't start with http)
  const fullUrl = url.startsWith('http') ? url : (url.startsWith(BASE_API_URL) ? url : `${BASE_API_URL}${url.startsWith('/') ? '' : '/'}${url}`);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Failed to fetch data from API');
  }

  return response.json();
}