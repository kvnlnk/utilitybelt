import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// JSON Viewer / Tree Parser
// ---------------------------------------------------------------------------

export interface JsonNode {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
  children?: JsonNode[];
  depth: number;
}

/**
 * Recursively parse a JSON string into a tree of JsonNode objects.
 */
export function parseJsonTree(json: string): Result<JsonNode[]> {
  try {
    const parsed = JSON.parse(json);
    const tree = buildTree(parsed, 'root', 0);
    return ok(tree.children ?? []);
  } catch (e: any) {
    return err(`Invalid JSON: ${e.message}`);
  }
}

function buildTree(
  value: unknown,
  key: string,
  depth: number,
): JsonNode {
  if (value === null) {
    return { key, value: 'null', type: 'null', depth };
  }

  if (Array.isArray(value)) {
    const children: JsonNode[] = [];
    for (let i = 0; i < value.length; i++) {
      children.push(buildTree(value[i], String(i), depth + 1));
    }
    return {
      key,
      value: `Array(${value.length})`,
      type: 'array',
      children,
      depth,
    };
  }

  if (typeof value === 'object') {
    const children: JsonNode[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      children.push(buildTree(v, k, depth + 1));
    }
    return {
      key,
      value: `Object(${Object.keys(value as Record<string, unknown>).length})`,
      type: 'object',
      children,
      depth,
    };
  }

  if (typeof value === 'string') {
    return { key, value: value as string, type: 'string', depth };
  }

  if (typeof value === 'number') {
    return { key, value: String(value), type: 'number', depth };
  }

  if (typeof value === 'boolean') {
    return { key, value: String(value), type: 'boolean', depth };
  }

  return { key, value: String(value), type: 'string', depth };
}
