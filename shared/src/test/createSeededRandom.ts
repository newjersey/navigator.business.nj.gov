import { createCipheriv, createHash } from "node:crypto";

interface SeededRandomOptions {
  readonly seed: string;
}

const bytesPerValue = 7;
const bufferSize = bytesPerValue * 512;
const zeroes = Buffer.alloc(bufferSize);

export const createSeededRandom = ({ seed }: SeededRandomOptions): (() => number) => {
  if (seed.length === 0) {
    throw new Error("Random seed must not be empty");
  }

  const key = createHash("sha256").update("navigator-test-random-v1\0").update(seed).digest();
  // A fixed counter deliberately reproduces the stream for a given test seed.
  // This replayable generator must never be used for production secrets.
  const cipher = createCipheriv("aes-256-ctr", key, Buffer.alloc(16));
  let buffer = Buffer.alloc(0);
  let offset = 0;

  return () => {
    if (offset === buffer.length) {
      buffer = cipher.update(zeroes);
      offset = 0;
    }

    const value = buffer.readUIntBE(offset, 6) * 32 + (buffer[offset + 6] >>> 3);
    offset += bytesPerValue;
    return value / 2 ** 53;
  };
};
