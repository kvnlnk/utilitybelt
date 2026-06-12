// ---------------------------------------------------------------------------
// Unit tests: CSV <-> JSON converter
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { csvToJson, jsonToCsv } from '@/lib/tools/csv';
import { type Result } from '@/lib/tools/types';

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

function expectErr(result: Result<unknown>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

describe('csvToJson', () => {
  it('parses a simple CSV to JSON', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const result = expectOk(csvToJson(csv));
    expect(result).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
  });

  it('coerces numbers', () => {
    const csv = 'value\n42\n3.14\n-1';
    const result = expectOk(csvToJson(csv));
    expect(result).toEqual([{ value: 42 }, { value: 3.14 }, { value: -1 }]);
  });

  it('coerces booleans', () => {
    const csv = 'active\ntrue\nfalse';
    const result = expectOk(csvToJson(csv));
    expect(result).toEqual([{ active: true }, { active: false }]);
  });

  it('handles quoted fields with commas', () => {
    const csv = 'name,description\nAlice,"Hello, world"\nBob,"Note, with, commas"';
    const result = expectOk(csvToJson(csv));
    expect(result).toEqual([
      { name: 'Alice', description: 'Hello, world' },
      { name: 'Bob', description: 'Note, with, commas' },
    ]);
  });

  it('handles quoted fields with newlines', () => {
    const csv = 'name,bio\nAlice,"Line1\nLine2"';
    const result = expectOk(csvToJson(csv));
    expect(result).toEqual([
      { name: 'Alice', bio: 'Line1\nLine2' },
    ]);
  });

  it('handles custom delimiter', () => {
    const csv = 'name;age\nAlice;30\nBob;25';
    const result = expectOk(csvToJson(csv, ';'));
    expect(result).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
  });

  it('skips empty data rows', () => {
    const csv = 'name,age\nAlice,30\n\nBob,25\n';
    const result = expectOk(csvToJson(csv));
    expect(result).toHaveLength(2);
  });

  it('returns error for header-only CSV', () => {
    const errMsg = expectErr(csvToJson('name,age'));
    expect(errMsg).toContain('must have at least');
  });

  it('returns error for empty input', () => {
    const errMsg = expectErr(csvToJson(''));
    expect(errMsg).toContain('must have at least');
  });

  it('handles double-quoted quotes', () => {
    const csv = 'name,quote\nAlice,"She said ""hello"""';
    const result = expectOk(csvToJson(csv));
    expect(result).toEqual([{ name: 'Alice', quote: 'She said "hello"' }]);
  });

  it('expands dotted headers into nested objects', () => {
    const csv = 'user.name,user.age\nAlice,30\nBob,25';
    const result = expectOk(csvToJson(csv));
    expect(result).toEqual([
      { user: { name: 'Alice', age: 30 } },
      { user: { name: 'Bob', age: 25 } },
    ]);
  });
});

describe('jsonToCsv', () => {
  it('converts a JSON array to CSV', () => {
    const json = JSON.stringify([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    const result = expectOk(jsonToCsv(json));
    expect(result).toBe('name,age\nAlice,30\nBob,25');
  });

  it('converts a single JSON object to CSV', () => {
    const result = expectOk(jsonToCsv('{"name":"Alice","age":30}'));
    expect(result).toBe('name,age\nAlice,30');
  });

  it('escapes commas in values', () => {
    const result = expectOk(jsonToCsv('[{"desc":"Hello, world"}]'));
    expect(result).toBe('desc\n"Hello, world"');
  });

  it('escapes quotes in values', () => {
    const result = expectOk(jsonToCsv('[{"quote":"She said \\"hello\\""}]'));
    expect(result).toBe('quote\n"She said ""hello"""');
  });

  it('flattens nested objects with dot notation', () => {
    const json = JSON.stringify([{ user: { name: 'Alice', age: 30 } }]);
    const result = expectOk(jsonToCsv(json));
    expect(result).toBe('user.name,user.age\nAlice,30');
  });

  it('returns error for empty array', () => {
    const errMsg = expectErr(jsonToCsv('[]'));
    expect(errMsg).toContain('empty');
  });

  it('returns error for invalid JSON', () => {
    const errMsg = expectErr(jsonToCsv('not json'));
    expect(errMsg).toContain('JSON to CSV error');
  });
});

describe('CSV roundtrip', () => {
  it('roundtrips a simple dataset', () => {
    const csv = 'name,age,active\nAlice,30,true\nBob,25,false';
    const json = expectOk(csvToJson(csv));
    const back = expectOk(jsonToCsv(JSON.stringify(json)));
    expect(back).toBe(csv);
  });
});
