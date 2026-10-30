import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips HTML tags and decodes common HTML entities to return clean plain text.
 */
export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<\/(div|p|li|h[1-6])>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves short recognizable entity names / acronyms (e.g., BTRC, FHL)
 */
export function getShortEntityName(name?: string, fallback: string = 'Party'): string {
  if (!name) return fallback;
  if (/Bangladesh Telecommunication Regulatory Commission/i.test(name) || /^BTRC$/i.test(name)) return 'BTRC';
  if (/Fiber@Home/i.test(name) || /^FHL$/i.test(name)) return 'FHL';
  if (/Edotco/i.test(name)) return 'Edotco';
  if (name.length > 15) {
    const acronym = name.split(/\s+/).map((w) => w[0]).join('').toUpperCase();
    if (acronym.length >= 2 && acronym.length <= 6) return acronym;
  }
  return name;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a date string into a clean readable date (e.g. "24 Oct 2026")
 * Deterministic across server and client environments.
 */
export function formatDate(val?: string | null): string {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return val;
  }
}
