const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
const BACKEND_BASE_URL = import.meta.env.BACKEND_BASE_URL;

export async function apiFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  
  // Check if token is valid before using it
  if (token) {
    try {
      const { isTokenValid } = await import('@/lib/tokenUtils');
      if (!isTokenValid(token)) {
        localStorage.removeItem('token');
        throw new Error('Token is invalid or expired');
      }
    } catch (error) {
      localStorage.removeItem('token');
      throw new Error('Token validation failed');
    }
  }
  
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

/**
 * Constructs a proper image URL for salon images
 * @param imagePath - The full URL or relative path from the API response
 * @returns The full URL for the image
 */
export function getSalonImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path, construct the full URL
  if (imagePath.startsWith('/')) {
    return `${BACKEND_BASE_URL}${imagePath}`;
  }
  
  // If it's just a filename, construct the full path
  return `${BACKEND_BASE_URL}/images/salon/${imagePath}`;
}

/**
 * Constructs proper image URLs for salon gallery
 * @param gallery - Array of image paths from the API response
 * @returns Array of full URLs for the images
 */
export function getSalonGalleryUrls(gallery: (string | null | undefined)[]): string[] {
  return gallery.map(img => getSalonImageUrl(img)).filter(url => url !== '');
}