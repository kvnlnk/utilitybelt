// ---------------------------------------------------------------------------
// Unit tests: JWT decoder (no signature verification)
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { decodeJWT } from '@/lib/tools/jwt';
import { type Result } from '@/lib/tools/types';

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

function expectErr(result: Result<unknown>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

describe('decodeJWT', () => {
  it('decodes a well-formed JWT', () => {
    // Header: {"alg":"HS256","typ":"JWT"}
    // Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
      'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    const result = expectOk(decodeJWT(token));
    expect(result.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result.payload).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
    expect(result.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('handles JWT with kid in header', () => {
    const header = btoa(JSON.stringify({ alg: 'RS256', kid: 'abc123' }));
    const payload = btoa(JSON.stringify({ sub: 'user1' }));
    const token = `${header}.${payload}.signature`;
    const result = expectOk(decodeJWT(token));
    expect(result.header.kid).toBe('abc123');
    expect(result.payload.sub).toBe('user1');
  });

  it('returns error for less than 3 parts', () => {
    const errMsg = expectErr(decodeJWT('only.two'));
    expect(errMsg).toContain('Invalid JWT');
  });

  it('returns error for empty string', () => {
    const errMsg = expectErr(decodeJWT(''));
    expect(errMsg).toContain('Invalid JWT');
  });

  it('returns error for malformed base64 in header', () => {
    const errMsg = expectErr(decodeJWT('!!!.eyJzdWIiOiIxIn0.signature'));
    expect(errMsg).toContain('JWT decode failed');
  });

  it('returns error for non-JSON header', () => {
    const errMsg = expectErr(decodeJWT(`${btoa('not json')}.${btoa('{}')}.sig`));
    expect(errMsg).toContain('JWT decode failed');
  });

  it('handles JWT with nested payload objects', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ app_metadata: { role: 'admin' } }));
    const token = `${header}.${payload}.sig`;
    const result = expectOk(decodeJWT(token));
    expect(result.payload.app_metadata).toEqual({ role: 'admin' });
  });

  it('handles exp and iat timestamps in payload', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ exp: 2000000000, iat: 1000000000 }));
    const token = `${header}.${payload}.sig`;
    const result = expectOk(decodeJWT(token));
    expect(result.payload.exp).toBe(2000000000);
    expect(result.payload.iat).toBe(1000000000);
  });
});
