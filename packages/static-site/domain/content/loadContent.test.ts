import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateAnytimeActionLicenseReinstatement,
  generateAnytimeActionTask,
  generateIndustry,
} from "@/tests/factories";
import { loadIndustries, loadRecents, loadStaticSiteAnytimeActionLicenses } from "./loadContent";
import type { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "./types";

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

const mockAnytimeActionContent = (
  actions: AnytimeActionTask[],
  licenseReinstatements: AnytimeActionLicenseReinstatement[],
): void => {
  vi.spyOn(fs, "readFileSync").mockImplementation((filePath) =>
    String(filePath).endsWith("license-reinstatements.json")
      ? JSON.stringify({ licenseReinstatements })
      : JSON.stringify({ actions }),
  );
};

describe("loadStaticSiteAnytimeActionLicenses", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps only tasks and reinstatements flagged displayOnStaticSite", () => {
    const shownTask = generateAnytimeActionTask({ displayOnStaticSite: true });
    const shownReinstatement = generateAnytimeActionLicenseReinstatement({
      displayOnStaticSite: true,
    });
    mockAnytimeActionContent(
      [
        shownTask,
        generateAnytimeActionTask({ displayOnStaticSite: false }),
        generateAnytimeActionTask(),
      ],
      [shownReinstatement, generateAnytimeActionLicenseReinstatement()],
    );

    const licenses = loadStaticSiteAnytimeActionLicenses();

    expect(licenses.map((license) => license.urlSlug)).toEqual([
      shownTask.urlSlug,
      shownReinstatement.urlSlug,
    ]);
  });

  it("maps card fields, using issuingAgency as the agency", () => {
    const task = generateAnytimeActionTask({ displayOnStaticSite: true });
    mockAnytimeActionContent([task], []);

    expect(loadStaticSiteAnytimeActionLicenses()).toEqual([
      {
        name: task.name,
        urlSlug: task.urlSlug,
        summaryDescriptionMd: task.summaryDescriptionMd,
        agency: task.issuingAgency,
        callToActionText: task.callToActionText,
        callToActionLink: task.callToActionLink,
      },
    ]);
  });

  it("prefers staticSiteName over name for the card title", () => {
    const task = generateAnytimeActionTask({
      displayOnStaticSite: true,
      staticSiteName: "Static Site Name",
    });
    mockAnytimeActionContent([task], []);

    expect(loadStaticSiteAnytimeActionLicenses()[0].name).toBe(task.staticSiteName);
  });

  it("falls back to name when staticSiteName is blank", () => {
    const task = generateAnytimeActionTask({ displayOnStaticSite: true, staticSiteName: "" });
    mockAnytimeActionContent([task], []);

    expect(loadStaticSiteAnytimeActionLicenses()[0].name).toBe(task.name);
  });
});
