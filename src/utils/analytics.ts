/**
 * Google Analytics 4 (GA4) Integration Helper
 * Measurement ID: G-R32FKE5HHH
 */

export const GA_MEASUREMENT_ID = 'G-R32FKE5HHH';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Sends a SPA Page View event to Google Analytics 4
 * @param path URL path (e.g., '/?tool=cv-maker')
 * @param title Page or Tool title
 */
export function trackPageView(path?: string, title?: string) {
  if (typeof window === 'undefined') return;

  const currentPath = path || (window.location.pathname + window.location.search);
  const currentTitle = title || document.title;
  const currentUrl = `${window.location.origin}${currentPath.startsWith('/') ? currentPath : `/${currentPath}`}`;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: currentTitle,
        page_location: currentUrl,
        page_path: currentPath,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  } catch (err) {
    console.debug('[GA4] trackPageView error:', err);
  }
}

/**
 * Sends a Custom Event to Google Analytics 4
 * @param action Event name (e.g., 'tool_opened', 'download_pdf')
 * @param params Event parameters
 */
export function trackEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        ...params,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  } catch (err) {
    console.debug('[GA4] trackEvent error:', err);
  }
}
