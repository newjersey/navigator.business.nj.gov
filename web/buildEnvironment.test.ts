import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvConfig } from "@next/env";
import { serializeWebBuildEnvironment, webBuildEnvironmentVariableNames } from "./buildEnvironment";

// Loads a serialized ".env.production" string through Next's actual build-time dotenv loader
// (parse + dotenv-expand), the same code path `next build` runs, so these tests catch corruption
// that a literal-string assertion against the serializer's own output cannot.
//
// `@next/env` only reads ".env.production" when it thinks it is loading the production phase.
// It bases that on `process.env.NODE_ENV`, which Jest sets to "test" by default, and it caches its
// first-ever snapshot of `process.env` (including NODE_ENV) for the life of the module. Force
// NODE_ENV to "production" before this file's first `loadEnvConfig` call so every call in this
// file resolves the same file-name precedence Next's real production build uses.
(process.env as { NODE_ENV: string }).NODE_ENV = "production";

const loadThroughNextEnv = (serialized: string): Record<string, string | undefined> => {
  const dir = mkdtempSync(join(tmpdir(), "web-build-environment-test-"));
  try {
    writeFileSync(join(dir, ".env.production"), serialized);
    const { combinedEnv } = loadEnvConfig(dir, false, { info: () => {}, error: () => {} }, true);
    return combinedEnv;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

describe("serializeWebBuildEnvironment", () => {
  it("serializes only allowlisted, defined variables", () => {
    expect(
      serializeWebBuildEnvironment({
        API_BASE_URL: "https://api.example.com",
        NOT_ALLOWLISTED: "do-not-include",
        STAGE: undefined,
      }),
    ).toBe('API_BASE_URL="https://api.example.com"\n');
  });

  it("keeps the allowlist unique", () => {
    expect(new Set(webBuildEnvironmentVariableNames).size).toBe(
      webBuildEnvironmentVariableNames.length,
    );
  });

  describe("round-tripping through Next's real dotenv loader", () => {
    it.each([
      ["a plain value", "https://api.example.com"],
      ["a hash character", "value # not a comment"],
      ["a dollar sign that would otherwise be interpolated", "p@ss$word"],
      ["a variable-looking sequence that would otherwise be expanded", "p@ss${HOME}word"],
      ["a bare dollar sign at the end of the value", "trailing$"],
      ["a newline", "line one\nline two"],
      ["a carriage return and newline", "line one\r\nline two"],
      ["an empty string", ""],
    ])("preserves %s (%p) byte-for-byte", (_description, originalValue) => {
      const serialized = serializeWebBuildEnvironment({ BASIC_AUTH_PASSWORD: originalValue });
      const loaded = loadThroughNextEnv(serialized);

      expect(loaded.BASIC_AUTH_PASSWORD).toBe(originalValue);
    });
  });

  describe("values Next's dotenv loader cannot represent safely", () => {
    it.each([
      ["a double quote", 'quotes " inside'],
      ["a backslash", "back\\slash"],
    ])("rejects a value containing %s instead of silently corrupting it", (_description, value) => {
      expect(() => serializeWebBuildEnvironment({ BASIC_AUTH_PASSWORD: value })).toThrow(
        /BASIC_AUTH_PASSWORD.*double quote or backslash/,
      );
    });
  });
});
