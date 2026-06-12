import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Text to Slug
// ---------------------------------------------------------------------------

/**
 * Convert a string into a URL-friendly slug.
 * - Converts to lowercase
 * - Handles umlauts (ä→ae, ö→oe, ü→ue, ß→ss)
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Collapses multiple hyphens
 * - Trims leading/trailing hyphens
 */
export function toSlug(input: string): Result<string> {
  try {
    if (!input) return ok('');

    let slug = input
      .toLowerCase()
      // Handle umlauts and special German characters
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      // Handle other common diacritics
      .replace(/[àáâãå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõ]/g, 'o')
      .replace(/[ùúû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Collapse multiple hyphens
      .replace(/-+/g, '-')
      // Trim leading/trailing hyphens
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    return ok(slug);
  } catch (e: any) {
    return err(`Slug conversion error: ${e.message}`);
  }
}
