import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import cspellConfig from "../../cspell.json";

fs.writeFileSync(
  "test/cspell.json",
  JSON.stringify(
    {
      ...cspellConfig,
      import: ["../src/spellcheck-exceptions.json"],
      ignorePaths: [],
    },
    null,
    2,
  ),
  "utf8",
);

const runCspell = (filePath: string) => {
  const result = spawnSync("npx", ["cspell", "--file", filePath, "--config", "./test/cspell.json"]);

  return {
    status: result.status, // 0 = success, non-zero = spelling issues / errors
    combined: `${result.stdout || ""}\n${result.stderr || ""}`,
  };
};

describe("CSpell overrides", () => {
  it("does not flag wrapped URLs", () => {
    const result = runCspell("test/wrapped-url.md");

    expect(result.status, result.combined).toBe(0);
  });

  it("does not flag misspellings in `notesMd` front-matter prop", () => {
    const result = runCspell("test/notes-md-misspellings.md");

    expect(result.status, result.combined).toBe(0);
  });

  it("flags misspellings in front-matter props that are not `notesMd`", () => {
    const result = runCspell("test/another-prop-misspellings.md");

    expect(result.status, result.combined).toBe(1);
  });
});
