import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Lorem Ipsum generator
// ---------------------------------------------------------------------------

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum',
];

/**
 * Generate lorem ipsum text for a given number of paragraphs.
 * Each paragraph has 3-8 sentences; each sentence has 5-15 words.
 */
export function generateLoremIpsum(paragraphs: number = 1): Result<string> {
  try {
    if (paragraphs < 1) {
      return err('Number of paragraphs must be >= 1');
    }

    const result: string[] = [];
    for (let p = 0; p < paragraphs; p++) {
      const sentenceCount = randInt(3, 8);
      const sentences: string[] = [];
      for (let s = 0; s < sentenceCount; s++) {
        const wordCount = randInt(5, 15);
        const words: string[] = [];
        for (let w = 0; w < wordCount; w++) {
          words.push(pickRandom(LOREM_WORDS));
        }
        let sentence = words.join(' ');
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        // 80% chance end with period, 10% question, 10% exclamation
        const ending = Math.random();
        if (ending < 0.8) sentence += '.';
        else if (ending < 0.9) sentence += '?';
        else sentence += '!';
        sentences.push(sentence);
      }
      result.push(sentences.join(' '));
    }

    return ok(result.join('\n\n'));
  } catch (e: any) {
    return err(`Lorem ipsum generation error: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Random integer in [min, max] inclusive */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
