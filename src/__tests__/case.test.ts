// ---------------------------------------------------------------------------
// Unit tests: Case converter — 7 target formats, edge cases
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
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

describe('convertCase — from camelCase', () => {
  const input = 'helloWorldExample';

  it('converts to camel (identity)', () => {
    expect(expectOk(convertCase(input, 'camel'))).toBe('helloWorldExample');
  });

  it('converts to pascal', () => {
    expect(expectOk(convertCase(input, 'pascal'))).toBe('HelloWorldExample');
  });

  it('converts to snake', () => {
    expect(expectOk(convertCase(input, 'snake'))).toBe('hello_world_example');
  });

  it('converts to kebab', () => {
    expect(expectOk(convertCase(input, 'kebab'))).toBe('hello-world-example');
  });

  it('converts to title', () => {
    expect(expectOk(convertCase(input, 'title'))).toBe('Hello World Example');
  });

  it('converts to upper', () => {
    expect(expectOk(convertCase(input, 'upper'))).toBe('HELLO WORLD EXAMPLE');
  });

  it('converts to lower', () => {
    expect(expectOk(convertCase(input, 'lower'))).toBe('hello world example');
  });
});

describe('convertCase — from snake_case', () => {
  const input = 'hello_world_example';

  it('converts to camel', () => {
    expect(expectOk(convertCase(input, 'camel'))).toBe('helloWorldExample');
  });

  it('converts to pascal', () => {
    expect(expectOk(convertCase(input, 'pascal'))).toBe('HelloWorldExample');
  });

  it('converts to snake (identity)', () => {
    expect(expectOk(convertCase(input, 'snake'))).toBe('hello_world_example');
  });

  it('converts to kebab', () => {
    expect(expectOk(convertCase(input, 'kebab'))).toBe('hello-world-example');
  });
});

describe('convertCase — from kebab-case', () => {
  it('converts to camel', () => {
    expect(expectOk(convertCase('hello-world', 'camel'))).toBe('helloWorld');
  });

  it('converts to pascal', () => {
    expect(expectOk(convertCase('hello-world', 'pascal'))).toBe('HelloWorld');
  });
});

describe('convertCase — from PascalCase', () => {
  it('converts to snake', () => {
    expect(expectOk(convertCase('HelloWorld', 'snake'))).toBe('hello_world');
  });

  it('converts to kebab', () => {
    expect(expectOk(convertCase('HelloWorld', 'kebab'))).toBe('hello-world');
  });

  it('converts to camel', () => {
    expect(expectOk(convertCase('HelloWorld', 'camel'))).toBe('helloWorld');
  });
});

describe('convertCase — edge cases', () => {
  it('handles single word', () => {
    expect(expectOk(convertCase('hello', 'upper'))).toBe('HELLO');
    expect(expectOk(convertCase('hello', 'pascal'))).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(expectOk(convertCase('', 'camel'))).toBe('');
  });

  it('handles single character', () => {
    expect(expectOk(convertCase('a', 'upper'))).toBe('A');
    expect(expectOk(convertCase('a', 'pascal'))).toBe('A');
    expect(expectOk(convertCase('a', 'camel'))).toBe('a');
  });

  it('handles acronym prefixes (XMLHttpRequest)', () => {
    expect(expectOk(convertCase('XMLHttpRequest', 'snake'))).toBe('xml_http_request');
    expect(expectOk(convertCase('XMLHttpRequest', 'kebab'))).toBe('xml-http-request');
  });

  it('handles mixed separators', () => {
    expect(expectOk(convertCase('hello_world-foo', 'camel'))).toBe('helloWorldFoo');
  });

  it('returns error for unsupported case type', () => {
    const errMsg = expectErr(convertCase('hello', 'unknown' as any));
    expect(errMsg).toContain('Unsupported case');
  });

  it('handles consecutive capitals (HTTPRequest)', () => {
    expect(expectOk(convertCase('parseHTTPRequest', 'snake'))).toBe('parse_http_request');
  });

  it('handles numbers in input', () => {
    expect(expectOk(convertCase('getUserById2', 'snake'))).toBe('get_user_by_id2');
  });

  it('handles space-separated input', () => {
    expect(expectOk(convertCase('hello world', 'camel'))).toBe('helloWorld');
    expect(expectOk(convertCase('hello world', 'pascal'))).toBe('HelloWorld');
  });
});
