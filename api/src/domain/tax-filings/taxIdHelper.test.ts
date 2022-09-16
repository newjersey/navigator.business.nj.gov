import { generateTaxFilingResults } from "../../../test/factories";
import { dateToShortISO, flattenDeDupAndMapTaxFilings, getTaxIds, reformatTaxId } from "./taxIdHelper";

describe("Tax-Filings Helpers", () => {
  describe("dateToShortISO", () => {
    it("converts m/dd/yyyy to yyyy-mm-dd", () => {
      expect(dateToShortISO("1/12/2020")).toEqual("2020-01-12");
    });
  });

  const taxIdMap: Record<string, string[]> = {
    "cr-1orcnr-11": ["cr-1orcnr-1"],
    "cr-1orcnr-12": ["cr-1orcnr-1"],
    "st-250_350": ["st-250", "st-350"],
    "nj-927_927-w": ["nj-927_927-w", "nj-927-w"],
  };

  describe("getTaxIds", () => {
    it("returns a list of corresponding Id's if found in table", () => {
      expect(getTaxIds("st-250/350", taxIdMap)).toEqual(["st-250", "st-350"]);
    });

    it("returns a reformatTaxId if not found in table", () => {
      expect(getTaxIds("st-250/201", taxIdMap)).toEqual(["st-250_201"]);
    });
  });

  describe("flattenDeDupAndMapTaxFilings", () => {
    const taxIdMap: Record<string, string[]> = {
      "cr-1orcnr-11": ["cr-1orcnr-1"],
      "cr-1orcnr-12": ["cr-1orcnr-1"],
      "st-250_350": ["st-250", "st-350"],
      "nj-927_927-w": ["nj-927_927-w", "nj-927-w"],
    };

    it("merges filings", () => {
      const filings = flattenDeDupAndMapTaxFilings(
        generateTaxFilingResults(["cr-1orcnr-11", "cr-1orcnr-12"]),
        taxIdMap
      );
      const ids = [...new Set(filings.map((i) => i.identifier))];
      expect(ids).toEqual(["cr-1orcnr-1"]);
    });

    it("splits filings", () => {
      const filings = flattenDeDupAndMapTaxFilings(generateTaxFilingResults(["st-250_350"]), taxIdMap);
      const ids = [...new Set(filings.map((i) => i.identifier))];
      expect(ids).toEqual(["st-250", "st-350"]);
    });

    it("adds additional filings", () => {
      const filings = flattenDeDupAndMapTaxFilings(generateTaxFilingResults(["nj-927_927-w"]), taxIdMap);
      const ids = [...new Set(filings.map((i) => i.identifier))];
      expect(ids).toEqual(["nj-927_927-w", "nj-927-w"]);
    });
  });

  describe("reformatTaxId", () => {
    it("replaces forward slashes with underscores", () => {
      expect(reformatTaxId("st-51/451")).toEqual("st-51_451");
    });

    it("strips trailing spaces and replaces spaces with periods", () => {
      expect(reformatTaxId(" st-51 or 451 ")).toEqual("st-51or451");
    });

    it("converts string to lowercase", () => {
      expect(reformatTaxId("ST-51 or 451")).toEqual("st-51or451");
    });

    it("strips newlines characters", () => {
      expect(reformatTaxId("ST-51 or 451\n\n")).toEqual("st-51or451");
    });
  });
});
