// ---------------------------------------------------------------------------
// Unit tests: Text diff — LCS-based character diff
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { diffText } from '@/lib/tools/diff';
import { type Result } from '@/lib/tools/types';

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

function expectErr(result: Result<unknown>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

describe('diffText', () => {
  it('returns empty ops for identical strings', () => {
    const ops = expectOk(diffText('hello', 'hello'));
    expect(ops).toEqual([{ type: 'keep', value: 'hello' }]);
  });

  it('detects additions', () => {
    const ops = expectOk(diffText('abc', 'abcd'));
    expect(ops).toContainEqual({ type: 'add', value: 'd' });
  });

  it('detects removals', () => {
    const ops = expectOk(diffText('abcd', 'abc'));
    expect(ops).toContainEqual({ type: 'remove', value: 'd' });
  });

  it('detects character changes (remove+add)', () => {
    const ops = expectOk(diffText('abc', 'axc'));
    // Should have: keep 'a', remove 'b', add 'x', keep 'c'
    expect(ops.length).toBeGreaterThanOrEqual(3);
  });

  it('handles completely different strings', () => {
    const ops = expectOk(diffText('abc', 'xyz'));
    // Should remove 'abc', add 'xyz'
    expect(ops.length).toBe(2);
    expect(ops).toContainEqual({ type: 'remove', value: 'abc' });
    expect(ops).toContainEqual({ type: 'add', value: 'xyz' });
  });

  it('handles empty first string (all additions)', () => {
    const ops = expectOk(diffText('', 'hello'));
    expect(ops).toEqual([{ type: 'add', value: 'hello' }]);
  });

  it('handles empty second string (all removals)', () => {
    const ops = expectOk(diffText('hello', ''));
    expect(ops).toEqual([{ type: 'remove', value: 'hello' }]);
  });

  it('handles both empty', () => {
    const ops = expectOk(diffText('', ''));
    expect(ops).toEqual([]);
  });

  it('merges consecutive same-type ops', () => {
    // 'ab' -> 'xy' should merge into one remove and one add
    const ops = expectOk(diffText('ab', 'xy'));
    expect(ops.length).toBeLessThanOrEqual(4);
  });

  it('handles longer strings efficiently', () => {
    const a = 'The quick brown fox jumps over the lazy dog.';
    const b = 'The quick brown fox leaps over the lazy cat.';
    const ops = expectOk(diffText(a, b));
    // Should have changes around 'jumps' -> 'leaps' and 'dog' -> 'cat'
    expect(ops.length).toBeGreaterThanOrEqual(3);
  });

  it('handles single character changes', () => {
    const ops = expectOk(diffText('a', 'b'));
    expect(ops.length).toBe(2);
    expect(ops).toContainEqual({ type: 'remove', value: 'a' });
    expect(ops).toContainEqual({ type: 'add', value: 'b' });
  });
});
