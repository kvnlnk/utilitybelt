import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// URL encoding / decoding
// ---------------------------------------------------------------------------

/** Encode a string for safe use in a URL (percent-encoding). */
export function encodeUrl(input: string): Result<string> {
  try {
    return ok(encodeURIComponent(input));
  } catch (e: any) {
    return err(`URL encode failed: ${e.message}`);
  }
}

/** Decode a percent-encoded URL string back to its original form. */
export function decodeUrl(input: string): Result<string> {
  try {
    return ok(decodeURIComponent(input));
  } catch (e: any) {
    return err(`URL decode failed: ${e.message}`);
  }
}
