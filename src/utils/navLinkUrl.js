/** Dummy base for resolving relative URLs and bare fragments with URL(). */
const RESOLVE_BASE = 'https://example.invalid';

/**
 * Normalize user-entered href for storage and preview.
 * Prepends https:// for bare domains; preserves mailto:, tel:, relative paths, hashes.
 *
 * @param {string} raw
 * @returns {{ ok: boolean, href?: string, error?: string }}
 */
export function normalizeNavMenuHref(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter a URL' };
  }

  const hasColonScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);

  try {
    // Fragment-only
    if (trimmed.startsWith('#')) {
      new URL(trimmed, RESOLVE_BASE);
      return { ok: true, href: trimmed };
    }

    // Root-relative or path-relative (same-origin style paths)
    if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
      const u = new URL(trimmed, RESOLVE_BASE);
      return { ok: true, href: `${u.pathname}${u.search}${u.hash}` };
    }

    if (hasColonScheme) {
      new URL(trimmed);
      return { ok: true, href: trimmed };
    }

    // Plain email address → mailto:
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      const mailto = `mailto:${trimmed}`;
      new URL(mailto);
      return { ok: true, href: mailto };
    }

    // Bare domain / hostname-like (no scheme)
    if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      const withHttps = `https://${trimmed}`;
      new URL(withHttps);
      return { ok: true, href: withHttps };
    }

    const candidate = `https://${trimmed}`;
    new URL(candidate);
    return { ok: true, href: candidate };
  } catch {
    return { ok: false, error: 'Enter a valid URL' };
  }
}

/**
 * @param {string} href normalized href
 * @returns {'email' | 'phone' | 'anchor' | 'url'}
 */
export function detectNavLinkType(href) {
  if (!href) return 'url';
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('#')) return 'anchor';
  return 'url';
}

/**
 * Why a URL might look like a mistake while still parsing as valid http(s).
 *
 * @typedef {'no-tld' | 'single-char-tld' | 'trailing-dot'} SuspiciousUrlIssue
 */

/**
 * Classify likely user errors for http(s) URLs. Returns null when not suspicious.
 *
 * @param {string} href normalized href
 * @returns {SuspiciousUrlIssue | null}
 */
export function getSuspiciousUrlIssue(href) {
  if (!href) return null;

  if (!href.startsWith('http://') && !href.startsWith('https://')) {
    return null;
  }

  try {
    const url = new URL(href);
    const hostname = url.hostname;

    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return null;
    }

    // Trailing dot on hostname (e.g. https://example.)
    if (hostname.endsWith('.')) {
      return 'trailing-dot';
    }

    // No dots = no conventional TLD (e.g. https://word)
    if (!hostname.includes('.')) {
      return 'no-tld';
    }

    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];

    if (tld.length === 1) {
      return 'single-char-tld';
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Detect URLs that are technically valid but likely user errors.
 *
 * @param {string} href normalized href
 * @returns {boolean}
 */
export function isSuspiciousUrl(href) {
  return getSuspiciousUrlIssue(href) !== null;
}
