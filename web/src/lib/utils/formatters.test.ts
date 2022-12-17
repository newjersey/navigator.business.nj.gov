import { getDollarValue, getStringifiedAddress } from "@/lib/utils/formatters";

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

  describe("getStringifiedAddress", () => {
    it("turns address into oneline string", () => {
      expect(getStringifiedAddress("1600 Pennsylvania Ave", "Washington", "DC", "00000")).toEqual(
        "1600 Pennsylvania Ave, Washington, DC, 00000"
      );
    });

    it("turns address into oneline string including line2", () => {
      expect(getStringifiedAddress("1600 Pennsylvania Ave", "Washington", "DC", "00000", "Apt 1")).toEqual(
        "1600 Pennsylvania Ave, Apt 1, Washington, DC, 00000"
      );
    });
  });
});
