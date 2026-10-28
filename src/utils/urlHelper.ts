/**
 * Returns the 100% public URL for The MoSaFa Tools.
 * Replaces private 'ais-dev-' URLs with public 'ais-pre-' URLs
 * so mobile devices, QR scanners, and shared links never encounter Google 403 auth errors.
 */
export const PUBLIC_SHARED_URL = 'https://ais-pre-vzob6g5trhnzc2w7qmf6to-580416772203.asia-southeast1.run.app';

export function getPublicBaseUrl(): string {
  if (typeof window === 'undefined') return PUBLIC_SHARED_URL;
  const origin = window.location.origin;
  if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return PUBLIC_SHARED_URL;
  }
  // Convert private dev URL to public preview URL
  if (origin.includes('ais-dev-')) {
    return origin.replace('ais-dev-', 'ais-pre-');
  }
  return origin;
}

export function getPublicFullUrl(queryString: string = ''): string {
  const base = getPublicBaseUrl();
  if (!queryString) return base;
  const cleanQuery = queryString.startsWith('?') ? queryString : `?${queryString}`;
  return `${base}${cleanQuery}`;
}
