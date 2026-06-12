import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// HTML entity encoder / decoder
// ---------------------------------------------------------------------------

const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ENTITY_MAP).map(([k, v]) => [v, k]),
);

// Also decode numeric entities &#NN; and &#xHH;
const NUMERIC_ENTITY_RE = /&#(\d+);|&#x([0-9a-fA-F]+);/g;
const NAMED_ENTITY_RE = new RegExp(
  Object.keys(REVERSE_MAP)
    .map((k) => k.replace(/[^a-zA-Z0-9]/g, (c) => '\\' + c))
    .join('|'),
  'g',
);

/**
 * Encode HTML special characters (&, <, >, ", ') into named entities.
 */
export function encodeEntities(input: string): Result<string> {
  try {
    const out = input.replace(/[&<>"']/g, (c) => ENTITY_MAP[c] || c);
    return ok(out);
  } catch (e: any) {
    return err(`Entity encode error: ${e.message}`);
  }
}

/**
 * Decode HTML named and numeric entities back to characters.
 */
export function decodeEntities(input: string): Result<string> {
  try {
    let out = input.replace(NAMED_ENTITY_RE, (m) => REVERSE_MAP[m] || m);
    out = out.replace(NUMERIC_ENTITY_RE, (_, dec, hex) => {
      const code = hex ? parseInt(hex, 16) : parseInt(dec, 10);
      return String.fromCodePoint(code);
    });
    return ok(out);
  } catch (e: any) {
    return err(`Entity decode error: ${e.message}`);
  }
}
