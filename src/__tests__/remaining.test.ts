// ---------------------------------------------------------------------------
// Unit tests: Remaining tool modules — url, regex, html, entity, slug, etc.
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { encodeUrl, decodeUrl } from '@/lib/tools/url';
import { parseUrl } from '@/lib/tools/urlParse';
import { testRegex } from '@/lib/tools/regex';
import { explainRegex } from '@/lib/tools/regexExplain';
import { formatSql } from '@/lib/tools/sql';
import { formatHtml } from '@/lib/tools/html';
import { toSlug } from '@/lib/tools/slug';
import { encodeEntities, decodeEntities } from '@/lib/tools/entity';
import { formatJson, minifyJson, validateJson } from '@/lib/tools/json';
import { encodeBase64, decodeBase64 } from '@/lib/tools/base64';
import { convertCase } from '@/lib/tools/case';
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
// URL Encode / Decode
// =========================================================================
describe('encodeUrl', () => {
  it('encodes special characters', () => {
    expect(expectOk(encodeUrl('hello world'))).toBe('hello%20world');
  });

  it('encodes query params', () => {
    const result = expectOk(encodeUrl('a=b&c=d'));
    expect(result).toBe('a%3Db%26c%3Dd');
  });

  it('roundtrips with decode', () => {
    const original = 'hello world & more!';
    const encoded = expectOk(encodeUrl(original));
    expect(expectOk(decodeUrl(encoded))).toBe(original);
  });
});

describe('decodeUrl', () => {
  it('decodes percent-encoded string', () => {
    expect(expectOk(decodeUrl('hello%20world'))).toBe('hello world');
  });

  it('returns error for malformed encoding', () => {
    const errMsg = expectErr(decodeUrl('%GG'));
    expect(errMsg).toContain('URL decode failed');
  });
});

// =========================================================================
// URL Parser
// =========================================================================
describe('parseUrl', () => {
  it('parses a full URL', () => {
    const result = expectOk(parseUrl('https://example.com:8080/path?q=1#hash'));
    expect(result.protocol).toBe('https:');
    expect(result.host).toBe('example.com:8080');
    expect(result.pathname).toBe('/path');
    expect(result.search).toBe('?q=1');
    expect(result.hash).toBe('#hash');
  });

  it('auto-prepends https://', () => {
    const result = expectOk(parseUrl('example.com'));
    expect(result.protocol).toBe('https:');
  });

  it('errors on empty input', () => {
    const errMsg = expectErr(parseUrl(''));
    expect(errMsg).toContain('Please enter a URL');
  });

  it('extracts search params', () => {
    const result = expectOk(parseUrl('https://example.com?foo=bar&baz=42'));
    expect(result.params).toEqual({ foo: 'bar', baz: '42' });
  });

  it('errors on completely invalid URL', () => {
    const errMsg = expectErr(parseUrl('not a url at all !!!'));
    expect(errMsg).toContain('Invalid URL');
  });
});

// =========================================================================
// Regex Tester
// =========================================================================
describe('testRegex', () => {
  it('finds matches with default g flag', () => {
    const result = expectOk(testRegex('\\d+', 'abc123def456'));
    expect(result.count).toBe(2);
    expect(result.matches[0].fullMatch).toBe('123');
    expect(result.matches[1].fullMatch).toBe('456');
  });

  it('handles no matches', () => {
    const result = expectOk(testRegex('[x-z]', 'abc'));
    expect(result.count).toBe(0);
    expect(result.matches).toEqual([]);
  });

  it('returns named groups', () => {
    const result = expectOk(testRegex('(?<year>\\d{4})', '2024'));
    expect(result.matches[0].namedGroups).toEqual({ year: '2024' });
  });

  it('produces highlighted output', () => {
    const result = expectOk(testRegex('abc', 'abc abc'));
    expect(result.highlighted).toContain('<mark>');
  });

  it('returns error for invalid regex', () => {
    const errMsg = expectErr(testRegex('[invalid', 'test'));
    expect(errMsg).toContain('Regex error');
  });
});

// =========================================================================
// Regex Explainer
// =========================================================================
describe('explainRegex', () => {
  it('explains a simple pattern', () => {
    const result = expectOk(explainRegex('\\d+'));
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some(e => e.token === '\\d')).toBe(true);
    expect(result.some(e => e.token === '+')).toBe(true);
  });

  it('explains anchors', () => {
    const result = expectOk(explainRegex('^hello$'));
    expect(result.some(e => e.token === '^')).toBe(true);
    expect(result.some(e => e.token === '$')).toBe(true);
  });

  it('explains character classes', () => {
    const result = expectOk(explainRegex('[a-z]'));
    expect(result.some(e => e.token.startsWith('['))).toBe(true);
  });

  it('explains groups', () => {
    const result = expectOk(explainRegex('(abc)'));
    expect(result.some(e => e.explanation.includes('Capturing group'))).toBe(true);
  });

  it('explains non-capturing groups', () => {
    const result = expectOk(explainRegex('(?:abc)'));
    expect(result.some(e => e.explanation.includes('Non-capturing group'))).toBe(true);
  });

  it('explains alternation', () => {
    const result = expectOk(explainRegex('a|b'));
    expect(result.some(e => e.token === '|')).toBe(true);
  });

  it('return error for empty pattern', () => {
    const errMsg = expectErr(explainRegex(''));
    expect(errMsg).toContain('Please enter a regex pattern');
  });
});

// =========================================================================
// SQL Formatter
// =========================================================================
describe('formatSql', () => {
  it('formats a basic SELECT', () => {
    const result = expectOk(formatSql('SELECT * FROM users'));
    expect(result).toContain('SELECT');
    expect(result).toContain('FROM');
  });

  it('handles empty input', () => {
    expect(expectOk(formatSql(''))).toBe('');
  });

  it('uppercases keywords', () => {
    const result = expectOk(formatSql('select id, name from users where active = 1'));
    expect(result).toContain('SELECT');
    expect(result).toContain('FROM');
    expect(result).toContain('WHERE');
  });

  it('indents clauses after the first', () => {
    const result = expectOk(formatSql('SELECT id FROM users WHERE active = 1'));
    const lines = result.split('\n');
    expect(lines[0]).toMatch(/^SELECT/);
    expect(lines[1]).toMatch(/^  FROM/);
    expect(lines[2]).toMatch(/^  WHERE/);
  });

  it('handles semicolons', () => {
    const result = expectOk(formatSql('SELECT 1;SELECT 2'));
    expect(result.split('\n').length).toBeGreaterThanOrEqual(2);
  });
});

// =========================================================================
// HTML Formatter
// =========================================================================
describe('formatHtml', () => {
  it('formats nested HTML with indentation', () => {
    const result = expectOk(formatHtml('<div><p>hello</p></div>'));
    const lines = result.split('\n');
    expect(lines[0]).toMatch(/^<div>$/);
    expect(lines[1]).toMatch(/^  <p>$/);
    expect(lines[2]).toContain('hello');
    expect(lines[3]).toMatch(/^  <\/p>$/);
    expect(lines[4]).toMatch(/^<\/div>$/);
  });

  it('handles self-closing tags', () => {
    const result = expectOk(formatHtml('<div><br><img src="x"/></div>'));
    expect(result).toContain('<br>');
  });

  it('handles empty input', () => {
    expect(expectOk(formatHtml(''))).toBe('');
  });

  it('handles comments', () => {
    const result = expectOk(formatHtml('<!-- comment --><p>text</p>'));
    expect(result).toContain('<!-- comment -->');
  });
});

// =========================================================================
// Slug Generator
// =========================================================================
describe('toSlug', () => {
  it('converts basic text to slug', () => {
    expect(expectOk(toSlug('Hello World'))).toBe('hello-world');
  });

  it('handles umlauts (German)', () => {
    expect(expectOk(toSlug('Straße München'))).toBe('strasse-muenchen');
  });

  it('removes special characters', () => {
    expect(expectOk(toSlug('Hello! World? #1'))).toBe('hello-world-1');
  });

  it('collapses multiple hyphens', () => {
    expect(expectOk(toSlug('hello   world'))).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(expectOk(toSlug(''))).toBe('');
  });

  it('trims leading/trailing hyphens', () => {
    expect(expectOk(toSlug('--hello-world--'))).toBe('hello-world');
  });

  it('handles diacritics', () => {
    expect(expectOk(toSlug('crème brûlée'))).toBe('creme-brulee');
    expect(expectOk(toSlug('São Paulo'))).toBe('sao-paulo');
    expect(expectOk(toSlug('jalapeño'))).toBe('jalapeno');
    expect(expectOk(toSlug('garçon'))).toBe('garcon');
  });
});

// =========================================================================
// HTML Entities
// =========================================================================
describe('encodeEntities', () => {
  it('encodes & < > " \'', () => {
    expect(expectOk(encodeEntities('<div class="test">Tom & Jerry\'s</div>')))
      .toBe('&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry&#39;s&lt;/div&gt;');
  });

  it('handles plain text without entities', () => {
    expect(expectOk(encodeEntities('hello world'))).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(expectOk(encodeEntities(''))).toBe('');
  });
});

describe('decodeEntities', () => {
  it('decodes named entities', () => {
    expect(expectOk(decodeEntities('&lt;div&gt;'))).toBe('<div>');
  });

  it('decodes numeric entities', () => {
    expect(expectOk(decodeEntities('&#65;&#66;&#67;'))).toBe('ABC');
  });

  it('decodes hex entities', () => {
    expect(expectOk(decodeEntities('&#x41;&#x42;&#x43;'))).toBe('ABC');
  });

  it('handles mixed content', () => {
    expect(expectOk(decodeEntities('&lt;tag&gt;Hello &amp; Welcome &#33;'))).toBe('<tag>Hello & Welcome !');
  });

  it('roundtrips with encodeEntities', () => {
    const original = '<div class="test">Tom & Jerry\'s</div>';
    const encoded = expectOk(encodeEntities(original));
    expect(expectOk(decodeEntities(encoded))).toBe(original);
  });
});
