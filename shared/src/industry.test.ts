import { orderBy } from "lodash";
import industryJson from "../../content/lib/industry.json";
import {
  findIndustryByNaicsCode,
  getIndustries,
  Industry,
  isIndustryIdGeneric,
  LookupIndustryById,
} from "./industry";

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
      ["desc", "asc"],
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
        ["desc", "asc"],
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
        ["desc", "asc"],
      );

      expect(getIndustries()).toEqual(orderdIndustries);
    });
  });

  it("getIndustries returns all industries when overrideShowDisabledIndustries is true", () => {
    const orderdIndustries = orderBy(
      industryJson.industries as Industry[],
      [isIndustryIdGeneric, "name"],
      ["desc", "asc"],
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

  describe("findIndustryByNaicsCode", () => {
    it("returns undefined for empty string", () => {
      expect(findIndustryByNaicsCode("")).toBeUndefined();
    });

    it("returns undefined for a code that does not match any industry", () => {
      expect(findIndustryByNaicsCode("999999")).toBeUndefined();
    });

    it("returns the matching industry for an unambiguous code", () => {
      const autoBodyRepair = LookupIndustryById("auto-body-repair");
      const code = autoBodyRepair.naicsCodes!.replaceAll(/\s/g, "").split(",")[0];
      const result = findIndustryByNaicsCode(code);
      expect(result?.id).toEqual("auto-body-repair");
    });

    it("returns undefined for a code shared by multiple industries", () => {
      // 236118 is shared by commercial-construction and home-contractor
      expect(findIndustryByNaicsCode("236118")).toBeUndefined();
    });

    it("excludes the generic industry from matches", () => {
      // generic industry has no naicsCodes, so any code should not match it
      const generic = LookupIndustryById("generic");
      expect(generic.naicsCodes).toBeFalsy();
      // A code unique to a specific industry should return that industry, not generic
      const autoBodyRepair = LookupIndustryById("auto-body-repair");
      const code = autoBodyRepair.naicsCodes!.replaceAll(/\s/g, "").split(",")[0];
      const result = findIndustryByNaicsCode(code);
      expect(result?.id).not.toEqual("generic");
    });
  });

  describe("special case industry rules", () => {
    it("demo-only should always be disabled", () => {
      expect(LookupIndustryById("demo-only").isEnabled).toBe(false);
    });

    it("industry with the name 'Domestic Employer' should always have the id domestic-employer", () => {
      // Domestic Employer was created for a specific use case and has unique dashboard rendering logic dependent on the industry id
      const domesticEmployerIndustry = getIndustries().find(
        (industry) => industry.name === "Domestic Employer",
      );
      expect(domesticEmployerIndustry?.id).toBe("domestic-employer");
    });
  });
});
