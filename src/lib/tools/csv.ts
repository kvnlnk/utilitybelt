import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// CSV <-> JSON conversion
// ---------------------------------------------------------------------------

/**
 * Parse a CSV string into a JSON array of objects.
 * First row is treated as header. Nested JSON paths like "a.b.c" are
 * expanded into nested objects.
 */
export function csvToJson(input: string, delimiter: string = ','): Result<unknown[]> {
  try {
    const lines = input.trim().split('\n');
    if (lines.length < 2) {
      return err('CSV must have at least a header row and one data row');
    }

    const headers = parseCsvLine(lines[0], delimiter);

    const result: unknown[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i], delimiter);
      if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) continue;

      const obj: Record<string, unknown> = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].trim();
        const value = j < row.length ? row[j].trim() : '';
        setNested(obj, header, coerceValue(value));
      }
      result.push(obj);
    }

    return ok(result);
  } catch (e: any) {
    return err(`CSV to JSON error: ${e.message}`);
  }
}

/**
 * Convert a JSON array (or single object) to CSV.
 * If values are nested objects, dot-notation headers are created.
 * The first object defines the column order.
 */
export function jsonToCsv(input: string, delimiter: string = ','): Result<string> {
  try {
    const parsed = JSON.parse(input);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length === 0) return err('JSON array is empty');

    // Collect all flattened headers in insertion order
    const allHeaders = new Map<string, number>();
    const order: string[] = [];

    const flatten = (obj: unknown, prefix: string = ''): Record<string, string> => {
      const result: Record<string, string> = {};
      if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          const key = prefix ? `${prefix}.${k}` : k;
          if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
            Object.assign(result, flatten(v, key));
          } else {
            result[key] = v === null || v === undefined ? '' : String(v);
            if (!allHeaders.has(key)) {
              allHeaders.set(key, order.length);
              order.push(key);
            }
          }
        }
      } else {
        result[prefix] = obj === null || obj === undefined ? '' : String(obj);
        if (!allHeaders.has(prefix)) {
          allHeaders.set(prefix, order.length);
          order.push(prefix);
        }
      }
      return result;
    };

    // Build header order from first object
    flatten(arr[0]);

    // Escape a value for CSV
    const escapeCsv = (val: string): string => {
      if (val.includes(delimiter) || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const lines: string[] = [];
    lines.push(order.map((h) => escapeCsv(h)).join(delimiter));

    for (const item of arr) {
      const flat = flatten(item);
      lines.push(order.map((h) => escapeCsv(flat[h] ?? '')).join(delimiter));
    }

    return ok(lines.join('\n'));
  } catch (e: any) {
    return err(`JSON to CSV error: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a single CSV line respecting quoted fields */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

/** Set a value at a dotted path in a nested object */
function setNested(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

/** Try to coerce a string value to number/boolean if applicable */
function coerceValue(value: string): unknown {
  if (value === '') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  // Check if it's a valid number
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value) && !isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}
