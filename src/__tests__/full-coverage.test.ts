// ---------------------------------------------------------------------------
// Unit tests: ALL remaining uncovered modules
// contrast, curlConverter, cron, logViewer, jsonpath, jsonViewer, asciiArt, httpStatus
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { checkContrast, suggestColor } from '@/lib/tools/contrast';
import { parseCurl, generateCode } from '@/lib/tools/curlConverter';
import { explainCron } from '@/lib/tools/cron';
import { parseLogs } from '@/lib/tools/logViewer';
import { testJsonPath } from '@/lib/tools/jsonpath';
import { parseJsonTree } from '@/lib/tools/jsonViewer';
import { textToAscii } from '@/lib/tools/asciiArt';
import { getAllStatusCodes, getStatusCodesByCategory, searchStatusCodes } from '@/lib/tools/httpStatus';
import { type Result } from '@/lib/tools/types';

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  return (result as unknown as { ok: true; value: T }).value;
}

function expectErr(result: Result<unknown>): string {
  expect(result.ok).toBe(false);
  return (result as unknown as { ok: false; error: string }).error;
}

// =========================================================================
// 1. Color Contrast Checker — WCAG 2.1 AA/AAA
// =========================================================================
describe('checkContrast', () => {
  it('returns high ratio for black on white', () => {
    const r = expectOk(checkContrast('#000000', '#ffffff'));
    expect(r.ratio).toBeGreaterThan(18);
    expect(r.ratioFormatted).toMatch(/:1$/);
    expect(r.aaNormal).toBe(true);
    expect(r.aaaNormal).toBe(true);
  });

  it('returns low ratio for light gray on white', () => {
    const r = expectOk(checkContrast('#cccccc', '#ffffff'));
    expect(r.ratio).toBeLessThan(2);
    expect(r.aaNormal).toBe(false);
    expect(r.aaaNormal).toBe(false);
  });

  it('returns ~21:1 for black on white', () => {
    const r = expectOk(checkContrast('#000', '#fff'));
    expect(r.ratio).toBeCloseTo(21, 0);
  });

  it('handles short hex #000', () => {
    const r = expectOk(checkContrast('#000', '#fff'));
    expect(r.fgRgb).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('checks AA large text for 3:1 ratio', () => {
    // #888888 on white gives ~3.5:1 — between 3.0 and 4.5
    const r = expectOk(checkContrast('#888888', '#ffffff'));
    expect(r.ratio).toBeGreaterThan(3);
    expect(r.ratio).toBeLessThan(4.5);
    expect(r.aaLarge).toBe(true);
    expect(r.aaNormal).toBe(false);
  });

  it('returns error for invalid foreground', () => {
    expect(expectErr(checkContrast('notacolor', '#fff'))).toContain('Invalid');
  });

  it('returns error for invalid background', () => {
    expect(expectErr(checkContrast('#000', 'invalid'))).toContain('Invalid');
  });
});

describe('suggestColor', () => {
  it('suggests a lighter color for dark text on dark bg', () => {
    // Dark gray on nearly-black should suggest something lighter
    const r = expectOk(suggestColor('#333333', '#111111', 4.5));
    expect(r).toMatch(/^#[0-9a-f]{6}$/);
    // Suggested color should be lighter than original
    const origVal = parseInt('333333', 16);
    const suggVal = parseInt(r.replace('#', ''), 16);
    expect(suggVal).toBeGreaterThan(origVal);
  });

  it('returns error for invalid color', () => {
    expect(expectErr(suggestColor('zzz', '#fff', 4.5))).toContain('Invalid');
  });
});

// =========================================================================
// 2. cURL Converter — parse + generate
// =========================================================================
describe('parseCurl', () => {
  it('parses a simple GET request', () => {
    const r = expectOk(parseCurl("curl https://api.example.com/users"));
    expect(r.method).toBe('GET');
    expect(r.url).toBe('https://api.example.com/users');
  });

  it('parses POST with data', () => {
    const r = expectOk(parseCurl(
      'curl -X POST -d name=Alice https://api.example.com/users',
    ));
    expect(r.method).toBe('POST');
    expect(r.body).toBe('name=Alice');
  });

  it('parses headers', () => {
    const r = expectOk(parseCurl(
      "curl -H 'Authorization: Bearer token123' https://api.example.com",
    ));
    expect(r.headers['Authorization']).toBe('Bearer token123');
  });

  it('parses multiple headers', () => {
    const r = expectOk(parseCurl(
      "curl -H 'Accept: application/json' -H 'X-Custom: val' https://api.example.com",
    ));
    expect(r.headers['Accept']).toBe('application/json');
    expect(r.headers['X-Custom']).toBe('val');
  });

  it('parses basic auth', () => {
    const r = expectOk(parseCurl("curl -u admin:secret https://api.example.com"));
    expect(r.auth).not.toBeNull();
    expect(r.auth!.value).toBe('admin:secret');
  });

  it('detects --insecure', () => {
    const r = expectOk(parseCurl("curl -k https://api.example.com"));
    expect(r.insecure).toBe(true);
  });

  it('detects -k as insecure', () => {
    const r = expectOk(parseCurl("curl -k https://api.example.com"));
    expect(r.insecure).toBe(true);
  });

  it('parses PUT with body', () => {
    const r = expectOk(parseCurl(
      'curl -X PUT -d updated https://api.example.com/items/1',
    ));
    expect(r.method).toBe('PUT');
    expect(r.body).toBe('updated');
  });

  it('returns error for non-curl command', () => {
    expect(expectErr(parseCurl("wget https://example.com"))).toContain('start with "curl"');
  });

  it('returns error for empty input', () => {
    expect(expectErr(parseCurl(''))).toContain('start with "curl"');
  });
});

describe('generateCode (from parsed curl)', () => {
  const parsed = {
    method: 'GET',
    url: 'https://api.example.com/users',
    headers: { Authorization: 'Bearer token123' },
    body: '',
    auth: null,
    insecure: false,
  };

  it('generates fetch code', () => {
    const code = expectOk(generateCode(parsed, 'fetch'));
    expect(code).toContain('fetch(');
    expect(code).toContain('https://api.example.com/users');
    expect(code).toContain('Authorization');
  });

  it('generates axios code', () => {
    const code = expectOk(generateCode(parsed, 'axios'));
    expect(code).toContain('axios');
    expect(code).toContain('https://api.example.com/users');
  });

  it('generates Python code', () => {
    const code = expectOk(generateCode(parsed, 'python'));
    expect(code).toContain('requests');
    expect(code).toContain('https://api.example.com/users');
  });

  it('generates Go code', () => {
    const code = expectOk(generateCode(parsed, 'go'));
    expect(code).toContain('http.');
    expect(code).toContain('api.example.com');
  });

  it('returns error for unknown target', () => {
    expect(expectErr(generateCode(parsed, 'php' as any))).toContain('Unknown target');
  });

  it('generates POST fetch with body', () => {
    const postParsed = {
      ...parsed,
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
      headers: { 'Content-Type': 'application/json' },
    };
    const code = expectOk(generateCode(postParsed, 'fetch'));
    expect(code).toContain('method: "POST"');
    expect(code).toContain('body:');
    expect(code).toContain('Alice');
  });
});

// =========================================================================
// 3. Cron Expression Parser
// =========================================================================
describe('explainCron', () => {
  it('parses "every minute" (* * * * *)', () => {
    const r = expectOk(explainCron('* * * * *'));
    expect(r.minute.meaning.toLowerCase()).toContain('every');
    expect(r.humanReadable).toBeTruthy();
    expect(r.nextRuns.length).toBeGreaterThanOrEqual(1);
  });

  it('parses "daily at midnight" (0 0 * * *)', () => {
    const r = expectOk(explainCron('0 0 * * *'));
    // Should mention hour 0 / midnight
    expect(r.hour.meaning).toBeTruthy();
    expect(r.nextRuns.length).toBeGreaterThanOrEqual(1);
  });

  it('parses \"every Monday at 9am\" (0 9 * * 1)', () => {
    const r = expectOk(explainCron('0 9 * * 1'));
    // Should mention Monday
    expect(r.dayOfWeek.meaning.toLowerCase()).toContain('monday');
  });

  it('parses \"every 5 minutes\" (*/5 * * * *)', () => {
    const r = expectOk(explainCron('*/5 * * * *'));
    expect(r.minute.raw).toBe('*/5');
  });

  it('parses ranges (10-30 * * * *)', () => {
    const r = expectOk(explainCron('10-30 * * * *'));
    expect(r.minute.meaning).toContain('10');
    expect(r.minute.meaning).toContain('30');
  });

  it('parses specific values (0,15,30,45 * * * *)', () => {
    const r = expectOk(explainCron('0,15,30,45 * * * *'));
    expect(r.nextRuns.length).toBeGreaterThanOrEqual(1);
  });

  it('returns error for invalid expression', () => {
    expect(expectErr(explainCron('not a cron'))).toContain('Invalid');
  });

  it('returns error for wrong field count', () => {
    expect(expectErr(explainCron('* * * *'))).toContain('expected 5 fields');
  });

  it('returns error for out-of-range values', () => {
    expect(expectErr(explainCron('99 * * * *'))).toContain('Invalid');
  });

  it('returns error for invalid step', () => {
    expect(expectErr(explainCron('*/0 * * * *'))).toContain('Invalid');
  });
});

// =========================================================================
// 4. Structured Log Viewer
// =========================================================================
describe('parseLogs', () => {
  it('parses a single JSON object', () => {
    const r = expectOk(parseLogs('{"level":"info","msg":"hello"}'));
    expect(r.total).toBe(1);
    expect(r.fields).toContain('level');
    expect(r.fields).toContain('msg');
  });

  it('parses a JSON array of objects', () => {
    const r = expectOk(parseLogs('[{"a":1},{"a":2}]'));
    expect(r.total).toBe(2);
  });

  it('parses NDJSON (newline-delimited)', () => {
    const r = expectOk(parseLogs('{"a":1}\n{"a":2}\n{"a":3}'));
    expect(r.total).toBe(3);
    expect(r.fields).toEqual(['a']);
  });

  it('collects all fields across entries', () => {
    const r = expectOk(parseLogs('{"a":1,"b":2}\n{"a":3,"c":4}'));
    expect(r.fields).toContain('a');
    expect(r.fields).toContain('b');
    expect(r.fields).toContain('c');
  });

  it('preserves raw input in _raw field (pretty-printed)', () => {
    const r = expectOk(parseLogs('{"msg":"test"}'));
    expect(r.entries[0]._raw).toContain('"msg"');
    expect(r.entries[0]._raw).toContain('"test"');
  });

  it('returns error for empty input', () => {
    expect(expectErr(parseLogs(''))).toContain('No input');
  });

  it('returns error for invalid JSON', () => {
    expect(expectErr(parseLogs('not json'))).toContain('not valid JSON');
  });
});

// =========================================================================
// 5. JSONPath Tester
// =========================================================================
describe('testJsonPath', () => {
  const data = JSON.stringify({
    store: {
      books: [
        { title: 'Book A', price: 10 },
        { title: 'Book B', price: 20 },
      ],
      name: 'Bookstore',
    },
  });

  it('returns root for $', () => {
    const r = expectOk(testJsonPath(data, '$'));
    expect(r.matches).toBe(1);
  });

  it('accesses simple key $.store.name', () => {
    const r = expectOk(testJsonPath(data, '$.store.name'));
    expect(r.result).toBe('Bookstore');
  });

  it('accesses array index $.store.books[0]', () => {
    const r = expectOk(testJsonPath(data, '$.store.books[0]'));
    expect((r.result as any).title).toBe('Book A');
  });

  it('accesses wildcard $.store.books[*].title', () => {
    const r = expectOk(testJsonPath(data, '$.store.books[*].title'));
    expect(Array.isArray(r.result)).toBe(true);
    expect((r.result as string[])).toContain('Book A');
    expect((r.result as string[])).toContain('Book B');
  });

  it('handles flat array', () => {
    const r = expectOk(testJsonPath('[10,20,30]', '$[0]'));
    expect(r.result).toBe(10);
  });

  it('returns error for invalid JSON', () => {
    expect(expectErr(testJsonPath('not json', '$'))).toContain('Invalid JSON');
  });

  it('returns error for path not starting with $', () => {
    expect(expectErr(testJsonPath('{}', '.foo'))).toContain("must start with '$'");
  });
});

// =========================================================================
// 6. JSON Viewer Tree Builder
// =========================================================================
describe('parseJsonTree', () => {
  it('parses a simple object', () => {
    const r = expectOk(parseJsonTree('{"name":"Alice","age":30}'));
    expect(r.length).toBe(2);
    expect(r[0].key).toBe('name');
    expect(r[0].type).toBe('string');
    expect(r[0].depth).toBe(1);
  });

  it('parses nested objects', () => {
    const r = expectOk(parseJsonTree('{"user":{"name":"Alice"}}'));
    expect(r.length).toBe(1);
    expect(r[0].key).toBe('user');
    expect(r[0].type).toBe('object');
    expect(r[0].children).toBeDefined();
    expect(r[0].children![0].key).toBe('name');
    expect(r[0].children![0].depth).toBe(2);
  });

  it('parses arrays', () => {
    const r = expectOk(parseJsonTree('[1,2,3]'));
    // Returns children directly — 3 array element nodes
    expect(r.length).toBe(3);
    expect(r[0].value).toBe('1');
    expect(r[0].type).toBe('number');
    expect(r[0].depth).toBe(1);
    expect(r[1].value).toBe('2');
    expect(r[2].value).toBe('3');
  });

  it('handles null values', () => {
    const r = expectOk(parseJsonTree('{"val":null}'));
    expect(r.length).toBe(1);
    expect(r[0].type).toBe('null');
    expect(r[0].value).toBe('null');
  });

  it('handles boolean values', () => {
    const r = expectOk(parseJsonTree('{"active":true,"done":false}'));
    expect(r[0].type).toBe('boolean');
    expect(r[1].type).toBe('boolean');
  });

  it('returns error for invalid JSON', () => {
    expect(expectErr(parseJsonTree('not json'))).toContain('Invalid JSON');
  });

  it('returns empty array for empty object', () => {
    const r = expectOk(parseJsonTree('{}'));
    expect(r.length).toBe(0);
  });
});

// =========================================================================
// 7. ASCII Art Generator
// =========================================================================
describe('textToAscii', () => {
  it('generates block font for a single letter', () => {
    const r = expectOk(textToAscii('A', 'block'));
    expect(r).toContain('AAA');
    expect(r.split('\n').length).toBe(7);
  });

  it('generates simple font', () => {
    const r = expectOk(textToAscii('A', 'simple'));
    expect(r.split('\n').length).toBe(7);
    // Simple font uses the character itself
    expect(r).toContain('A');
  });

  it('generates multi-character text', () => {
    const r = expectOk(textToAscii('HI', 'block'));
    expect(r).toContain('H');
    expect(r).toContain('I');
    expect(r.split('\n').length).toBe(7);
  });

  it('handles empty input', () => {
    expect(expectOk(textToAscii('', 'block'))).toBe('');
  });

  it('returns error for unsupported font', () => {
    expect(expectErr(textToAscii('A', 'unknown' as any))).toContain('Unsupported font');
  });

  it('skips unsupported characters', () => {
    const r = expectOk(textToAscii('~', 'block'));
    // ~ is not in the font, should produce empty lines
    expect(r.split('\n').length).toBe(7);
  });

  it('generates block font for space', () => {
    const r = expectOk(textToAscii('A B', 'block'));
    expect(r).toContain('A');
    expect(r).toContain('B');
  });

  it('generates numbers', () => {
    const r = expectOk(textToAscii('123', 'block'));
    expect(r).toContain('1');
    expect(r).toContain('2');
    expect(r).toContain('3');
  });
});

// =========================================================================
// 8. HTTP Status Code Reference
// =========================================================================
describe('getAllStatusCodes', () => {
  it('returns all status codes', () => {
    const r = expectOk(getAllStatusCodes());
    expect(r.length).toBeGreaterThanOrEqual(30);
  });

  it('contains common codes', () => {
    const codes = expectOk(getAllStatusCodes()).map((s) => s.code);
    expect(codes).toContain(200);
    expect(codes).toContain(404);
    expect(codes).toContain(500);
    expect(codes).toContain(418); // Teapot!
  });
});

describe('getStatusCodesByCategory', () => {
  it('filters by 2xx', () => {
    const r = expectOk(getStatusCodesByCategory('2xx'));
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.category === '2xx')).toBe(true);
  });

  it('filters by 4xx', () => {
    const r = expectOk(getStatusCodesByCategory('4xx'));
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.category === '4xx')).toBe(true);
  });

  it('returns empty for unknown category', () => {
    const r = expectOk(getStatusCodesByCategory('9xx'));
    expect(r).toEqual([]);
  });
});

describe('searchStatusCodes', () => {
  it('finds 404 by number', () => {
    const r = expectOk(searchStatusCodes('404'));
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r[0].code).toBe(404);
  });

  it('finds codes by keyword', () => {
    const r = expectOk(searchStatusCodes('teapot'));
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r[0].code).toBe(418);
  });

  it('returns all codes for empty query', () => {
    const all = expectOk(getAllStatusCodes());
    const searched = expectOk(searchStatusCodes(''));
    expect(searched.length).toBe(all.length);
  });

  it('is case-insensitive', () => {
    const r = expectOk(searchStatusCodes('TEAPOT'));
    expect(r.length).toBeGreaterThanOrEqual(1);
  });

  it('finds codes by description', () => {
    const r = expectOk(searchStatusCodes('gateway'));
    expect(r.some((s) => s.code === 502 || s.code === 504)).toBe(true);
  });
});
