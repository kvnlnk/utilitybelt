// ---------------------------------------------------------------------------
// Unit tests: JSON tools — format, minify, validate
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, validateJson } from '@/lib/tools/json';
import { type Result } from '@/lib/tools/types';

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

function expectErr(result: Result<unknown>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

describe('formatJson', () => {
  it('pretty-prints valid JSON with default 2-space indent', () => {
    const result = expectOk(formatJson('{"a":1,"b":2}'));
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('pretty-prints with 4-space indent', () => {
    const result = expectOk(formatJson('{"a":1}', 4));
    expect(result).toBe('{\n    "a": 1\n}');
  });

  it('returns error for invalid JSON', () => {
    const errMsg = expectErr(formatJson('{invalid}'));
    expect(errMsg).toContain('Invalid JSON');
  });

  it('returns error for empty string', () => {
    const errMsg = expectErr(formatJson(''));
    expect(errMsg).toContain('Invalid JSON');
  });

  it('handles nested objects', () => {
    const result = expectOk(formatJson('{"a":{"b":[1,2,3]}}'));
    expect(result).toContain('"a"');
    expect(result).toContain('"b"');
    expect(result).toContain('1');
  });
});

describe('minifyJson', () => {
  it('removes whitespace from JSON', () => {
    const result = expectOk(minifyJson('{  "a" : 1  ,  "b" : 2  }'));
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('handles already-minified JSON', () => {
    const result = expectOk(minifyJson('{"a":1}'));
    expect(result).toBe('{"a":1}');
  });

  it('returns error for invalid JSON', () => {
    const errMsg = expectErr(minifyJson('not json'));
    expect(errMsg).toContain('Invalid JSON');
  });

  it('handles arrays', () => {
    const result = expectOk(minifyJson('[ 1, 2, 3 ]'));
    expect(result).toBe('[1,2,3]');
  });
});

describe('validateJson', () => {
  it('returns ok(true) for valid JSON', () => {
    const result = expectOk(validateJson('{"valid": true}'));
    expect(result).toBe(true);
  });

  it('accepts primitive JSON values', () => {
    expect(expectOk(validateJson('42'))).toBe(true);
    expect(expectOk(validateJson('"string"'))).toBe(true);
    expect(expectOk(validateJson('null'))).toBe(true);
    expect(expectOk(validateJson('true'))).toBe(true);
  });

  it('returns error for invalid JSON', () => {
    const errMsg = expectErr(validateJson('not valid'));
    expect(errMsg).toContain('Invalid JSON');
  });

  it('returns error for truncated JSON', () => {
    const errMsg = expectErr(validateJson('{"a":1'));
    expect(errMsg).toContain('Invalid JSON');
  });
});
