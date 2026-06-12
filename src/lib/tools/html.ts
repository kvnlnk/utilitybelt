import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// HTML formatter — basic tag-based indentation
// ---------------------------------------------------------------------------

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/**
 * Format HTML with consistent tag-based indentation.
 * Handles self-closing tags, doctype, comments.
 */
export function formatHtml(input: string): Result<string> {
  try {
    if (!input.trim()) return ok('');

    // Tokenize into tags and text
    const tokens: string[] = [];
    const tagRe = /(<!--[\s\S]*?-->|<[!?][^>]*>|<[^>]+>|[^<]+)/g;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(input)) !== null) {
      const t = m[1];
      if (!t) continue;
      tokens.push(t);
    }

    const lines: string[] = [];
    const stack: string[] = []; // track open tag names for indentation
    // Track whether we need to insert a newline before the next text token
    // (after a closing tag, or after a block-level opening tag)

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      // Comment — output as-is, indented
      if (t.startsWith('<!--')) {
        lines.push('  '.repeat(stack.length) + t);
        continue;
      }

      // Doctype / XML declaration — output at current indent
      if (t.startsWith('<!') || t.startsWith('<?')) {
        lines.push('  '.repeat(stack.length) + t);
        continue;
      }

      // Closing tag </tagname>
      if (t.startsWith('</')) {
        const tagName = t.match(/<\/(\w+)/)?.[1]?.toLowerCase();
        if (tagName) {
          // Pop stack if it matches
          if (stack.length > 0 && stack[stack.length - 1] === tagName) {
            stack.pop();
          }
          lines.push('  '.repeat(stack.length) + t);
        }
        continue;
      }

      // Opening tag or self-closing / void tag
      if (t.startsWith('<')) {
        const tagMatch = t.match(/^<(\w+)/);
        if (tagMatch) {
          const tagName = tagMatch[1].toLowerCase();
          const isClosing = t.endsWith('/>');
          const isVoid = VOID_ELEMENTS.has(tagName);

          if (isClosing || isVoid) {
            // Self-closing or void — no indent change, output at current indent
            lines.push('  '.repeat(stack.length) + t);
          } else {
            // Opening tag — output at current indent then push
            lines.push('  '.repeat(stack.length) + t);
            stack.push(tagName);
          }
        } else {
          // Unknown tag-like token
          lines.push('  '.repeat(stack.length) + t);
        }
        continue;
      }

      // Text content — trim whitespace for formatting
      const text = t.replace(/\s+/g, ' ').trim();
      if (text) {
        if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
          // If previous line was text too, append to it
          // Actually, separate text tokens should each be on their own line
          lines.push('  '.repeat(stack.length) + text);
        } else {
          lines.push('  '.repeat(stack.length) + text);
        }
      }
    }

    return ok(lines.join('\n'));
  } catch (e: any) {
    return err(`HTML format error: ${e.message}`);
  }
}
