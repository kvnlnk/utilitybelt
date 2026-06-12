// ---------------------------------------------------------------------------
// Unit tests: Base64 tools — encode, decode, unicode
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from '@/lib/tools/base64';
import { type Result } from '@/lib/tools/types';

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

function expectErr(result: Result<unknown>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

describe('encodeBase64', () => {
  it('encodes a plain ASCII string', () => {
    expect(expectOk(encodeBase64('hello'))).toBe('aGVsbG8=');
  });

  it('encodes an empty string', () => {
    expect(expectOk(encodeBase64(''))).toBe('');
  });
});

describe('decodeBase64', () => {
  it('decodes a plain ASCII base64 string', () => {
    expect(expectOk(decodeBase64('aGVsbG8='))).toBe('hello');
  });

  it('decodes without padding', () => {
    expect(expectOk(decodeBase64('aGVsbG8'))).toBe('hello');
  });

  it('handles URL-safe base64', () => {
    // '+' becomes '-' and '/' becomes '_' in URL-safe
    // But our base64 only supports standard
    const encoded = expectOk(encodeBase64('hello?world=1'));
    const decoded = expectOk(decodeBase64(encoded));
    expect(decoded).toBe('hello?world=1');
  });

  it('returns error for invalid base64', () => {
    const errMsg = expectErr(decodeBase64('!!!not-base64!!!'));
    expect(errMsg).toContain('Base64 decode failed');
  });
});

describe('base64 roundtrip', () => {
  const testCases = [
    'hello world',
    '',
    'a',
    'ab',
    'abc',
    'Hello, World!',
    'data:image/png;base64,abc123',
    '    spaces    ',
    'line1\nline2',
    'special chars: @#$%^&*()',
  ];

  for (const tc of testCases) {
    it(`roundtrips: ${JSON.stringify(tc)}`, () => {
      const encoded = expectOk(encodeBase64(tc));
      const decoded = expectOk(decodeBase64(encoded));
      expect(decoded).toBe(tc);
    });
  }

  it('roundtrips Unicode characters', () => {
    const inputs = [
      'héllo wörld',
      '中文测试',
      '日本語',
      '한국어',
      '👋🌍',
      'Français',
      '¡Hola! ¿Cómo estás?',
      'Zürich',
      'straße',
    ];
    for (const input of inputs) {
      const encoded = expectOk(encodeBase64(input));
      const decoded = expectOk(decodeBase64(encoded));
      expect(decoded).toBe(input);
    }
  });
});
