// ---------------------------------------------------------------------------
// JSONPath Tester — evaluate basic JSONPath expressions against JSON data
// ---------------------------------------------------------------------------

import { ok, err, type Result } from "./types";

function tokenize(path: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < path.length) {
    if (path[i] === "$") {
      tokens.push("$");
      i++;
    } else if (path[i] === ".") {
      i++;
      const start = i;
      while (i < path.length && /[a-zA-Z0-9_$]/.test(path[i])) i++;
      if (i > start) tokens.push(path.slice(start, i));
    } else if (path[i] === "[") {
      i++;
      const start = i;
      let depth = 0;
      while (i < path.length) {
        if (path[i] === "[" && i > start) depth++;
        if (path[i] === "]") {
          if (depth === 0) break;
          depth--;
        }
        i++;
      }
      tokens.push(path.slice(start, i));
      i++; // skip ]
    } else if (path[i] === "*" && (path[i - 1] === "[" || path[i - 1] === ".")) {
      tokens.push("*");
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

function evaluateAtPath(data: unknown, token: string): unknown[] {
  // Wildcard
  if (token === "*") {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return Object.values(data);
    return [data];
  }

  // Array index like "0" or "0,1,2"
  if (/^\d+(,\d+)*$/.test(token)) {
    if (!Array.isArray(data)) return [];
    const indices = token.split(",").map(Number);
    return indices.map((i) => data[i]).filter((v) => v !== undefined);
  }

  // Key access
  if (typeof data === "object" && data !== null && token in data) {
    return [(data as Record<string, unknown>)[token]];
  }

  return [];
}

function walkRecursive(data: unknown, key: string): unknown[] {
  const results: unknown[] = [];

  function recurse(value: unknown): void {
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if (key in obj) results.push(obj[key]);
      for (const k of Object.keys(obj)) {
        recurse(obj[k]);
      }
    }
  }

  recurse(data);
  return results;
}

export function testJsonPath(
  json: string,
  path: string,
): Result<{ result: unknown; matches: number }> {
  // Validate JSON
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return err("Invalid JSON: " + (json.length > 50 ? json.slice(0, 50) + "…" : json));
  }

  // Validate path
  if (!path.startsWith("$")) {
    return err("JSONPath must start with '$' (root)");
  }

  try {
    const tokens = tokenize(path);
    if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === "$")) {
      return ok({ result: data, matches: 1 });
    }

    let currentSet: unknown[] = [data];

    // Process tokens starting after "$"
    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];

      // Handle recursive descent
      if (token === "..") {
        // The next token after .. is the key to search for
        if (i + 1 < tokens.length) {
          const nextToken = tokens[i + 1];
          const newSet: unknown[] = [];
          for (const item of currentSet) {
            const found = walkRecursive(item, nextToken);
            newSet.push(...found);
          }
          currentSet = newSet;
          i++; // skip the next token since we consumed it
        }
        continue;
      }

      // Handle $..key where it's combined (no separate .. token)
      // Check if the current token is actually a "..key" pattern
      const recMatch = token.match(/^\.\.([a-zA-Z0-9_$*]+)$/);
      if (recMatch) {
        const keyName = recMatch[1];
        const newSet: unknown[] = [];
        for (const item of currentSet) {
          const found = walkRecursive(item, keyName);
          newSet.push(...found);
        }
        currentSet = newSet;
        continue;
      }

      // Standard token evaluation
      const newSet: unknown[] = [];
      for (const item of currentSet) {
        const evaluated = evaluateAtPath(item, token);
        newSet.push(...evaluated);
      }
      currentSet = newSet;
    }

    // Remove duplicates for cleaner output
    const unique = removeDuplicates(currentSet);

    return ok({
      result: unique.length === 1 ? unique[0] : unique,
      matches: unique.length,
    });
  } catch (e) {
    return err(
      "Error evaluating path: " +
        (e instanceof Error ? e.message : String(e)),
    );
  }
}

function removeDuplicates(arr: unknown[]): unknown[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
