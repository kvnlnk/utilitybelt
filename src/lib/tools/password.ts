import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Password Generator
// ---------------------------------------------------------------------------

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?/~`';

function shuffle(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Calculate password strength score (0-100).
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;

  // Length scoring (up to 40 points)
  score += Math.min(40, Math.floor(password.length * 1.25));

  // Character variety (up to 60 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;

  // Bonus for mixing types
  const typesUsed = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
  if (typesUsed >= 3) score += 10;
  if (typesUsed === 4) score += 5;

  return Math.min(100, score);
}

/**
 * Get a human-readable label for a strength score.
 */
export function strengthLabel(score: number): string {
  if (score < 20) return 'Very Weak';
  if (score < 40) return 'Weak';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Strong';
  return 'Very Strong';
}

/**
 * Generate a random password based on the given options.
 */
export function generatePassword(options: PasswordOptions): Result<string> {
  try {
    const { length, uppercase, lowercase, numbers, symbols } = options;

    if (length < 8 || length > 64) {
      return err('Password length must be between 8 and 64 characters.');
    }

    let charset = '';
    if (uppercase) charset += UPPERCASE;
    if (lowercase) charset += LOWERCASE;
    if (numbers) charset += NUMBERS;
    if (symbols) charset += SYMBOLS;

    if (!charset) {
      return err('At least one character type must be selected.');
    }

    // Ensure at least one character from each selected type
    const password: string[] = [];
    if (uppercase) password.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
    if (lowercase) password.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
    if (numbers) password.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
    if (symbols) password.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);

    // Fill remaining length with random chars from full charset
    for (let i = password.length; i < length; i++) {
      password.push(charset[Math.floor(Math.random() * charset.length)]);
    }

    // Shuffle the final password
    return ok(shuffle(password.join('')));
  } catch (e: any) {
    return err(`Password generation failed: ${e.message}`);
  }
}
