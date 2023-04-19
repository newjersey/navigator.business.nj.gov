import { getDollarValue } from "@/lib/utils/formatters";

describe("formatters", () => {
  describe("getDollarValue", () => {
    it("formats a number as USD", () => {
      expect(getDollarValue(100)).toEqual("$100.00");
    });

    it("formats a string as USD", () => {
      expect(getDollarValue("100")).toEqual("$100.00");
    });

    it("formats a decimal as USD", () => {
      expect(getDollarValue(".01")).toEqual("$0.01");
    });

    it("returns empty string if string cannot be parsed as number", () => {
      expect(getDollarValue("hello")).toEqual("");
    });
  });
});
