import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Regex Explainer — parse a regex pattern and explain each token
// ---------------------------------------------------------------------------

export interface RegexTokenExplanation {
  token: string;
  explanation: string;
}

/**
 * Parse a regex pattern string and explain each token in plain English.
 * Handles: character classes, quantifiers, anchors, groups, alternation,
 * character sets, escaped characters, and more.
 */
export function explainRegex(pattern: string): Result<RegexTokenExplanation[]> {
  try {
    if (!pattern.trim()) {
      return err('Please enter a regex pattern.');
    }

    const explanations: RegexTokenExplanation[] = [];
    let i = 0;

    while (i < pattern.length) {
      const ch = pattern[i];

      // Escaped character
      if (ch === '\\' && i + 1 < pattern.length) {
        const next = pattern[i + 1];
        const token = '\\' + next;

        switch (next) {
          case 'd':
            explanations.push({ token, explanation: 'Any digit character (0-9)' });
            break;
          case 'D':
            explanations.push({ token, explanation: 'Any non-digit character' });
            break;
          case 'w':
            explanations.push({ token, explanation: 'Any word character (letter, digit, or underscore)' });
            break;
          case 'W':
            explanations.push({ token, explanation: 'Any non-word character' });
            break;
          case 's':
            explanations.push({ token, explanation: 'Any whitespace character (space, tab, newline)' });
            break;
          case 'S':
            explanations.push({ token, explanation: 'Any non-whitespace character' });
            break;
          case 'b':
            explanations.push({ token, explanation: 'Word boundary assertion' });
            break;
          case 'B':
            explanations.push({ token, explanation: 'Non-word boundary assertion' });
            break;
          case 'n':
            explanations.push({ token, explanation: 'Newline character' });
            break;
          case 'r':
            explanations.push({ token, explanation: 'Carriage return character' });
            break;
          case 't':
            explanations.push({ token, explanation: 'Tab character' });
            break;
          case '0':
            explanations.push({ token, explanation: 'Null character' });
            break;
          default:
            // Check for backreference \1-\9
            if (/^[1-9]$/.test(next)) {
              explanations.push({ token, explanation: `Backreference to capturing group #${next}` });
            } else {
              explanations.push({ token, explanation: `Escaped character: ${next}` });
            }
            break;
        }
        i += 2;
        continue;
      }

      // Character set [...]
      if (ch === '[') {
        let setEnd = i + 1;
        let depth = 1;
        let setToken = '[';
        while (setEnd < pattern.length && depth > 0) {
          if (pattern[setEnd] === '\\' && setEnd + 1 < pattern.length) {
            setToken += pattern[setEnd] + pattern[setEnd + 1];
            setEnd += 2;
            continue;
          }
          const sc = pattern[setEnd];
          if (sc === '[') depth++;
          if (sc === ']') depth--;
          if (depth > 0) setToken += sc;
          setEnd++;
        }
        setToken += ']';

        const isNegated = pattern[i + 1] === '^';
        const innerContent = isNegated ? pattern.substring(i + 2, setEnd - 1) : pattern.substring(i + 1, setEnd - 1);
        explanations.push({
          token: setToken,
          explanation: isNegated
            ? `Match any character NOT in [${innerContent}]`
            : `Match any character in [${innerContent}]`,
        });
        i = setEnd;
        continue;
      }

      // Group: capturing ( ), non-capturing (?: ), lookahead (?= ), negative lookahead (?! )
      if (ch === '(') {
        let groupEnd = i + 1;
        let depth = 1;
        let groupToken = '(';
        while (groupEnd < pattern.length && depth > 0) {
          if (pattern[groupEnd] === '\\' && groupEnd + 1 < pattern.length) {
            groupToken += pattern[groupEnd] + pattern[groupEnd + 1];
            groupEnd += 2;
            continue;
          }
          const gc = pattern[groupEnd];
          if (gc === '(') depth++;
          if (gc === ')') depth--;
          if (depth > 0) groupToken += gc;
          groupEnd++;
        }
        groupToken += ')';

        // Determine group type from the token prefix after '('
        const inner = groupToken.substring(1, groupToken.length - 1);
        if (inner.startsWith('?:')) {
          explanations.push({ token: groupToken, explanation: 'Non-capturing group' });
        } else if (inner.startsWith('?=')) {
          explanations.push({ token: groupToken, explanation: 'Positive lookahead assertion' });
        } else if (inner.startsWith('?!')) {
          explanations.push({ token: groupToken, explanation: 'Negative lookahead assertion' });
        } else if (inner.startsWith('?<=')) {
          explanations.push({ token: groupToken, explanation: 'Positive lookbehind assertion' });
        } else if (inner.startsWith('?<!')) {
          explanations.push({ token: groupToken, explanation: 'Negative lookbehind assertion' });
        } else {
          explanations.push({ token: groupToken, explanation: 'Capturing group' });
        }
        i = groupEnd;
        continue;
      }

      // Alternation
      if (ch === '|') {
        explanations.push({ token: '|', explanation: 'Alternation (OR) — match either the left or right pattern' });
        i++;
        continue;
      }

      // Anchors
      if (ch === '^') {
        explanations.push({ token: '^', explanation: 'Start of string anchor' });
        i++;
        continue;
      }

      if (ch === '$') {
        explanations.push({ token: '$', explanation: 'End of string anchor' });
        i++;
        continue;
      }

      // Quantifiers — check multi-char quantifiers first
      if (ch === '{') {
        const closeBrace = pattern.indexOf('}', i + 1);
        if (closeBrace !== -1) {
          const token = pattern.substring(i, closeBrace + 1);
          const content = token.slice(1, -1);
          if (content.includes(',')) {
            const parts = content.split(',').map(s => s.trim());
            if (parts[1]) {
              explanations.push({ token, explanation: `Quantifier — match between ${parts[0] || '0'} and ${parts[1]} times` });
            } else {
              explanations.push({ token, explanation: `Quantifier — match ${parts[0]} or more times` });
            }
          } else {
            explanations.push({ token, explanation: `Quantifier — match exactly ${content} times` });
          }
          i = closeBrace + 1;
          continue;
        }
      }

      // Single-char quantifiers
      if (ch === '+') {
        explanations.push({ token: '+', explanation: 'Quantifier — match one or more times (greedy)' });
        i++;
        continue;
      }
      if (ch === '*') {
        explanations.push({ token: '*', explanation: 'Quantifier — match zero or more times (greedy)' });
        i++;
        continue;
      }
      if (ch === '?') {
        // Check if previous token was a quantifier (making it lazy)
        if (i > 0 && '+*?}'.includes(pattern[i - 1])) {
          explanations.push({ token: '?', explanation: 'Makes the preceding quantifier lazy (non-greedy)' });
        } else {
          explanations.push({ token: '?', explanation: 'Quantifier — match zero or one time (optional, greedy)' });
        }
        i++;
        continue;
      }

      // Dot (any character)
      if (ch === '.') {
        explanations.push({ token: '.', explanation: 'Match any single character (except newline by default)' });
        i++;
        continue;
      }

      // Regular literal character
      const literalEnd = i + 1;
      explanations.push({ token: ch, explanation: `Literal character: "${ch}"` });
      i = literalEnd;
    }

    return ok(explanations);
  } catch (e: any) {
    return err(`Regex explain error: ${e.message}`);
  }
}
