import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Hashing tools — SHA-1/256/384/512 via crypto.subtle, plus UUID generation
// ---------------------------------------------------------------------------

const HASH_ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
export type HashAlgorithm = typeof HASH_ALGOS[number];

/**
 * Hash a string using the given algorithm via the Web Crypto API.
 * Returns the hex-encoded digest.
 */
export async function hashText(
  input: string,
  algorithm: HashAlgorithm = 'SHA-256',
): Promise<Result<string>> {
  try {
    if (!HASH_ALGOS.includes(algorithm)) {
      return err(`Unsupported hash algorithm: ${algorithm}. Use: ${HASH_ALGOS.join(', ')}`);
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return ok(hex);
  } catch (e: any) {
    return err(`Hash error: ${e.message}`);
  }
}

/**
 * Generate a v4 UUID using crypto.randomUUID().
 */
export function generateUUID(): Result<string> {
  try {
    return ok(crypto.randomUUID());
  } catch (e: any) {
    return err(`UUID generation failed: ${e.message}`);
  }
}
