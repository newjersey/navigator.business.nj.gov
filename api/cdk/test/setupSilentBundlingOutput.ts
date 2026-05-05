const originalStderrWrite = process.stderr.write.bind(process.stderr);

type StderrWriteCallback = (error?: Error | null) => void;

const isBundlingProgressMessage = (chunk: unknown): boolean => {
  const message =
    typeof chunk === "string" ? chunk : Buffer.isBuffer(chunk) ? chunk.toString("utf8") : "";

  return /^Bundling asset .+\.\.\.\n$/.test(message);
};

const getWriteCallback = (
  encodingOrCallback?: BufferEncoding | StderrWriteCallback,
  callback?: StderrWriteCallback,
): StderrWriteCallback | undefined => {
  return typeof encodingOrCallback === "function" ? encodingOrCallback : callback;
};

process.stderr.write = ((
  chunk: string | Uint8Array,
  encodingOrCallback?: BufferEncoding | StderrWriteCallback,
  callback?: StderrWriteCallback,
): boolean => {
  if (isBundlingProgressMessage(chunk)) {
    getWriteCallback(encodingOrCallback, callback)?.();
    return true;
  }

  if (typeof encodingOrCallback === "function") {
    return originalStderrWrite(chunk, encodingOrCallback);
  }

  return originalStderrWrite(chunk, encodingOrCallback, callback);
}) as typeof process.stderr.write;
