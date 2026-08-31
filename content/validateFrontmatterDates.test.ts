import { describe, expect, it } from "vitest";
import {
  createMarkdownFileSystemPort,
  findDatePaths,
  formatFrontmatterDateViolationsMessage,
  type MarkdownFileSystemPort,
  validateNoDateObjectsInFrontmatter,
} from "./validateFrontmatterDates";

const createMockFileSystem = (files: Record<string, string>): MarkdownFileSystemPort => ({
  listMarkdownFiles: () => Object.keys(files),
  readFile: (filePath: string) => files[filePath],
});

describe("findDatePaths", () => {
  it("returns an empty array for primitives and strings", () => {
    expect(findDatePaths("2025-09-03")).toEqual([]);
    expect(findDatePaths(5)).toEqual([]);
    expect(findDatePaths(true)).toEqual([]);
    expect(findDatePaths(null)).toEqual([]);
    expect(findDatePaths(undefined)).toEqual([]);
  });

  it("finds a Date at the root", () => {
    expect(findDatePaths(new Date("2025-09-03"))).toEqual(["(root)"]);
  });

  it("finds a Date on a top-level object property", () => {
    expect(findDatePaths({ name: "Test", date: new Date("2025-09-03") })).toEqual(["date"]);
  });

  it("finds a Date nested inside an object", () => {
    expect(findDatePaths({ meta: { date: new Date("2025-09-03") } })).toEqual(["meta.date"]);
  });

  it("finds a Date nested inside an array, with an index in the path", () => {
    expect(findDatePaths({ recents: [{ date: new Date("2025-09-03") }] })).toEqual([
      "recents[0].date",
    ]);
  });

  it("finds multiple Date values across a structure", () => {
    expect(
      findDatePaths({
        date: new Date("2025-09-03"),
        items: [{ openDate: new Date("2025-01-01") }, { name: "no date here" }],
      }),
    ).toEqual(["date", "items[0].openDate"]);
  });

  it("does not flag a quoted date string", () => {
    expect(findDatePaths({ date: "2025-09-03" })).toEqual([]);
  });
});

describe("validateNoDateObjectsInFrontmatter", () => {
  it("does not throw when every file's frontmatter is Date-free", () => {
    const fileSystem = createMockFileSystem({
      "/content/src/recents/a.md": '---\nname: A\ndate: "2025-09-03"\n---\nBody.',
      "/content/src/recents/b.md": "---\nname: B\n---\nBody.",
    });

    expect(() => validateNoDateObjectsInFrontmatter("/content/src", fileSystem)).not.toThrow();
  });

  it("throws with the file path and key path when a date is unquoted", () => {
    const fileSystem = createMockFileSystem({
      "/content/src/recents/a.md": '---\nname: A\ndate: "2025-09-03"\n---\nBody.',
      "/content/src/recents/b.md": "---\nname: B\ndate: 2025-09-03\n---\nBody.",
    });

    expect(() => validateNoDateObjectsInFrontmatter("/content/src", fileSystem)).toThrowError(
      /\/content\/src\/recents\/b\.md: date/,
    );
  });

  it("aggregates every violation across every file into a single error", () => {
    const fileSystem = createMockFileSystem({
      "/content/src/recents/a.md": "---\nname: A\ndate: 2025-09-03\n---\nBody.",
      "/content/src/recents/b.md": "---\nname: B\ndate: 2025-12-17\n---\nBody.",
    });

    try {
      validateNoDateObjectsInFrontmatter("/content/src", fileSystem);
      throw new Error("expected validateNoDateObjectsInFrontmatter to throw");
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain("/content/src/recents/a.md: date");
      expect(message).toContain("/content/src/recents/b.md: date");
      expect(message).toContain("Found 2 unquoted date-like value(s)");
    }
  });
});

describe("formatFrontmatterDateViolationsMessage", () => {
  it("includes guidance to quote the value", () => {
    const message = formatFrontmatterDateViolationsMessage([
      { filePath: "/content/src/recents/a.md", keyPath: "date" },
    ]);

    expect(message).toContain('date: "2025-09-03"');
    expect(message).toContain("/content/src/recents/a.md: date");
  });
});

describe("createMarkdownFileSystemPort", () => {
  it("finds Markdown files recursively and can read their contents", () => {
    const fileSystem = createMarkdownFileSystemPort();

    const files = fileSystem.listMarkdownFiles(`${__dirname}/src/recents`);

    expect(files.length).toBeGreaterThan(0);
    expect(files.every((filePath) => filePath.endsWith(".md"))).toBe(true);
    expect(fileSystem.readFile(files[0])).toContain("---");
  });

  it("returns an empty array for a directory that doesn't exist", () => {
    const fileSystem = createMarkdownFileSystemPort();

    expect(fileSystem.listMarkdownFiles(`${__dirname}/src/does-not-exist`)).toEqual([]);
  });
});
