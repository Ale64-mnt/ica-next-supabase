// webapp/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanifica HTML in modo sicuro sia in SSR che nel browser.
 * Niente jsdom, niente tipi ballerini.
 */
export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'target', 'rel'],
  }) as string;
}
