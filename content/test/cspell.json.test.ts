import { describe, expect, it } from "vitest";
const { spawnSync } = require("node:child_process");

const fs = require("node:fs");

const cspellConfig = require("../../cspell.json");

fs.writeFileSync(
  "test/cspell.json",
  JSON.stringify(
    {
      ...cspellConfig,
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

    console.log(result);
    expect(result.status).toBe(0);
  });

  it("does not flag misspellings in `notesMd` front-matter prop", () => {
    const result = runCspell("test/notes-md-misspellings.md");

    console.log(result);
    expect(result.status).toBe(0);
  });

  it("flags misspellings in front-matter props that are not `notesMd`", () => {
    const result = runCspell("test/another-prop-misspellings.md");

    console.log(result);
    expect(result.status).toBe(1);
  });
});
