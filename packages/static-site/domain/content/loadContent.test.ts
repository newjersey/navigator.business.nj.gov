import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateIndustry } from "@/tests/factories";
import { loadIndustries, loadRecents } from "./loadContent";

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

const recentMarkdown = (slug: string, status?: string): string => {
  const frontmatter = [
    "---",
    `name: Recent ${slug}`,
    `slug: ${slug}`,
    ...(status ? [`status: ${status}`] : []),
    "---",
    "Body content",
  ];
  return frontmatter.join("\n");
};

describe("loadRecents", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("only returns recents with status Published", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readdirSync").mockReturnValue([
      "published.md",
      "draft.md",
      "archived.md",
    ] as unknown as ReturnType<typeof fs.readdirSync>);
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath) => {
      const fileName = filePath.toString();
      if (fileName.endsWith("published.md")) return recentMarkdown("published", "Published");
      if (fileName.endsWith("draft.md")) return recentMarkdown("draft", "Draft");
      if (fileName.endsWith("archived.md")) return recentMarkdown("archived", "Archived");
      throw new Error(`Unexpected file read: ${fileName}`);
    });

    const recents = loadRecents();

    expect(recents).toHaveLength(1);
    expect(recents[0].slug).toBe("published");
  });

  it("excludes recents with no status set", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readdirSync").mockReturnValue(["no-status.md"] as unknown as ReturnType<
      typeof fs.readdirSync
    >);
    vi.spyOn(fs, "readFileSync").mockReturnValue(recentMarkdown("no-status"));

    const recents = loadRecents();

    expect(recents).toHaveLength(0);
  });
});
