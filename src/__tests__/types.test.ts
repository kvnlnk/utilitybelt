// ---------------------------------------------------------------------------
// Unit tests: Result<T> type and helpers (ok / err)
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { ok, err, type Result } from '@/lib/tools/types';

// Helper: assert a result is ok and return its value
function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

// Helper: assert a result is err and return its error message
function expectErr<T>(result: Result<T>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

describe('ok()', () => {
  it('creates a success result with a string value', () => {
    expect(expectOk(ok('hello'))).toBe('hello');
  });

  it('creates a success result with a number', () => {
    expect(expectOk(ok(42))).toBe(42);
  });

  it('creates a success result with an object', () => {
    const obj = { a: 1, b: [2, 3] };
    expect(expectOk(ok(obj))).toEqual(obj);
  });

  it('creates a success result with true constant', () => {
    expect(expectOk(ok(true as const))).toBe(true);
  });

  it('creates a success result with array', () => {
    expect(expectOk(ok([1, 2, 3]))).toEqual([1, 2, 3]);
  });
});

describe('err()', () => {
  it('creates an error result with a message', () => {
    expect(expectErr(err('something went wrong'))).toBe('something went wrong');
  });

  it('creates an error result with an empty string', () => {
    expect(expectErr(err(''))).toBe('');
  });
});

describe('type narrowing (runtime)', () => {
  it('narrows to success branch with if/else', () => {
    const r = ok('data');
    if (r.ok) {
      expect(r.value.length).toBeGreaterThan(0);
    } else {
      expect(true).toBe(false);
    }
  });

  it('narrows to error branch with if/else', () => {
    const r = err('fail');
    if (!r.ok) {
      expect(r.error).toContain('fail');
    } else {
      expect(true).toBe(false);
    }
  });
});
