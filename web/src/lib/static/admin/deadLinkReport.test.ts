import {
  countByCategory,
  formatCategorySummary,
  formatLinkStatus,
  generateDeadLinksCsv,
  REPORT_BASE_URL,
} from "@/lib/static/admin/deadLinkReport";
import { ContentDeadLink, FoundUrl } from "@/lib/static/admin/findDeadLinks";

const deadUrl = (overrides: Partial<FoundUrl> = {}): FoundUrl => ({
  url: "https://gone.example.com",
  field: "body",
  context: "see https://gone.example.com",
  statusCode: 404,
  statusText: "Not Found",
  category: "dead",
  ...overrides,
});

const contentItem = (overrides: Partial<ContentDeadLink> = {}): ContentDeadLink => ({
  file: "/content/src/roadmaps/tasks/task1.md",
  slug: "task1",
  displayName: "Task One",
  collection: "Tasks",
  cmsEditUrl: "/mgmt/cms#/collections/tasks/entries/task1",
  pageUrl: "/tasks/task1",
  deadUrls: [deadUrl()],
  ...overrides,
});

const csvLines = (csv: string): string[] => csv.replace(/^\uFEFF/, "").split("\r\n");

describe("formatLinkStatus", () => {
  it("prefixes the status code when there is one", () => {
    expect(formatLinkStatus(deadUrl())).toBe("404 Not Found");
  });

  it("uses the status text alone for connection failures", () => {
    expect(
      formatLinkStatus(deadUrl({ statusCode: null, statusText: "Connection Failed (ENOTFOUND)" })),
    ).toBe("Connection Failed (ENOTFOUND)");
  });
});

describe("countByCategory", () => {
  it("counts dead URLs in each category across content items", () => {
    const results = [
      contentItem({ deadUrls: [deadUrl(), deadUrl({ category: "inconclusive" })] }),
      contentItem({ deadUrls: [deadUrl(), deadUrl({ category: "httpsOnly" })] }),
    ];

    expect(countByCategory(results)).toEqual({
      dead: 2,
      httpsOnly: 1,
      serverError: 0,
      inconclusive: 1,
    });
  });
});

describe("formatCategorySummary", () => {
  it("lists each category with its count, most actionable first", () => {
    const results = [contentItem({ deadUrls: [deadUrl(), deadUrl({ category: "inconclusive" })] })];

    expect(formatCategorySummary(results)).toBe(
      "Dead: 1 · Works over https only: 0 · Server error: 0 · Inconclusive: 1",
    );
  });
});

describe("generateDeadLinksCsv", () => {
  it("starts with a byte order mark so spreadsheet apps read it as UTF-8", () => {
    expect(generateDeadLinksCsv([contentItem()]).startsWith("\uFEFF")).toBe(true);
  });

  it("writes a header row and one row per dead URL", () => {
    const csv = generateDeadLinksCsv([
      contentItem({ deadUrls: [deadUrl(), deadUrl({ url: "https://other.example.com" })] }),
    ]);

    const lines = csvLines(csv);
    expect(lines[0]).toBe(
      '"Category","Collection","Content Item","Slug","URL","Status","Field","Context","CMS Edit URL","Page URL"',
    );
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe(
      [
        "Dead",
        "Tasks",
        "Task One",
        "task1",
        "https://gone.example.com",
        "404 Not Found",
        "body",
        "see https://gone.example.com",
        `${REPORT_BASE_URL}/mgmt/cms#/collections/tasks/entries/task1`,
        `${REPORT_BASE_URL}/tasks/task1`,
      ]
        .map((value) => `"${value}"`)
        .join(","),
    );
  });

  it("escapes quotes and keeps commas and line breaks inside a field", () => {
    const csv = generateDeadLinksCsv([
      contentItem({ deadUrls: [deadUrl({ context: 'say "hi",\nthen leave' })] }),
    ]);

    expect(csv).toContain('"say ""hi"",\nthen leave"');
  });

  it("leaves link columns empty when an item has no CMS or page URL", () => {
    const csv = generateDeadLinksCsv([contentItem({ cmsEditUrl: "", pageUrl: "" })]);

    expect(csvLines(csv)[1].endsWith(',"",""')).toBe(true);
  });
});
