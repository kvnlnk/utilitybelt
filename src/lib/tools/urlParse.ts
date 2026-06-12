import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// URL Parser — parse a URL into its components
// ---------------------------------------------------------------------------

export interface UrlComponents {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
  origin: string;
  href: string;
}

/**
 * Parse a URL string into its individual components.
 * Uses the native URL constructor under the hood.
 */
export function parseUrl(url: string): Result<UrlComponents> {
  try {
    if (!url.trim()) {
      return err('Please enter a URL.');
    }

    // Auto-prepend protocol if missing
    let urlStr = url.trim();
    if (!/^https?:\/\//i.test(urlStr)) {
      urlStr = 'https://' + urlStr;
    }

    let parsed: URL;
    try {
      parsed = new URL(urlStr);
    } catch {
      return err('Invalid URL format. Please enter a valid URL (e.g., https://example.com/path?q=1).');
    }

    // Parse search params into key-value pairs
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return ok({
      protocol: parsed.protocol,
      host: parsed.host,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      params,
      origin: parsed.origin,
      href: parsed.href,
    });
  } catch (e: any) {
    return err(`URL parse error: ${e.message}`);
  }
}
