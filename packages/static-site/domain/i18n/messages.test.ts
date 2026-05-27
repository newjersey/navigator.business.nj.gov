/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: Not adhering for test file */
import { describe, expect, it } from "vitest";
import { collectStructureDiffs, hasSameStructure } from "@/domain/i18n/messages";

describe("messages", () => {
  describe("hasSameStructure", () => {
    it("returns false when 'base' has a nested key that 'other' is missing", () => {
      const base = {
        key1: "value1",
        key2: {
          child1: true,
          child2: false,
        },
      };

      const other = {
        key1: "value2",
        key2: {
          child1: false,
        },
      };

      expect(hasSameStructure(base, other)).toBe(false);
    });

    it("returns false when 'other' has an extra nested key not present on 'base'", () => {
      const base = {
        key1: "value1",
        key2: {
          child1: true,
          child2: false,
        },
      };

      const other = {
        key1: "value2",
        key2: {
          child1: false,
          child2: true,
          child3: "I AM EXTRA",
        },
      };

      expect(hasSameStructure(base, other)).toBe(false);
    });

    it("returns false when other is missing array entries", () => {
      const base = {
        array: [
          {
            key1: "value1",
            key2: "value2",
          },
        ],
      };

      const other = {
        array: [],
      };

      expect(hasSameStructure(base, other)).toBe(false);
    });

    it("returns false when one has extra array entries", () => {
      const base = {
        array: [
          {
            key1: "value1",
            key2: "value2",
          },
        ],
      };

      const other = {
        array: [
          {
            key1: "value1",
            key2: "value2",
          },
          {
            key1: "value3",
            key2: "value4",
          },
        ],
      };

      expect(hasSameStructure(base, other)).toBe(false);
    });

    it("returns false if array entries do not match structure", () => {
      const base = {
        array: [
          {
            key1: "value1",
            key2: "value2",
          },
          {
            key1: "value3",
            key2: "value4",
          },
        ],
      };

      const other = {
        array: [
          {
            key1: "value1",
            key2: "value2",
          },
          {
            key1: "value3",
          },
        ],
      };

      expect(hasSameStructure(base, other)).toBe(false);
    });

    it("returns true when nested object and array structure exactly matches the base", () => {
      const base = {
        key1: "value1",
        nested: {
          child: false,
        },
        array: [
          {
            key1: "value1",
            key2: "value2",
          },
          {
            key1: "value3",
            key2: "value4",
          },
        ],
      };

      const other = {
        key1: "value2",
        nested: {
          child: true,
        },
        array: [
          {
            key1: "value1",
            key2: "value2",
          },
          {
            key1: "value3",
            key2: "value4",
          },
        ],
      };

      expect(hasSameStructure(base, other)).toBe(true);
    });
  });

  describe("collectStructureDiffs", () => {
    it("returns empty array when structures match", () => {
      const base = { key1: "a", nested: { child: true } };
      const other = { key1: "b", nested: { child: false } };

      expect(collectStructureDiffs({ base, other })).toEqual([]);
    });

    it("reports missing keys with their path", () => {
      const base = { key1: "a", key2: { child1: true, child2: false } };
      const other = { key1: "b", key2: { child1: true } };

      const diffs = collectStructureDiffs({ base, other });

      expect(diffs).toContain("key2.child2: missing in other locale");
    });

    it("reports extra keys with their path", () => {
      const base = { key1: "a" };
      const other = { key1: "b", extra: "c" };

      const diffs = collectStructureDiffs({ base, other });

      expect(diffs).toContain("extra: extra key not in base locale");
    });

    it("reports array length mismatches", () => {
      const base = { items: [{ a: "1" }, { a: "2" }] };
      const other = { items: [{ a: "1" }] };

      const diffs = collectStructureDiffs({ base, other });

      expect(diffs).toContain("items: array length mismatch (base: 2, other: 1)");
    });

    it("reports type mismatches at the correct path", () => {
      const base = { key1: "string", key2: { child: 42 } };
      const other = { key1: "string", key2: { child: "not a number" } };

      const diffs = collectStructureDiffs({ base, other });

      expect(diffs).toContain("key2.child: type mismatch (base: number, other: string)");
    });

    it("reports when other is not an array where base has one", () => {
      const base = { items: [1, 2] };
      const other = { items: "not an array" };

      const diffs = collectStructureDiffs({ base, other });

      expect(diffs).toContain("items: expected array, got string");
    });

    it("reports when other is not an object where base has one", () => {
      const base = { nested: { child: true } };
      const other = { nested: "flat" };

      const diffs = collectStructureDiffs({ base, other });

      expect(diffs).toContain("nested: expected object, got string");
    });

    it("reports structural mismatches within array elements", () => {
      const base = { items: [{ a: "1", b: "2" }] };
      const other = { items: [{ a: "1" }] };

      const diffs = collectStructureDiffs({ base, other });

      expect(diffs).toContain("items[0].b: missing in other locale");
    });

    it("includes path prefix when provided", () => {
      const base = { child: "a" };
      const other = {};

      const diffs = collectStructureDiffs({ base, other, path: "root" });

      expect(diffs).toContain("root.child: missing in other locale");
    });
  });
});
