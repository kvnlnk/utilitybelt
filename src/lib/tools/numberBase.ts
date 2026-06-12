import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Number base converter — hex / dec / bin / oct
// ---------------------------------------------------------------------------

export type NumberBase = 'hex' | 'dec' | 'bin' | 'oct';

const VALID_BASES: NumberBase[] = ['hex', 'dec', 'bin', 'oct'];

const PREFIXES: Record<NumberBase, string> = {
  hex: '0x',
  dec: '',
  bin: '0b',
  oct: '0o',
};

/**
 * Convert a number between different bases.
 * Input can include prefixes (0x, 0b, 0o).
 */
export function convertBase(
  input: string,
  fromBase: NumberBase,
  toBase: NumberBase,
): Result<string> {
  try {
    if (!VALID_BASES.includes(fromBase)) {
      return err(`Invalid fromBase: ${fromBase}. Use: ${VALID_BASES.join(', ')}`);
    }
    if (!VALID_BASES.includes(toBase)) {
      return err(`Invalid toBase: ${toBase}. Use: ${VALID_BASES.join(', ')}`);
    }

    // Strip prefix and parse
    const clean = input.trim().replace(/^0[xXbBoO]/, '');
    if (!/^[0-9a-fA-F]+$/.test(clean)) {
      return err(`Invalid number string: ${input}`);
    }

    const radix: Record<NumberBase, number> = { hex: 16, dec: 10, bin: 2, oct: 8 };
    const num = parseInt(clean, radix[fromBase]);

    if (isNaN(num)) {
      return err(`Could not parse number: ${input}`);
    }

    const prefix = PREFIXES[toBase] || '';
    let result: string;

    switch (toBase) {
      case 'hex':
        result = num.toString(16).toUpperCase();
        break;
      case 'dec':
        result = num.toString(10);
        break;
      case 'bin':
        result = num.toString(2);
        break;
      case 'oct':
        result = num.toString(8);
        break;
      default:
        return err(`Unsupported target base: ${toBase}`);
    }

    return ok(prefix + result);
  } catch (e: any) {
    return err(`Base conversion error: ${e.message}`);
  }
}
