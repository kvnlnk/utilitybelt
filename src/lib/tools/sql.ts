import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// SQL formatter — keyword-based indentation
// ---------------------------------------------------------------------------

const CLAUSE_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'ORDER BY',
  'GROUP BY',
  'HAVING',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'LEFT OUTER JOIN',
  'RIGHT OUTER JOIN',
  'FULL OUTER JOIN',
  'ON',
  'LIMIT',
  'OFFSET',
  'UNION',
  'INTERSECT',
  'EXCEPT',
];

/** Split on clause boundaries, longest match first so multi-word clauses win */
const CLAUSE_RE = new RegExp(
  `\\b(${CLAUSE_KEYWORDS.slice().sort((a, b) => b.length - a.length).join('|')})\\b`,
  'gi',
);

/**
 * Format SQL string with uppercased keywords and proper indentation.
 */
export function formatSql(input: string): Result<string> {
  try {
    if (!input.trim()) return ok('');

    // Normalise whitespace, then split on keywords
    const normalised = input
      .replace(/\s*;\s*/g, ';\n')
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Insert newlines before major clause keywords so we can indent
    const withBreaks = normalised.replace(CLAUSE_RE, (match) => `\n${match.toUpperCase()}`);
    const lines = withBreaks.split('\n').map((l) => l.trim()).filter(Boolean);

    // Indent: clauses after the first get indented
    const resultLines: string[] = [];
    let depth = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const upper = line.toUpperCase();

      // Determine clause type
      const isMainClause = CLAUSE_KEYWORDS.some((k) => upper.startsWith(k));
      const isClosingClause =
        upper.startsWith('ON') || upper.startsWith('LIMIT') || upper.startsWith('OFFSET');

      if (isMainClause && !isClosingClause) {
        // Main clause — back to base indent if we were indented
        depth = 1;
      } else if (isMainClause && isClosingClause) {
        // Sub-clause like ON, LIMIT
        depth = 2;
      }

      resultLines.push('  '.repeat(depth) + line);
    }

    return ok(resultLines.join('\n'));
  } catch (e: any) {
    return err(`SQL format error: ${e.message}`);
  }
}
