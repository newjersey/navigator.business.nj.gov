import { formatTaxId } from "@/lib/domain-logic/formatTaxId";

describe("splitFullName", () => {
  it("splits at 3, 6, and 9 digits", () => {
    expect(formatTaxId("123")).toEqual("123");
    expect(formatTaxId("123456")).toEqual("123-456");
    expect(formatTaxId("123456789")).toEqual("123-456-789");
    expect(formatTaxId("123456789123")).toEqual("123-456-789/123");
  });
});
