import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// XML formatter — basic tag-based indentation for XML
// ---------------------------------------------------------------------------

/**
 * Format XML with consistent tag-based indentation.
 * Handles self-closing tags, comments, CDATA, and processing instructions.
 */
export function formatXml(input: string): Result<string> {
  try {
    if (!input.trim()) return ok('');

    // Normalize line endings
    let normalized = input.replace(/\r\n?/g, '\n');

    // Tokenize into tags and text
    const tokens: string[] = [];
    const tagRe = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<[^>]*?>|[^<]+)/g;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(normalized)) !== null) {
      const t = m[1];
      if (!t) continue;
      tokens.push(t);
    }

    const lines: string[] = [];
    const stack: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      // Comment — output as-is, indented
      if (t.startsWith('<!--')) {
        lines.push('  '.repeat(stack.length) + t);
        continue;
      }

      // CDATA — output at current indent
      if (t.startsWith('<![CDATA[')) {
        lines.push('  '.repeat(stack.length) + t);
        continue;
      }

      // Processing instruction <?...?>
      if (t.startsWith('<?')) {
        lines.push('  '.repeat(stack.length) + t);
        continue;
      }

      // Closing tag </tagname>
      if (t.startsWith('</')) {
        const tagName = t.match(/<\/(\w[\w.-]*)/)?.[1];
        if (tagName) {
          if (stack.length > 0 && stack[stack.length - 1] === tagName) {
            stack.pop();
          }
          lines.push('  '.repeat(stack.length) + t);
        }
        continue;
      }

      // Opening or self-closing tag
      if (t.startsWith('<')) {
        const tagMatch = t.match(/^<(\w[\w.-]*)/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          const isSelfClosing = t.endsWith('/>');

          if (isSelfClosing) {
            lines.push('  '.repeat(stack.length) + t);
          } else {
            lines.push('  '.repeat(stack.length) + t);
            stack.push(tagName);
          }
        } else {
          lines.push('  '.repeat(stack.length) + t);
        }
        continue;
      }

      // Text content
      const text = t.replace(/\s+/g, ' ').trim();
      if (text) {
        lines.push('  '.repeat(stack.length) + text);
      }
    }

    return ok(lines.join('\n'));
  } catch (e: any) {
    return err(`XML format error: ${e.message}`);
  }
}
