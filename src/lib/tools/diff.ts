import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Text diff — LCS-based (Longest Common Subsequence)
// ---------------------------------------------------------------------------

export type DiffOp = { type: 'add'; value: string } | { type: 'remove'; value: string } | { type: 'keep'; value: string };

/**
 * Compute the edit operations (add / remove / keep) between two strings
 * at the *character* level using a Longest Common Subsequence algorithm.
 */
export function diffText(a: string, b: string): Result<DiffOp[]> {
  try {
    const ops = buildDiff(a, b);
    return ok(ops);
  } catch (e: any) {
    return err(`Diff error: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// LCS helpers
// ---------------------------------------------------------------------------

function lcsTable(a: string, b: string): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function buildDiff(a: string, b: string): DiffOp[] {
  const dp = lcsTable(a, b);
  const ops: DiffOp[] = [];
  let i = a.length;
  let j = b.length;

  // Backtrack and collect ops in reverse
  const rev: DiffOp[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      rev.push({ type: 'keep', value: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rev.push({ type: 'add', value: b[j - 1] });
      j--;
    } else {
      rev.push({ type: 'remove', value: a[i - 1] });
      i--;
    }
  }

  // Reverse to get forward order, then merge consecutive same-type ops
  rev.reverse();

  // Merge runs
  const merged: DiffOp[] = [];
  for (const op of rev) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) {
      last.value += op.value;
    } else {
      merged.push({ ...op });
    }
  }

  return merged;
}
