import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Structured log viewer — parse and inspect JSON logs
// ---------------------------------------------------------------------------

export interface LogEntry {
  _index: number;
  _raw: string;
  [key: string]: unknown;
}

export interface LogParseResult {
  entries: LogEntry[];
  fields: string[];
  total: number;
}

/**
 * Parse JSON logs from a string. Accepts:
 * - Newline-delimited JSON (NDJSON)
 * - JSON array of objects
 * - Single JSON object
 */
export function parseLogs(input: string): Result<LogParseResult> {
  try {
    const trimmed = input.trim();
    if (!trimmed) return err('No input provided.');

    let parsed: unknown[];

    // Try JSON array first
    if (trimmed.startsWith('[')) {
      parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) return err('Expected a JSON array.');
    } else if (trimmed.startsWith('{')) {
      // Could be NDJSON or single object
      const lines = trimmed.split('\n').filter((l) => l.trim());
      if (lines.length === 1) {
        parsed = [JSON.parse(lines[0])];
      } else {
        parsed = lines.map((line, i) => {
          try {
            return JSON.parse(line);
          } catch {
            throw new Error(`Line ${i + 1} is not valid JSON: ${line.slice(0, 60)}`);
          }
        });
      }
    } else {
      // Try NDJSON
      const lines = trimmed.split('\n').filter((l) => l.trim());
      if (lines.length === 0) return err('No content to parse.');
      parsed = lines.map((line, i) => {
        try {
          return JSON.parse(line);
        } catch {
          throw new Error(`Line ${i + 1} is not valid JSON: ${line.slice(0, 60)}`);
        }
      });
    }

    // Validate all entries are objects
    const entries: LogEntry[] = [];
    const fieldSet = new Set<string>();

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return err(`Entry ${i + 1} is not a JSON object (got ${typeof item}).`);
      }
      const entry: LogEntry = { _index: i, _raw: JSON.stringify(item, null, 2) };
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        entry[k] = v;
        fieldSet.add(k);
      }
      entries.push(entry);
    }

    const fields = Array.from(fieldSet).sort();
    return ok({ entries, fields, total: entries.length });
  } catch (e: any) {
    return err(`Parse error: ${e.message}`);
  }
}

/**
 * Filter log entries by a search query and optional field filter.
 */
export function filterLogs(
  entries: LogEntry[],
  query: string,
  fieldFilter: string | null,
): LogEntry[] {
  if (!query && !fieldFilter) return entries;

  return entries.filter((entry) => {
    // Field filter
    if (fieldFilter) {
      const val = entry[fieldFilter];
      if (val === undefined || val === null) return false;
    }
    // Text search
    if (query) {
      const q = query.toLowerCase();
      return Object.entries(entry).some(([k, v]) => {
        if (k === '_index' || k === '_raw') return false;
        return String(v).toLowerCase().includes(q) || k.toLowerCase().includes(q);
      });
    }
    return true;
  });
}

/**
 * Get a human-readable type for a value.
 */
export function getValueType(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (Array.isArray(val)) return `array[${val.length}]`;
  if (typeof val === 'object') return `object`;
  if (typeof val === 'string') {
    // Check if it looks like a date
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return 'date';
    return 'string';
  }
  if (typeof val === 'number') return 'number';
  if (typeof val === 'boolean') return 'boolean';
  return typeof val;
}

/**
 * Format a value for display.
 */
export function formatValue(val: unknown, maxLen = 80): string {
  if (val === null) return 'null';
  if (val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val).slice(0, maxLen);
  const s = String(val);
  return s.length > maxLen ? s.slice(0, maxLen) + '...' : s;
}
