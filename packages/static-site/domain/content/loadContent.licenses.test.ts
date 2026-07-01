import { describe, expect, it } from "vitest";
import { loadLicenses } from "./loadContent";

describe("loadLicenses", () => {
  it("loads the deduped license set", () => {
    const licenses = loadLicenses();
    expect(licenses.length).toBe(551);
    expect(licenses.every((l) => typeof l.name === "string")).toBe(true);
  });
});
