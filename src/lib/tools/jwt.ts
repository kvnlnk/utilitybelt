import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// JWT decoder — splits by '.', base64-decodes header and payload
// ---------------------------------------------------------------------------

export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface JwtResult {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
}

/**
 * Decode a JWT token without verifying the signature.
 * Splits by '.', base64-decodes header and payload, leaves signature as raw.
 */
export function decodeJWT(token: string): Result<JwtResult> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return err('Invalid JWT: expected 3 dot-separated parts');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Helper: base64url-decode then JSON-parse
    const decodePart = (b64: string): unknown => {
      // Convert base64url to base64
      let standard = b64.replace(/-/g, '+').replace(/_/g, '/');
      // Pad if needed
      while (standard.length % 4 !== 0) standard += '=';
      const jsonStr = decodeURIComponent(escape(atob(standard)));
      return JSON.parse(jsonStr);
    };

    const header = decodePart(headerB64) as JwtHeader;
    const payload = decodePart(payloadB64) as JwtPayload;

    return ok({ header, payload, signature: signatureB64 });
  } catch (e: any) {
    return err(`JWT decode failed: ${e.message}`);
  }
}
