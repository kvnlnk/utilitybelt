// ---------------------------------------------------------------------------
// Unit tests: Epoch / Unix timestamp converters
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { epochToDate, dateToEpoch, now } from '@/lib/tools/epoch';
import { type Result } from '@/lib/tools/types';

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

function expectErr(result: Result<unknown>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

describe('epochToDate', () => {
  it('converts epoch 0 to ISO string', () => {
    expect(expectOk(epochToDate(0))).toBe('1970-01-01T00:00:00.000Z');
  });

  it('converts a known timestamp', () => {
    // 2024-01-15T12:30:00Z = 1705321800
    expect(expectOk(epochToDate(1705321800))).toBe('2024-01-15T12:30:00.000Z');
  });

  it('handles negative timestamps (pre-1970)', () => {
    const result = expectOk(epochToDate(-86400));
    expect(result).toBe('1969-12-31T00:00:00.000Z');
  });

  it('handles large timestamps (2038+ years)', () => {
    const result = expectOk(epochToDate(4102444800));
    expect(result).toBe('2100-01-01T00:00:00.000Z');
  });

  it('handles current-ish timestamp', () => {
    const now = Math.floor(Date.now() / 1000);
    const dateStr = expectOk(epochToDate(now));
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('returns error for NaN', () => {
    const errMsg = expectErr(epochToDate(NaN));
    expect(errMsg).toContain('Invalid epoch');
  });

  it('returns error for Infinity', () => {
    const errMsg = expectErr(epochToDate(Infinity));
    expect(errMsg).toContain('Invalid epoch');
  });
});

describe('dateToEpoch', () => {
  it('converts ISO date string to epoch', () => {
    expect(expectOk(dateToEpoch('2024-01-15T12:30:00.000Z'))).toBe(1705321800);
  });

  it('handles date-only strings', () => {
    const result = expectOk(dateToEpoch('2024-01-15'));
    expect(result).toBe(1705276800); // 2024-01-15T00:00:00.000Z
  });

  it('returns error for invalid date string', () => {
    const errMsg = expectErr(dateToEpoch('not a date'));
    expect(errMsg).toContain('Invalid date string');
  });

  it('returns error for empty string', () => {
    const errMsg = expectErr(dateToEpoch(''));
    expect(errMsg).toContain('Invalid date string');
  });

  it('handles common date formats', () => {
    const ts = expectOk(dateToEpoch('Jan 15, 2024'));
    expect(ts).toBeGreaterThan(0);
  });
});

describe('now', () => {
  it('returns a positive number close to current time', () => {
    const before = Math.floor(Date.now() / 1000);
    const result = expectOk(now());
    const after = Math.floor(Date.now() / 1000);
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('returns integer', () => {
    const result = expectOk(now());
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('epoch roundtrip', () => {
  const timestamps = [0, 86400, 1705321800, 1000000000, 4102444800, 1672531200];

  for (const ts of timestamps) {
    it(`roundtrips: epoch(${ts})`, () => {
      const dateStr = expectOk(epochToDate(ts));
      const back = expectOk(dateToEpoch(dateStr));
      expect(back).toBe(ts);
    });
  }
});
