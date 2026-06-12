import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Case converter — supports camel, pascal, snake, kebab, title, upper, lower
// ---------------------------------------------------------------------------

export type CaseType = 'camel' | 'pascal' | 'snake' | 'kebab' | 'title' | 'upper' | 'lower';

const SUPPORTED_CASES: CaseType[] = [
  'camel', 'pascal', 'snake', 'kebab', 'title', 'upper', 'lower',
];

/**
 * Convert a string between different casing conventions.
 * Accepts input in any common format (snake_case, kebab-case, camelCase, etc.)
 * and converts to the target format.
 */
export function convertCase(input: string, targetCase: CaseType): Result<string> {
  try {
    if (!SUPPORTED_CASES.includes(targetCase)) {
      return err(`Unsupported case: ${targetCase}. Use: ${SUPPORTED_CASES.join(', ')}`);
    }

    // Split into words — handle camelCase, PascalCase, snake_case, kebab-case, space-separated
    const words = splitIntoWords(input);
    if (words.length === 0) return ok('');

    let result: string;
    switch (targetCase) {
      case 'camel':
        result = words[0].toLowerCase() + words.slice(1).map(capitalize).join('');
        break;
      case 'pascal':
        result = words.map(capitalize).join('');
        break;
      case 'snake':
        result = words.map((w) => w.toLowerCase()).join('_');
        break;
      case 'kebab':
        result = words.map((w) => w.toLowerCase()).join('-');
        break;
      case 'title':
        result = words.map(capitalize).join(' ');
        break;
      case 'upper':
        result = words.join(' ').toUpperCase();
        break;
      case 'lower':
        result = words.join(' ').toLowerCase();
        break;
    }

    return ok(result);
  } catch (e: any) {
    return err(`Case conversion error: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function splitIntoWords(input: string): string[] {
  // Insert boundaries before uppercase letters in camelCase/PascalCase
  const withBoundaries = input
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // split "XMLHttpRequest" -> "XML HttpRequest"
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')     // split camelCase boundaries
    .replace(/[_-]+/g, ' ')                      // replace snake/kebab separators
    .replace(/[^a-zA-Z0-9 ]+/g, ' ');            // replace any other non-alphanumeric chars

  return withBoundaries
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function capitalize(word: string): string {
  if (word.length === 0) return word;
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}
