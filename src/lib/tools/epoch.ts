import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Epoch / Unix timestamp converters
// ---------------------------------------------------------------------------

/**
 * Convert a Unix epoch timestamp (seconds since 1970-01-01) to a human-readable
 * ISO 8601 date string in UTC.
 */
export function epochToDate(epochSeconds: number): Result<string> {
  try {
    const d = new Date(epochSeconds * 1000);
    if (isNaN(d.getTime())) {
      return err('Invalid epoch timestamp');
    }
    return ok(d.toISOString());
  } catch (e: any) {
    return err(`Epoch to date error: ${e.message}`);
  }
}

/**
 * Convert a date string (ISO 8601 or any Date-parsable string) to a Unix epoch
 * timestamp in seconds.
 */
export function dateToEpoch(dateString: string): Result<number> {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return err(`Invalid date string: ${dateString}`);
    }
    return ok(Math.floor(d.getTime() / 1000));
  } catch (e: any) {
    return err(`Date to epoch error: ${e.message}`);
  }
}

/**
 * Get the current Unix epoch timestamp in seconds.
 */
export function now(): Result<number> {
  try {
    return ok(Math.floor(Date.now() / 1000));
  } catch (e: any) {
    return err(`now() error: ${e.message}`);
  }
}
