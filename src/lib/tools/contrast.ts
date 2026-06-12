import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Color contrast checker — WCAG 2.1 AA/AAA ratings
// ---------------------------------------------------------------------------

export interface Rgb {
  r: number; // 0-255
  g: number;
  b: number;
}

export interface ContrastResult {
  ratio: number;
  ratioFormatted: string;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  foreground: string;
  background: string;
  fgRgb: Rgb;
  bgRgb: Rgb;
}

/**
 * Parse a hex color string (#rgb, #rrggbb) to RGB.
 */
function parseHex(hex: string): Rgb | null {
  const h = hex.replace(/^#/, '').trim();
  let full: string;
  if (h.length === 3) {
    full = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  } else if (h.length === 6) {
    full = h;
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

/**
 * Calculate relative luminance per WCAG 2.1.
 */
function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors.
 */
function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG contrast for a foreground and background color.
 */
export function checkContrast(fgHex: string, bgHex: string): Result<ContrastResult> {
  try {
    const fg = parseHex(fgHex);
    const bg = parseHex(bgHex);

    if (!fg) return err(`Invalid foreground color: ${fgHex}`);
    if (!bg) return err(`Invalid background color: ${bgHex}`);

    const ratio = contrastRatio(fg, bg);
    const rounded = Math.round(ratio * 100) / 100;

    return ok({
      ratio,
      ratioFormatted: rounded.toFixed(2) + ':1',
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3.0,
      aaaNormal: ratio >= 7.0,
      aaaLarge: ratio >= 4.5,
      foreground: fgHex,
      background: bgHex,
      fgRgb: fg,
      bgRgb: bg,
    });
  } catch (e: any) {
    return err(`Contrast check error: ${e.message}`);
  }
}

/**
 * Suggest a better color (lighter/darker) to meet a target ratio.
 */
export function suggestColor(
  color: string,
  bgColor: string,
  targetRatio: number,
): Result<string> {
  const base = parseHex(color);
  const bg = parseHex(bgColor);
  if (!base || !bg) return err('Invalid color');

  const bgLum = relativeLuminance(bg);
  const isLight = relativeLuminance(base) > 0.5;

  // Try adjusting lightness in steps
  let r = base.r, g = base.g, b = base.b;
  for (let step = 0; step < 20; step++) {
    const testRgb: Rgb = { r, g, b };
    const ratio = contrastRatio(testRgb, bg);
    if (ratio >= targetRatio) {
      const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
      return ok('#' + [r, g, b].map(toHex).join(''));
    }
    // Move toward lighter or darker
    if (bgLum > 0.5) {
      // Dark background — darken the color
      r -= 12; g -= 12; b -= 12;
    } else {
      // Light background — lighten the color
      r += 12; g += 12; b += 12;
    }
  }

  return err('Could not find a suitable color (try a completely different hue)');
}
