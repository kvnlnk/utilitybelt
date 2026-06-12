import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// CSS minifier — strips comments, whitespace, last semicolons, etc.
// ---------------------------------------------------------------------------

/**
 * Minify a CSS string by:
 * - Removing comments (/* ... *​/)
 * - Collapsing whitespace (tabs, newlines, multiple spaces -> single space)
 * - Removing spaces around operators / delimiters: { } : ; , > + ~
 * - Removing the last semicolon before a closing brace
 * - Removing empty rules (optional — kept here for compactness)
 * - Removing leading/trailing whitespace from values
 */
export function minifyCss(input: string): Result<string> {
  try {
    if (!input.trim()) return ok('');

    let css = input;

    // 1. Remove comments (including multi-line)
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // 2. Collapse all whitespace runs to a single space
    css = css.replace(/[\t\r\n ]+/g, ' ');

    // 3. Remove spaces around structural characters
    css = css
      // Space before/after { } : ; , > ~ +
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/\s*([>~+])\s*/g, '$1')
      // Space after opening paren, before closing paren (for url(), etc.)
      .replace(/\(\s*/g, '(')
      .replace(/\s*\)/g, ')');

    // 4. Remove last semicolon before closing brace
    css = css.replace(/;}/g, '}');

    // 5. Remove semicolons before closing } that might have been missed
    // (handles nested cases like @media { ... })
    css = css.replace(/;}/g, '}');

    // 6. Collapse multiple spaces again (from removals above)
    css = css.replace(/ {2,}/g, ' ');

    // 7. Trim leading/trailing whitespace
    css = css.trim();

    // 8. Remove the space before !important
    css = css.replace(/ !important/g, '!important');

    // 9. Strip empty rules (e.g., ".foo{}" where there's nothing inside)
    //    but be careful not to strip @-rules that may have content
    css = css.replace(/[^}]*\{\s*\}/g, '');

    // 10. Clean up empty blocks between semicolons
    css = css.replace(/;+/g, ';');

    // 11. Remove trailing semicolon at end
    css = css.replace(/;+\s*$/, '');

    // 12. Final trim
    css = css.trim();

    return ok(css);
  } catch (e: any) {
    return err(`CSS minify error: ${e.message}`);
  }
}
