import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Color conversion — parse hex/rgb/hsl and convert between formats
// ---------------------------------------------------------------------------

export interface RgbColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HslColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export interface ColorResult {
  hex: string;
  rgb: RgbColor;
  hsl: HslColor;
  format: ColorFormat;
}

/**
 * Parse a color string (hex, rgb(), hsl(), or named color alias)
 * and return representations in all three formats.
 */
export function convertColor(input: string): Result<ColorResult> {
  try {
    const trimmed = input.trim().toLowerCase();
    let rgb: RgbColor | null;

    // Try hex first (#rgb, #rrggbb, #rrggbbaa — we ignore alpha)
    if (trimmed.startsWith('#')) {
      rgb = parseHex(trimmed);
      if (!rgb) return err(`Invalid hex color: ${input}`);
    } else if (trimmed.startsWith('rgb')) {
      rgb = parseRgb(trimmed);
      if (!rgb) return err(`Invalid rgb color: ${input}`);
    } else if (trimmed.startsWith('hsl')) {
      const hsl = parseHsl(trimmed);
      if (!hsl) return err(`Invalid hsl color: ${input}`);
      rgb = hslToRgb(hsl);
    } else {
      return err(`Unsupported color format: ${input}`);
    }

    // Safety guard — all branches above either assign rgb or return err
    if (!rgb) return err('Color parsing failed unexpectedly');

    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);

    return ok({
      hex,
      rgb,
      hsl,
      format: input.startsWith('#') ? 'hex' : input.startsWith('rgb') ? 'rgb' : 'hsl',
    });
  } catch (e: any) {
    return err(`Color conversion error: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function parseHex(hex: string): RgbColor | null {
  const h = hex.replace(/^#/, '');
  let full: string;
  if (h.length === 3) {
    full = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  } else if (h.length === 6 || h.length === 8) {
    full = h.slice(0, 6);
  } else {
    return null;
  }
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function parseRgb(input: string): RgbColor | null {
  const m = input.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return null;
  return {
    r: clamp(parseInt(m[1], 10), 0, 255),
    g: clamp(parseInt(m[2], 10), 0, 255),
    b: clamp(parseInt(m[3], 10), 0, 255),
  };
}

function parseHsl(input: string): HslColor | null {
  const m = input.match(/hsla?\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)/);
  if (!m) return null;
  return {
    h: parseFloat(m[1]) % 360,
    s: clamp(parseFloat(m[2]), 0, 100),
    l: clamp(parseFloat(m[3]), 0, 100),
  };
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

function rgbToHex(rgb: RgbColor): string {
  const { r, g, b } = rgb;
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    if (max === r) {
      h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / diff + 2) * 60;
    } else {
      h = ((r - g) / diff + 4) * 60;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(hsl: HslColor): RgbColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
