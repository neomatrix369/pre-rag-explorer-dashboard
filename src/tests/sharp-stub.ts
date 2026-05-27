/**
 * Vitest stub for sharp — browser-only app; transformers image utils import sharp
 * in Node but jsdom tests never use it. Avoids native binding mismatches (e.g. x64 vs arm64).
 */
function sharpStub(): typeof sharpStub {
  return sharpStub;
}

export default sharpStub;
