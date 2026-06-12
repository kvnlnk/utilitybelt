import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// ASCII Art Generator
// ---------------------------------------------------------------------------

type FontName = 'block' | 'simple';

// 5x7 block font — each character is an array of 7 strings, each 5 chars wide
const BLOCK_FONT: Record<string, string[]> = {
  A: [
    ' AAA ',
    'A   A',
    'A   A',
    'AAAAA',
    'A   A',
    'A   A',
    'A   A',
  ],
  B: [
    'BBBB ',
    'B   B',
    'B   B',
    'BBBB ',
    'B   B',
    'B   B',
    'BBBB ',
  ],
  C: [
    ' CCC ',
    'C   C',
    'C    ',
    'C    ',
    'C    ',
    'C   C',
    ' CCC ',
  ],
  D: [
    'DDDD ',
    'D   D',
    'D   D',
    'D   D',
    'D   D',
    'D   D',
    'DDDD ',
  ],
  E: [
    'EEEEE',
    'E    ',
    'E    ',
    'EEEEE',
    'E    ',
    'E    ',
    'EEEEE',
  ],
  F: [
    'FFFFF',
    'F    ',
    'F    ',
    'FFFF ',
    'F    ',
    'F    ',
    'F    ',
  ],
  G: [
    ' GGG ',
    'G   G',
    'G    ',
    'G GGG',
    'G   G',
    'G   G',
    ' GGG ',
  ],
  H: [
    'H   H',
    'H   H',
    'H   H',
    'HHHHH',
    'H   H',
    'H   H',
    'H   H',
  ],
  I: [
    'IIIII',
    '  I  ',
    '  I  ',
    '  I  ',
    '  I  ',
    '  I  ',
    'IIIII',
  ],
  J: [
    'JJJJJ',
    '   J ',
    '   J ',
    '   J ',
    '   J ',
    'J  J ',
    ' JJ  ',
  ],
  K: [
    'K   K',
    'K  K ',
    'K K  ',
    'KK   ',
    'K K  ',
    'K  K ',
    'K   K',
  ],
  L: [
    'L    ',
    'L    ',
    'L    ',
    'L    ',
    'L    ',
    'L    ',
    'LLLLL',
  ],
  M: [
    'M   M',
    'MM MM',
    'M M M',
    'M   M',
    'M   M',
    'M   M',
    'M   M',
  ],
  N: [
    'N   N',
    'NN  N',
    'N N N',
    'N  NN',
    'N   N',
    'N   N',
    'N   N',
  ],
  O: [
    ' OOO ',
    'O   O',
    'O   O',
    'O   O',
    'O   O',
    'O   O',
    ' OOO ',
  ],
  P: [
    'PPPP ',
    'P   P',
    'P   P',
    'PPPP ',
    'P    ',
    'P    ',
    'P    ',
  ],
  Q: [
    ' QQQ ',
    'Q   Q',
    'Q   Q',
    'Q   Q',
    'Q  QQ',
    'Q Q Q',
    ' QQQ ',
  ],
  R: [
    'RRRR ',
    'R   R',
    'R   R',
    'RRRR ',
    'R R  ',
    'R  R ',
    'R   R',
  ],
  S: [
    ' SSS ',
    'S   S',
    'S    ',
    ' SSS ',
    '    S',
    'S   S',
    ' SSS ',
  ],
  T: [
    'TTTTT',
    '  T  ',
    '  T  ',
    '  T  ',
    '  T  ',
    '  T  ',
    '  T  ',
  ],
  U: [
    'U   U',
    'U   U',
    'U   U',
    'U   U',
    'U   U',
    'U   U',
    ' UUU ',
  ],
  V: [
    'V   V',
    'V   V',
    'V   V',
    'V   V',
    'V   V',
    ' V V ',
    '  V  ',
  ],
  W: [
    'W   W',
    'W   W',
    'W   W',
    'W W W',
    'W W W',
    'W W W',
    ' W W ',
  ],
  X: [
    'X   X',
    'X   X',
    ' X X ',
    '  X  ',
    ' X X ',
    'X   X',
    'X   X',
  ],
  Y: [
    'Y   Y',
    'Y   Y',
    ' Y Y ',
    '  Y  ',
    '  Y  ',
    '  Y  ',
    '  Y  ',
  ],
  Z: [
    'ZZZZZ',
    '    Z',
    '   Z ',
    '  Z  ',
    ' Z   ',
    'Z    ',
    'ZZZZZ',
  ],
  '0': [
    ' OOO ',
    'O  OO',
    'O O O',
    'OO O ',
    'O   O',
    'O   O',
    ' OOO ',
  ],
  '1': [
    '  1  ',
    ' 11  ',
    '1 1  ',
    '  1  ',
    '  1  ',
    '  1  ',
    '11111',
  ],
  '2': [
    ' 222 ',
    '2   2',
    '   2 ',
    '  2  ',
    ' 2   ',
    '2    ',
    '22222',
  ],
  '3': [
    ' 333 ',
    '3   3',
    '   3 ',
    '  33 ',
    '   3 ',
    '3   3',
    ' 333 ',
  ],
  '4': [
    '   4 ',
    '  44 ',
    ' 4 4 ',
    '4  4 ',
    '44444',
    '   4 ',
    '   4 ',
  ],
  '5': [
    '55555',
    '5    ',
    '5    ',
    '5555 ',
    '    5',
    '5   5',
    ' 555 ',
  ],
  '6': [
    ' 666 ',
    '6    ',
    '6    ',
    '6666 ',
    '6   6',
    '6   6',
    ' 666 ',
  ],
  '7': [
    '77777',
    '    7',
    '   7 ',
    '  7  ',
    ' 7   ',
    '7    ',
    '7    ',
  ],
  '8': [
    ' 888 ',
    '8   8',
    '8   8',
    ' 888 ',
    '8   8',
    '8   8',
    ' 888 ',
  ],
  '9': [
    ' 999 ',
    '9   9',
    '9   9',
    ' 9999',
    '    9',
    '    9',
    ' 999 ',
  ],
  ' ': [
    '     ',
    '     ',
    '     ',
    '     ',
    '     ',
    '     ',
    '     ',
  ],
  '.': [
    '     ',
    '     ',
    '     ',
    '     ',
    '     ',
    '  ** ',
    '  ** ',
  ],
  ',': [
    '     ',
    '     ',
    '     ',
    '     ',
    '     ',
    '  ** ',
    '  *  ',
  ],
  '!': [
    '  !  ',
    '  !  ',
    '  !  ',
    '  !  ',
    '  !  ',
    '     ',
    '  !  ',
  ],
  '?': [
    ' ??? ',
    '?   ?',
    '    ?',
    '   ? ',
    '  ?  ',
    '     ',
    '  ?  ',
  ],
  '-': [
    '     ',
    '     ',
    '     ',
    '-----',
    '     ',
    '     ',
    '     ',
  ],
  '+': [
    '     ',
    '  +  ',
    '  +  ',
    ' +++ ',
    '  +  ',
    '  +  ',
    '     ',
  ],
  '=': [
    '     ',
    '=====',
    '     ',
    '=====',
    '     ',
    '     ',
    '     ',
  ],
  '/': [
    '    /',
    '   / ',
    '  /  ',
    ' /   ',
    '/    ',
    '     ',
    '     ',
  ],
  '\\': [
    '     ',
    '\\    ',
    ' \\   ',
    '  \\  ',
    '   \\ ',
    '    \\',
    '     ',
  ],
  ':': [
    '     ',
    '  ** ',
    '  ** ',
    '     ',
    '  ** ',
    '  ** ',
    '     ',
  ],
  '@': [
    ' @@@ ',
    '@   @',
    '@ @ @',
    '@ @ @',
    '@ @  ',
    '@   @',
    ' @@@ ',
  ],
  '#': [
    '     ',
    ' # # ',
    '#####',
    ' # # ',
    '#####',
    ' # # ',
    '     ',
  ],
  '(': [
    '   ( ',
    '  (  ',
    ' (   ',
    ' (   ',
    ' (   ',
    '  (  ',
    '   ( ',
  ],
  ')': [
    ' (   ',
    '  (  ',
    '   ( ',
    '   ( ',
    '   ( ',
    '  (  ',
    ' (   ',
  ],
  "'": [
    '  *  ',
    '  *  ',
    '  *  ',
    '     ',
    '     ',
    '     ',
    '     ',
  ],
  '"': [
    ' * * ',
    ' * * ',
    ' * * ',
    '     ',
    '     ',
    '     ',
    '     ',
  ],
};

// Simple font — just single characters
const SIMPLE_FONT: Record<string, string[]> = {};

// Build simple font from single characters
function getSimpleChar(ch: string): string[] {
  const row = ch === ' ' ? ' ' : ch;
  return [row, row, row, row, row, row, row];
}

// Pre-populate simple font
for (let i = 32; i <= 126; i++) {
  const ch = String.fromCharCode(i);
  SIMPLE_FONT[ch] = getSimpleChar(ch);
}

const SUPPORTED_FONTS: FontName[] = ['block', 'simple'];

/**
 * Convert text to ASCII art using a 5x7 block font or simple font.
 */
export function textToAscii(text: string, font: FontName = 'block'): Result<string> {
  try {
    if (!text) {
      return ok('');
    }

    if (!SUPPORTED_FONTS.includes(font)) {
      return err(`Unsupported font: ${font}. Use: ${SUPPORTED_FONTS.join(', ')}`);
    }

    const fontData = font === 'block' ? BLOCK_FONT : SIMPLE_FONT;
    const chars = text.toUpperCase().split('');
    const lines: string[] = ['', '', '', '', '', '', ''];

    for (const ch of chars) {
      const glyph = fontData[ch];
      if (!glyph) {
        // Skip unsupported characters
        continue;
      }
      for (let row = 0; row < 7; row++) {
        lines[row] += glyph[row];
        if (font === 'block') {
          lines[row] += '  '; // spacing between characters
        } else {
          lines[row] += ' ';
        }
      }
    }

    // Trim trailing spaces
    const result = lines.map((l) => l.trimEnd()).join('\n');
    return ok(result);
  } catch (e: any) {
    return err(`ASCII art error: ${e.message}`);
  }
}
