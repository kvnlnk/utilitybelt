import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// JSON tools
// ---------------------------------------------------------------------------

/** Pretty-print a JSON string with configurable indentation. */
export function formatJson(input: string, space: number = 2): Result<string> {
  try {
    const parsed = JSON.parse(input);
    return ok(JSON.stringify(parsed, null, space));
  } catch (e: any) {
    return err(`Invalid JSON: ${e.message}`);
  }
}

/** Minify a JSON string (remove all insignificant whitespace). */
export function minifyJson(input: string): Result<string> {
  try {
    const parsed = JSON.parse(input);
    return ok(JSON.stringify(parsed));
  } catch (e: any) {
    return err(`Invalid JSON: ${e.message}`);
  }
}

/** Validate a JSON string — returns ok(true) or an error message. */
export function validateJson(input: string): Result<true> {
  try {
    JSON.parse(input);
    return ok(true as const);
  } catch (e: any) {
    return err(`Invalid JSON: ${e.message}`);
  }
}
