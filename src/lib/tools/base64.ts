import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Base64 tools — handles Unicode by round-tripping through encodeURIComponent
// ---------------------------------------------------------------------------

/**
 * Encode a string to base64. Handles Unicode correctly by encoding to
 * UTF-8 first via encodeURIComponent / unescape.
 */
export function encodeBase64(input: string): Result<string> {
  try {
    const utf8 = unescape(encodeURIComponent(input));
    return ok(btoa(utf8));
  } catch (e: any) {
    return err(`Base64 encode failed: ${e.message}`);
  }
}

/**
 * Decode a base64 string back to the original. Handles Unicode correctly.
 */
export function decodeBase64(input: string): Result<string> {
  try {
    const decoded = atob(input);
    return ok(decodeURIComponent(escape(decoded)));
  } catch (e: any) {
    return err(`Base64 decode failed: ${e.message}`);
  }
}
