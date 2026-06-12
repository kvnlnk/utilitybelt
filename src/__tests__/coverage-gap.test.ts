// ---------------------------------------------------------------------------
// Unit tests: Color, Number Base, CSS, XML, Password, Hash, Lorem
// Previously uncovered modules — now with full pure-function coverage
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { convertColor } from '@/lib/tools/color';
import { convertBase } from '@/lib/tools/numberBase';
import { minifyCss } from '@/lib/tools/css';
import { formatXml } from '@/lib/tools/xml';
import { calculatePasswordStrength, strengthLabel } from '@/lib/tools/password';
import { generateUUID } from '@/lib/tools/hash';
import { generateLoremIpsum } from '@/lib/tools/lorem';
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
// Color Converter
// =========================================================================
describe('convertColor — hex input', () => {
  it('parses #ff0000 as red', () => {
    const r = expectOk(convertColor('#ff0000'));
    expect(r.hex).toBe('#ff0000');
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(r.hsl.h).toBe(0);
    expect(r.format).toBe('hex');
  });

  it('parses #00ff00 as green', () => {
    const r = expectOk(convertColor('#00ff00'));
    expect(r.hex).toBe('#00ff00');
    expect(r.rgb).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('parses #0000ff as blue', () => {
    const r = expectOk(convertColor('#0000ff'));
    expect(r.rgb).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses short hex #f00', () => {
    const r = expectOk(convertColor('#f00'));
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses #000 (black)', () => {
    const r = expectOk(convertColor('#000'));
    expect(r.rgb).toEqual({ r: 0, g: 0, b: 0 });
    expect(r.hsl.l).toBe(0);
  });

  it('parses #fff (white)', () => {
    const r = expectOk(convertColor('#fff'));
    expect(r.rgb).toEqual({ r: 255, g: 255, b: 255 });
    expect(r.hsl.l).toBe(100);
  });

  it('parses uppercase hex #FF8800', () => {
    const r = expectOk(convertColor('#FF8800'));
    expect(r.hex).toBe('#ff8800');
  });

  it('returns error for invalid hex', () => {
    expect(expectErr(convertColor('#xyz'))).toContain('Invalid hex');
  });

  it('returns error for too-short hex', () => {
    expect(expectErr(convertColor('#ab'))).toContain('Invalid hex');
  });

  it('parses hex with alpha (#rrggbbaa) ignoring alpha', () => {
    const r = expectOk(convertColor('#ff000080'));
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe('convertColor — rgb input', () => {
  it('parses rgb(255,0,0)', () => {
    const r = expectOk(convertColor('rgb(255,0,0)'));
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(r.hex).toBe('#ff0000');
    expect(r.format).toBe('rgb');
  });

  it('parses rgba with alpha', () => {
    const r = expectOk(convertColor('rgba(255,0,0,0.5)'));
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses rgb with spaces', () => {
    const r = expectOk(convertColor('rgb( 0 , 128 , 255 )'));
    expect(r.rgb).toEqual({ r: 0, g: 128, b: 255 });
  });

  it('returns error for malformed rgb', () => {
    expect(expectErr(convertColor('rgb(999)'))).toContain('Invalid rgb');
  });
});

describe('convertColor — hsl input', () => {
  it('parses hsl(0,100%,50%) as red', () => {
    const r = expectOk(convertColor('hsl(0,100%,50%)'));
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(r.format).toBe('hsl');
  });

  it('parses hsl(120,100%,50%) as green', () => {
    const r = expectOk(convertColor('hsl(120,100%,50%)'));
    expect(r.rgb).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('parses hsla with alpha', () => {
    const r = expectOk(convertColor('hsla(240,100%,50%,0.5)'));
    expect(r.rgb).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('handles grayscale (no saturation)', () => {
    const r = expectOk(convertColor('hsl(0,0%,50%)'));
    expect(r.rgb.r).toBe(r.rgb.g);
    expect(r.rgb.g).toBe(r.rgb.b);
  });

  it('returns error for malformed hsl', () => {
    expect(expectErr(convertColor('hsl(bad)'))).toContain('Invalid hsl');
  });
});

describe('convertColor — error cases', () => {
  it('returns error for unsupported format', () => {
    expect(expectErr(convertColor('notacolor'))).toContain('Unsupported color format');
  });

  it('returns error for empty string', () => {
    expect(expectErr(convertColor(''))).toContain('Unsupported color format');
  });
});

describe('convertColor — known color roundtrips', () => {
  const cases = [
    { hex: '#ff0000', name: 'red' },
    { hex: '#00ff00', name: 'green' },
    { hex: '#0000ff', name: 'blue' },
    { hex: '#ffffff', name: 'white' },
    { hex: '#000000', name: 'black' },
    { hex: '#808080', name: 'gray' },
    { hex: '#ff8800', name: 'orange' },
    { hex: '#800080', name: 'purple' },
    { hex: '#ffff00', name: 'yellow' },
    { hex: '#00ffff', name: 'cyan' },
  ];

  for (const { hex, name } of cases) {
    it(`roundtrips ${name} (${hex})`, () => {
      const r = expectOk(convertColor(hex));
      expect(r.hex).toBe(hex);
      // RGB → Hex roundtrip
      const { r: red, g, b } = r.rgb;
      expect(r.hex).toBe(
        '#' + [red, g, b].map((v) => v.toString(16).padStart(2, '0')).join(''),
      );
    });
  }

  it('hex → hsl → rgb is consistent', () => {
    const r = expectOk(convertColor('#ff8800'));
    // Convert back from HSL
    const hslStr = `hsl(${r.hsl.h},${r.hsl.s}%,${r.hsl.l}%)`;
    const back = expectOk(convertColor(hslStr));
    expect(back.rgb.r).toBe(r.rgb.r);
  });
});

// =========================================================================
// Number Base Converter
// =========================================================================
describe('convertBase', () => {
  // hex → everything
  it('converts hex to dec', () => {
    expect(expectOk(convertBase('FF', 'hex', 'dec'))).toBe('255');
  });

  it('converts hex to bin', () => {
    expect(expectOk(convertBase('FF', 'hex', 'bin'))).toBe('0b11111111');
  });

  it('converts hex to oct', () => {
    expect(expectOk(convertBase('FF', 'hex', 'oct'))).toBe('0o377');
  });

  it('converts hex to hex (identity with 0x prefix)', () => {
    expect(expectOk(convertBase('FF', 'hex', 'hex'))).toBe('0xFF');
  });

  // dec → everything
  it('converts dec to hex', () => {
    expect(expectOk(convertBase('255', 'dec', 'hex'))).toBe('0xFF');
  });

  it('converts dec to bin', () => {
    expect(expectOk(convertBase('255', 'dec', 'bin'))).toBe('0b11111111');
  });

  it('converts dec to oct', () => {
    expect(expectOk(convertBase('255', 'dec', 'oct'))).toBe('0o377');
  });

  // bin → everything
  it('converts bin to hex', () => {
    expect(expectOk(convertBase('11111111', 'bin', 'hex'))).toBe('0xFF');
  });

  it('converts bin to dec', () => {
    expect(expectOk(convertBase('11111111', 'bin', 'dec'))).toBe('255');
  });

  // oct → everything
  it('converts oct to dec', () => {
    expect(expectOk(convertBase('377', 'oct', 'dec'))).toBe('255');
  });

  // With prefixes
  it('accepts 0x prefixed input', () => {
    expect(expectOk(convertBase('0xFF', 'hex', 'dec'))).toBe('255');
  });

  it('accepts 0b prefixed input', () => {
    expect(expectOk(convertBase('0b1010', 'bin', 'dec'))).toBe('10');
  });

  it('accepts 0o prefixed input', () => {
    expect(expectOk(convertBase('0o377', 'oct', 'dec'))).toBe('255');
  });

  // Edge cases
  it('handles 0', () => {
    expect(expectOk(convertBase('0', 'dec', 'hex'))).toBe('0x0');
  });

  it('handles 1', () => {
    expect(expectOk(convertBase('1', 'dec', 'bin'))).toBe('0b1');
  });

  // Error cases
  it('returns error for invalid fromBase', () => {
    expect(expectErr(convertBase('FF', 'xyz' as any, 'dec'))).toContain('Invalid fromBase');
  });

  it('returns error for invalid toBase', () => {
    expect(expectErr(convertBase('FF', 'hex', 'xyz' as any))).toContain('Invalid toBase');
  });

  it('returns error for non-numeric input', () => {
    expect(expectErr(convertBase('ZZZ', 'hex', 'dec'))).toContain('Invalid number string');
  });
});

// =========================================================================
// CSS Minifier
// =========================================================================
describe('minifyCss', () => {
  it('removes comments', () => {
    const result = expectOk(minifyCss('/* comment */ .foo { color: red; }'));
    expect(result).not.toContain('comment');
  });

  it('removes trailing semicolons before }', () => {
    const result = expectOk(minifyCss('.foo { color: red; }'));
    expect(result).toBe('.foo{color:red}');
  });

  it('collapses whitespace', () => {
    const result = expectOk(minifyCss('  .foo   {   color  :  red  }  '));
    expect(result).toBe('.foo{color:red}');
  });

  it('handles multi-line CSS', () => {
    const css = `.foo {
      color: red;
      background: blue;
    }`;
    const result = expectOk(minifyCss(css));
    expect(result).toBe('.foo{color:red;background:blue}');
  });

  it('handles multiple selectors', () => {
    const css = '.foo, .bar { color: red; } .baz { margin: 0; }';
    const result = expectOk(minifyCss(css));
    expect(result).toContain('.foo,.bar{color:red}');
    expect(result).toContain('.baz{margin:0}');
  });

  it('handles @media queries', () => {
    const css = '@media (max-width: 768px) { .foo { display: none; } }';
    const result = expectOk(minifyCss(css));
    // Space after @media is structural CSS syntax, kept by minifier
    expect(result).toContain('@media (max-width:768px){.foo{display:none}}');
  });

  it('removes !important space', () => {
    const result = expectOk(minifyCss('.foo { color: red !important; }'));
    expect(result).toBe('.foo{color:red!important}');
  });

  it('handles empty input', () => {
    expect(expectOk(minifyCss(''))).toBe('');
  });

  it('strips empty rules', () => {
    const result = expectOk(minifyCss('.foo { } .bar { color: red; }'));
    expect(result).not.toContain('.foo');
    expect(result).toContain('.bar{color:red}');
  });
});

// =========================================================================
// XML Formatter
// =========================================================================
describe('formatXml', () => {
  it('formats nested XML with indentation', () => {
    const result = expectOk(formatXml('<root><child>text</child></root>'));
    const lines = result.split('\n');
    expect(lines[0]).toMatch(/^<root>$/);
    expect(lines[1]).toMatch(/^  <child>$/);
    expect(lines[2]).toContain('text');
    expect(lines[3]).toMatch(/^  <\/child>$/);
    expect(lines[4]).toMatch(/^<\/root>$/);
  });

  it('handles self-closing tags', () => {
    const result = expectOk(formatXml('<root><br/><img src="x"/></root>'));
    expect(result).toContain('<br/>');
    expect(result).toContain('<img src="x"/>');
  });

  it('handles comments', () => {
    const result = expectOk(formatXml('<!-- comment --><root>text</root>'));
    expect(result).toContain('<!-- comment -->');
  });

  it('handles CDATA sections', () => {
    const result = expectOk(formatXml('<root><![CDATA[some <content>]]></root>'));
    expect(result).toContain('<![CDATA[');
    expect(result).toContain('some <content>');
  });

  it('handles processing instructions', () => {
    const result = expectOk(formatXml('<?xml version="1.0"?><root/>'));
    expect(result).toContain('<?xml version="1.0"?>');
  });

  it('handles empty input', () => {
    expect(expectOk(formatXml(''))).toBe('');
  });

  it('handles attributes on tags', () => {
    const result = expectOk(formatXml('<div class="foo"><span id="x">text</span></div>'));
    expect(result).toContain('<div class="foo">');
    expect(result).toContain('<span id="x">');
  });
});

// =========================================================================
// Password Strength
// =========================================================================
describe('calculatePasswordStrength', () => {
  it('returns 0 for empty string', () => {
    expect(calculatePasswordStrength('')).toBe(0);
  });

  it('scores longer passwords higher', () => {
    const short = calculatePasswordStrength('ab');
    const long = calculatePasswordStrength('abcdefghij');
    expect(long).toBeGreaterThan(short);
  });

  it('adds points for lowercase letters', () => {
    const score = calculatePasswordStrength('abc');
    expect(score).toBeGreaterThanOrEqual(3);
  });

  it('adds points for uppercase letters', () => {
    // With only uppercase + sufficient length
    const score = calculatePasswordStrength('ABCDEFGH');
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it('adds points for numbers', () => {
    const score = calculatePasswordStrength('abc123');
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it('adds points for symbols', () => {
    const score = calculatePasswordStrength('abc!@#');
    expect(score).toBeGreaterThanOrEqual(15);
  });

  it('gives bonus for mixing 3+ character types', () => {
    const mixed = calculatePasswordStrength('Abc123!@#def');
    const plain = calculatePasswordStrength('abcdefghijkl');
    expect(mixed).toBeGreaterThan(plain);
  });

  it('caps at 100', () => {
    // Very long with all types should cap
    const score = calculatePasswordStrength('Abcdef1!Xyz12345!Abcdef1!Xyz12345!');
    expect(score).toBeLessThanOrEqual(100);
  });

  it('gives high score for strong password', () => {
    const score = calculatePasswordStrength('CorrectHorseBatteryStaple99!');
    expect(score).toBeGreaterThanOrEqual(60);
  });
});

describe('strengthLabel', () => {
  it('labels score < 20 as Very Weak', () => {
    expect(strengthLabel(0)).toBe('Very Weak');
    expect(strengthLabel(19)).toBe('Very Weak');
  });

  it('labels score 20-39 as Weak', () => {
    expect(strengthLabel(20)).toBe('Weak');
    expect(strengthLabel(39)).toBe('Weak');
  });

  it('labels score 40-59 as Fair', () => {
    expect(strengthLabel(40)).toBe('Fair');
    expect(strengthLabel(59)).toBe('Fair');
  });

  it('labels score 60-79 as Strong', () => {
    expect(strengthLabel(60)).toBe('Strong');
    expect(strengthLabel(79)).toBe('Strong');
  });

  it('labels score >= 80 as Very Strong', () => {
    expect(strengthLabel(80)).toBe('Very Strong');
    expect(strengthLabel(100)).toBe('Very Strong');
  });
});

// =========================================================================
// UUID Generator
// =========================================================================
describe('generateUUID', () => {
  it('returns a UUID v4 string', () => {
    const uuid = expectOk(generateUUID());
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('returns unique values on successive calls', () => {
    const u1 = expectOk(generateUUID());
    const u2 = expectOk(generateUUID());
    expect(u1).not.toBe(u2);
  });
});

// =========================================================================
// Lorem Ipsum Generator
// =========================================================================
describe('generateLoremIpsum', () => {
  it('returns error for paragraphs < 1', () => {
    expect(expectErr(generateLoremIpsum(0))).toContain('must be >= 1');
    expect(expectErr(generateLoremIpsum(-1))).toContain('must be >= 1');
  });

  it('generates text for 1 paragraph', () => {
    const text = expectOk(generateLoremIpsum(1));
    expect(text.length).toBeGreaterThan(20);
    expect(text).not.toContain('\n\n');
  });

  it('generates multiple paragraphs separated by blank lines', () => {
    const text = expectOk(generateLoremIpsum(3));
    const parts = text.split('\n\n');
    expect(parts.length).toBe(3);
  });

  it('starts with uppercase letter', () => {
    const text = expectOk(generateLoremIpsum(1));
    expect(text[0]).toMatch(/[A-Z]/);
  });

  it('ends with sentence-ending punctuation', () => {
    const text = expectOk(generateLoremIpsum(1));
    const last = text[text.length - 1];
    expect('.?!'.includes(last)).toBe(true);
  });
});
