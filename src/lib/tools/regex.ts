import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Regex tester
// ---------------------------------------------------------------------------

export interface RegexMatch {
  fullMatch: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string>;
}

export interface RegexResult {
  matches: RegexMatch[];
  count: number;
  highlighted: string;
}

/**
 * Test a regex pattern against an input string. Returns matches with groups,
 * count, and a copy of the input with matches highlighted via <mark> tags.
 */
export function testRegex(
  pattern: string,
  input: string,
  flags: string = 'g',
): Result<RegexResult> {
  try {
    const re = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    let m: RegExpExecArray | null;

    // reset lastIndex
    re.lastIndex = 0;

    while ((m = re.exec(input)) !== null) {
      const namedGroups: Record<string, string> = {};
      if (m.groups) {
        for (const [k, v] of Object.entries(m.groups)) {
          if (v !== undefined) namedGroups[k] = v;
        }
      }
      matches.push({
        fullMatch: m[0],
        groups: Array.from(m).slice(1),
        namedGroups,
      });
      // Prevent infinite loop on zero-length matches
      if (m.index === re.lastIndex) re.lastIndex++;
    }

    // Build highlighted output
    const hlRe = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const highlighted = input.replace(hlRe, '<mark>$&</mark>');

    return ok({ matches, count: matches.length, highlighted });
  } catch (e: any) {
    return err(`Regex error: ${e.message}`);
  }
}
