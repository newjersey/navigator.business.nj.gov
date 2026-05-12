import { describe, expect, it } from "vitest";
import { hasSameStructure } from "@/domain/i18n/messages";

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
});
