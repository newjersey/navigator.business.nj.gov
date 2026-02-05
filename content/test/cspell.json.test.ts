import { describe, expect, it } from "vitest";

const { spawnSync } = require("node:child_process");

const runCspell = (filePath: string) => {
  const result = spawnSync("npx", ["cspell", "--file", filePath, "--config", "../cspell.json"]);

  return {
    status: result.status, // 0 = success, non-zero = spelling issues / errors
    combined: `${result.stdout || ""}\n${result.stderr || ""}`,
  };
};

describe("CSpell overrides", () => {
  it("does not flag wrapped URLs", () => {
    const result = runCspell("test/broken-url.md");

    console.log(result);
    expect(result.status).toBe(0);
  });
});
