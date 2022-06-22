import { toProperCase } from "./stringHelpers";

describe("stringHelpers", () => {
  describe("toProperCase", () => {
    it("returns undefined when undefined is passed in", () => {
      const value = undefined;
      expect(toProperCase(value)).toBeUndefined();
    });

    it("converts lower case to proper case", () => {
      expect(toProperCase("lower case")).toEqual("Lower Case");
    });

    it("converts uper case to proper case", () => {
      expect(toProperCase("UPPER CASE")).toEqual("Upper Case");
    });
  });
});
