import matter from "gray-matter";
import {
  orderKeysBySortedKeys,
  recentsFrontmatterFormat,
} from "@/lib/cms/formatters/recentsFrontmatterFormat";

describe("recentsFrontmatterFormat", () => {
  describe("toFile", () => {
    it("quotes a date-like string so it round-trips as a string, not a Date", () => {
      const file = recentsFrontmatterFormat.toFile({
        name: "Test Recent",
        slug: "test-recent",
        date: "2025-09-03",
      });

      // js-yaml quotes the value (style may be single or double) precisely
      // because it would otherwise resolve to a timestamp; that quoting is
      // the fix for AB#17994.
      expect(file).toMatch(/date: ["']2025-09-03["']/);

      // Read the output back with the exact parser the site's build-time
      // content loader uses (`loadAllRecents`), to guard against the bug
      // this formatter exists to prevent.
      const { data } = matter(file);
      expect(typeof data.date).toBe("string");
      expect(data.date).not.toBeInstanceOf(Date);
      expect(data.date).toEqual("2025-09-03");
    });

    it("preserves the Markdown body", () => {
      const file = recentsFrontmatterFormat.toFile({
        name: "Test Recent",
        slug: "test-recent",
        body: "Some article body text.",
      });

      const { content } = matter(file);
      expect(content.trim()).toEqual("Some article body text.");
    });

    it("does not wrap long values onto a YAML block scalar", () => {
      const longUrl =
        "https://www.njeda.gov/some-really-long-url-path-that-would-normally-wrap-in-yaml-output-if-not-configured/";

      const file = recentsFrontmatterFormat.toFile({
        name: "Test Recent",
        slug: "test-recent",
        source: longUrl,
      });

      const { data } = matter(file);
      expect(data.source).toEqual(longUrl);
      // Without `lineWidth: -1`, js-yaml folds long scalars onto a `>-`
      // block instead of keeping them on the `key: value` line.
      expect(file).not.toContain(">-");
      expect(file).toContain(`source: '${longUrl}'`);
    });

    it("orders frontmatter keys by sortedKeys, leaving unlisted keys in their original position", () => {
      const file = recentsFrontmatterFormat.toFile(
        {
          webflowId: "abc123",
          name: "Test Recent",
          date: "2025-09-03",
          slug: "test-recent",
        },
        ["name", "slug", "date"],
      );

      const { data } = matter(file);
      // webflowId isn't in sortedKeys, so it stays in its original (first)
      // position; name/date/slug are reordered relative to each other to
      // match sortedKeys.
      expect(Object.keys(data)).toEqual(["webflowId", "name", "slug", "date"]);
    });

    it("round-trips fromFile -> toFile -> fromFile without accumulating blank lines", () => {
      const original = [
        "---",
        "name: Test Recent",
        "slug: test-recent",
        "---",
        "",
        "Body content.",
        "",
      ].join("\n");

      const parsed = recentsFrontmatterFormat.fromFile(original) as Record<string, unknown>;
      const written = recentsFrontmatterFormat.toFile(parsed);
      expect(written).toEqual(original);

      const parsedAgain = recentsFrontmatterFormat.fromFile(written);
      expect(parsedAgain).toEqual(parsed);
    });
  });

  describe("fromFile", () => {
    it("parses a quoted date as a string", () => {
      const content = ["---", "name: Test Recent", 'date: "2025-09-03"', "---", ""].join("\n");

      const data = recentsFrontmatterFormat.fromFile(content) as { date: unknown };
      expect(typeof data.date).toBe("string");
      expect(data.date).toEqual("2025-09-03");
    });

    it("includes the Markdown body under `body`", () => {
      const content = ["---", "name: Test Recent", "---", "", "Body content.", ""].join("\n");

      const data = recentsFrontmatterFormat.fromFile(content) as { body: string };
      expect(data.body.trim()).toEqual("Body content.");
    });

    it("omits `body` when the file has no content after the frontmatter", () => {
      const content = ["---", "name: Test Recent", "---", ""].join("\n");

      const data = recentsFrontmatterFormat.fromFile(content) as Record<string, unknown>;
      expect("body" in data).toBe(false);
    });
  });
});

describe("orderKeysBySortedKeys", () => {
  it("orders listed keys according to sortedKeys", () => {
    expect(orderKeysBySortedKeys(["b", "a", "c"], ["a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("leaves keys not present in sortedKeys in their original relative position", () => {
    expect(orderKeysBySortedKeys(["z", "a", "y", "b"], ["a", "b"])).toEqual(["z", "a", "y", "b"]);
  });
});
