/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import { backfill, insertAgencyWebsiteLine } from "./licenseDepartmentWebsitePull";

jest.mock("./methods", () => ({
  getAllItems: jest.fn().mockResolvedValue([]),
}));

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue([]),
  readFileSync: jest.fn().mockReturnValue(""),
  writeFileSync: jest.fn(),
}));

const mockedFs = jest.mocked(fs);

const fileWithFrontmatter = (frontmatter: string, body = "\nBody text.\n"): string =>
  `---\n${frontmatter}\n---${body}`;

describe("insertAgencyWebsiteLine", () => {
  it("adds agencyWebsite as the last frontmatter line, leaving other lines byte-identical", () => {
    const raw = fileWithFrontmatter("id: adoption-agency\nwebflowId: abc123");

    const result = insertAgencyWebsiteLine(raw, "https://www.nj.gov/njfosteradopt/");

    expect(result).toBe(
      fileWithFrontmatter(
        'id: adoption-agency\nwebflowId: abc123\nagencyWebsite: "https://www.nj.gov/njfosteradopt/"',
      ),
    );
  });

  it("uses double quotes, matching the committed content style", () => {
    const raw = fileWithFrontmatter("id: x");

    const result = insertAgencyWebsiteLine(raw, "https://example.gov/");

    expect(result).toContain('agencyWebsite: "https://example.gov/"');
  });

  it("escapes embedded double quotes and backslashes so the YAML stays valid", () => {
    const raw = fileWithFrontmatter("id: x");

    const result = insertAgencyWebsiteLine(raw, 'https://example.gov/a"b\\c');

    expect(result).toContain('agencyWebsite: "https://example.gov/a\\"b\\\\c"');
  });

  it("returns undefined when the file has no frontmatter fence", () => {
    expect(
      insertAgencyWebsiteLine("Just a body, no frontmatter.\n", "https://x.gov/"),
    ).toBeUndefined();
  });
});

describe("backfill", () => {
  const websitesByWebflowId = new Map<string, string>([
    ["wf-agriculture", "https://www.nj.gov/agriculture/"],
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(true);
  });

  const runWith = (files: Record<string, string>): ReturnType<typeof backfill> => {
    mockedFs.readdirSync.mockReturnValue(Object.keys(files) as any);
    mockedFs.readFileSync.mockImplementation((filePath) => {
      const fileName = String(filePath).split("/").pop() as string;
      return files[fileName];
    });
    return backfill(websitesByWebflowId, ["/content/webflow-licenses"]);
  };

  it("writes the agencyWebsite line for a file whose webflowId has a website", () => {
    const result = runWith({
      "animal-dealer.md": fileWithFrontmatter("id: animal-dealer\nwebflowId: wf-agriculture"),
    });

    expect(result.updated).toBe(1);
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("animal-dealer.md"),
      expect.stringContaining('agencyWebsite: "https://www.nj.gov/agriculture/"'),
    );
  });

  it("skips a file that already has an agencyWebsite, leaving it untouched", () => {
    const result = runWith({
      "already.md": fileWithFrontmatter(
        'id: already\nwebflowId: wf-agriculture\nagencyWebsite: "https://existing.gov/"',
      ),
    });

    expect(result.alreadyPresent).toBe(1);
    expect(result.updated).toBe(0);
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("counts a file with no webflowId separately from one that matched no website", () => {
    const result = runWith({
      "no-id.md": fileWithFrontmatter("id: no-id"),
      "unmatched.md": fileWithFrontmatter("id: unmatched\nwebflowId: wf-unknown"),
    });

    expect(result.noWebflowId).toBe(1);
    expect(result.noWebsite).toBe(1);
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("counts a matched file whose fence the line inserter can't parse without writing it", () => {
    // gray-matter parses a CRLF fence, so the file yields a real webflowId, but the
    // LF-only insert regex rejects it — the guarded path that increments noFence.
    mockedFs.readdirSync.mockReturnValue(["crlf.md"] as any);
    mockedFs.readFileSync.mockReturnValue("---\r\nwebflowId: wf-agriculture\r\n---\r\nbody");

    const result = backfill(websitesByWebflowId, ["/content/webflow-licenses"]);

    expect(result.noFence).toBe(1);
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("skips a directory that does not exist", () => {
    mockedFs.existsSync.mockReturnValue(false);

    const result = backfill(websitesByWebflowId, ["/missing"]);

    expect(result).toEqual({
      updated: 0,
      alreadyPresent: 0,
      noWebflowId: 0,
      noWebsite: 0,
      noFence: 0,
    });
  });

  it("only reads .md files", () => {
    mockedFs.readdirSync.mockReturnValue(["keep.md", "ignore.txt", "notes"] as any);
    mockedFs.readFileSync.mockReturnValue(
      fileWithFrontmatter("id: keep\nwebflowId: wf-agriculture"),
    );

    backfill(websitesByWebflowId, ["/content/webflow-licenses"]);

    const readPaths = mockedFs.readFileSync.mock.calls.map((c) => String(c[0]));
    expect(readPaths.some((p) => p.endsWith("ignore.txt"))).toBe(false);
    expect(readPaths.some((p) => p.endsWith("notes"))).toBe(false);
    expect(readPaths.some((p) => p.endsWith("keep.md"))).toBe(true);
  });
});
