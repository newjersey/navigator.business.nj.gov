import { orderBy } from "lodash";
import industryJson from "../../content/lib/industry.json";
import { getIndustries, Industry, isIndustryIdGeneric, LookupIndustryById } from "./industry";

describe("Industry Tests", () => {
  it("has industry records", () => {
    expect(getIndustries().length).toBeGreaterThan(0);
  });

  describe.each(getIndustries())("$name", (industry) => {
    it("has an id", () => {
      expect(industry.id.length).toBeGreaterThan(0);
    });

    it("has a name", () => {
      expect(industry.name.length).toBeGreaterThan(0);
    });

    it("has a description", () => {
      expect(industry.description.length).toBeGreaterThan(0);
    });
  });

  it("getIndustries returns industries in order by name", () => {
    const orderdIndustries = orderBy(
      industryJson.industries as Industry[],
      [isIndustryIdGeneric, "name"],
      ["desc", "asc"]
    ).filter((x: Industry) => {
      return x.isEnabled;
    });

    expect(getIndustries()).toEqual(orderdIndustries);
  });

  describe("when SHOW_DISABLED_INDUSTRIES is 'false'", () => {
    const originalEnvironment = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnvironment,
        SHOW_DISABLED_INDUSTRIES: "false",
      };
    });

    afterEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnvironment,
      };
    });

    it("getIndustries only contains 'enabled' industries", () => {
      const filteredOrderdIndustries = orderBy(
        industryJson.industries as Industry[],
        [isIndustryIdGeneric, "name"],
        ["desc", "asc"]
      ).filter((x: Industry) => {
        return x.isEnabled;
      });

      expect(getIndustries()).toEqual(filteredOrderdIndustries);
    });
  });

  describe("when SHOW_DISABLED_INDUSTRIES is 'true'", () => {
    const originalEnvironment = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnvironment,
        SHOW_DISABLED_INDUSTRIES: "true",
      };
    });

    afterEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnvironment,
      };
    });

    it("getIndustries contains all industries", () => {
      const orderdIndustries = orderBy(
        industryJson.industries as Industry[],
        [isIndustryIdGeneric, "name"],
        ["desc", "asc"]
      );

      expect(getIndustries()).toEqual(orderdIndustries);
    });
  });

  it("getIndustries returns all industries when overrideShowDisabledIndustries is true", () => {
    const orderdIndustries = orderBy(
      industryJson.industries as Industry[],
      [isIndustryIdGeneric, "name"],
      ["desc", "asc"]
    );

    expect(getIndustries({ overrideShowDisabledIndustries: true })).toEqual(orderdIndustries);
  });

  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupIndustryById("bob")?.id).toBe("");
    });

    it("returns industry record when a valid id is supplied", () => {
      expect(LookupIndustryById("restaurant")?.id).toEqual("restaurant");
    });
  });

  describe("isIndustryIdGeneric", () => {
    it("returns true for generic industry", () => {
      expect(isIndustryIdGeneric(LookupIndustryById("generic"))).toBe(true);
    });

    it("returns false for non-generic industry", () => {
      expect(isIndustryIdGeneric(LookupIndustryById("restaurant"))).toBe(false);
    });
  });

  describe("dev industry", () => {
    it("should always be disabled", () => {
      expect(LookupIndustryById("demo-only").isEnabled).toBe(false);
    });
  });
});
