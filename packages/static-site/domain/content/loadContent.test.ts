import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateIndustry } from "@/tests/factories";
import { loadIndustries } from "./loadContent";

const enabledIndustry1 = generateIndustry({ isEnabled: true });
const disabledIndustry = generateIndustry({ isEnabled: false });
const enabledIndustry2 = generateIndustry({ isEnabled: true });

const mockIndustryData = JSON.stringify({
  industries: [enabledIndustry1, disabledIndustry, enabledIndustry2],
});

describe("loadIndustries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not return industries where isEnabled is false", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(mockIndustryData);

    const industries = loadIndustries();

    for (const industry of industries) {
      expect(industry.isEnabled).toBe(true);
    }
  });

  it("filters out disabled industries", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(mockIndustryData);

    const industries = loadIndustries();

    expect(industries).toHaveLength(2);
    expect(industries.map((i) => i.id)).toEqual([enabledIndustry1.id, enabledIndustry2.id]);
  });
});
