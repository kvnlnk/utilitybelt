// ---------------------------------------------------------------------------
// Vitest setup — extend expect with DOM matchers, polyfill crypto
// ---------------------------------------------------------------------------
import '@testing-library/jest-dom/vitest';

// Polyfill crypto for jsdom environment (no native Web Crypto)
if (typeof globalThis.crypto === 'undefined' || !(globalThis.crypto as any).randomUUID) {
  const cryptoStub = {
    randomUUID: (): string =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
    subtle: {
      digest: async (_algorithm: string, data: Uint8Array): Promise<ArrayBuffer> => {
        // Simple non-crypto hash for deterministic test output
        let hash = 5381;
        for (let i = 0; i < data.length; i++) {
          hash = ((hash << 5) + hash + data[i]) | 0;
        }
        const buf = new ArrayBuffer(32);
        const view = new Uint8Array(buf);
        for (let i = 0; i < 32; i++) {
          view[i] = (hash >> (i * 8)) & 0xff;
        }
        return buf;
      },
    },
  };

  (globalThis as any).crypto = cryptoStub;
}
