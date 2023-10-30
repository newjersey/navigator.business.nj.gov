import { maskTaxId } from "@domain/user/maskTaxId";

describe("taxIdMask", () => {
  it("masks 12 digit taxId", async () => {
    expect(maskTaxId("123456789000")).toEqual("*******89000");
  });

  it("masks 9 digit taxId", async () => {
    expect(maskTaxId("123456789")).toEqual("*****6789");
  });
});
