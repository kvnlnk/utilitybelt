import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Image to Base64 — converts a File/Blob to a data URL
// ---------------------------------------------------------------------------

/**
 * Convert an image File or Blob to a base64 data URL.
 * Supports common image types (PNG, JPEG, GIF, WebP, SVG, BMP).
 */
export function imageToBase64(file: File | Blob): Promise<Result<string>> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(ok(reader.result));
        } else {
          resolve(err('FileReader returned unexpected result type.'));
        }
      };

      reader.onerror = () => {
        resolve(err(`Failed to read file: ${reader.error?.message || 'Unknown error'}`));
      };

      reader.readAsDataURL(file);
    } catch (e: any) {
      resolve(err(`Image to Base64 conversion failed: ${e.message}`));
    }
  });
}
